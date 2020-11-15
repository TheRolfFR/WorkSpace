let WorkSpaceExplorer = new Object({
    thecolor: "#0094d2",
    clipboard: ['', '',''],
    
    // set element properties to vairiable clipboard
    copy: function() {
        this.clipboard = ['copy', custoMenu.getData('data-src'), ''];
        console.log(this);
        miniNotif.addNotif({
            color: this.thecolor,
            text: 'Copied',
            icon: '<i class="fas fa-copy"></i>'
        });
    },
    
    // set element properties to vairiable clipboard
    cut: function() {
        this.clipboard = ['cut', custoMenu.getData('data-src'), custoMenu.element];
        miniNotif.addNotif({
            color: this.thecolor,
            text: 'Cut',
            icon: '<i class="fas fa-cut"></i>'
        });
    },
    
    // send request to action.php to cut or copy folder/files
    paste: function() {
        let src = this.clipboard[1];
        let dest = custoMenu.getData('data-src');
        let type = this.clipboard[0];
        
        // handling bad uses
        if(type != 'copy' && type != 'cut' && custoMenu.element == undefined) {
            return;
        }
        
        let params, word, effectued;
        if (type == 'copy') {
            word = "Copying items";
            effectued = "Copied";
            params = { 'copy' : src, 'dest' : dest};
        } else {
            word = "Moving items";
            effectued = "Moved";
            params = { 'cut' : src, 'dest' : dest};
        }
        
        const notif = miniNotif.addNotif({
            color: this.thecolor,
            process: false,
            text: word,
            icon: '<i class="fas fa-circle-notch fa-spin"></i>'
        });
        console.log(notif);
        
        postRequest('action.php', params, function(response, err) {
            //hide previous notification
            miniNotif.done(notif);
            
            if(err || response != 'done') {
                WorkSpace.handleError(response);
                return;
            }
            
            // displaying successful action
            miniNotif.addNotif({
                text: effectued + ' successfully',
                icon: '<i class="fas fa-check"></i>',
                color: 'green'
            });
            
            // refresh the folder if cut action
            if(type == 'cut') {
                const destinationtype = custoMenu.getData('data-name');
                if(destinationtype == 'content') {
                    WorkSpace.loadExplorer('/', WorkSpace.explorer);
                } else {
                    console.log(clpiboard[1], custoMenu.element);
                    WorkSpace.loadExplorer(custoMenu.getData('data-src'), custoElement.element);
                }
            }
        });
    },
    
    // send request to action.php to delete folder/files
    delete: function() {
        let src = custoMenu.getData('data-src');
        let filename = custoMenu.element.innerText;
        
        WorkSpace.update('confirm', {
            see: true,
            title: 'Delete file?',
            text: 'Are you sure to delete ' + filename + '?',
            submitText: 'Delete',
            callback: function(value) {
                if(value) {
        
                    const notifobj = {
                        color: this.bluecolor,
                        process: false,
                        text: 'Deleting item',
                        icon: '<i class="fas fa-circle-notch fa-spin"></i>'
                    }
                    const notif = miniNotif.addNotif(notifobj);
                    
                    postRequest('action.php', { delete: src }, function(response, err){
                        //hide previous notification
                        miniNotif.done(notif);
                        
                        // handle errors
                        if(err || response != 'done') {
                            WorkSpace.handleError(response);
                            return;
                        }
                        
                        // display successfull deletion
                        miniNotif.addNotif({
                            text: 'Deleted successfully',
                            icon: '<i class="fas fa-check"></i>',
                            color: 'green'
                        });
                        
                        // delete it in explorer
                        custoMenu.element.parentElement.remove();
                    });
                }
            }
        });
    },
    
    copyUrl: function() {
        const src = custoMenu.getData('data-src');
        
        const url = window.location.href;
        const arr = url.split("/");
        const domain = arr[0] + "//" + arr[2];
        
        let val = domain + src;

        let dummy = document.createElement("input");
        document.body.appendChild(dummy);
        dummy.setAttribute("id", "dummy_id");
        dummy.setAttribute('value', val);
        dummy.select();
        document.execCommand("copy");
        document.body.removeChild(dummy)
    },
    
    downloadFolder: function() {
        const src = custoMenu.getData('data-src');
        document.body.appendHTML('<form target="_blank" action="download_folder.php" method="get"><input type="hidden" name="folder" value="' + src + '"></form>')
        document.body.lastElementChild.submit();
        document.body.lastElementChild.remove();
    },
    
    downloadFile: function() {
        const src = custoMenu.getData('data-src');
        document.body.appendHTML('<form target="_blank" action="download.php" method="get"><input type="hidden" name="filename" value="' + src + '"></form>')
        document.body.lastElementChild.submit();
        document.body.lastElementChild.remove();
    },
    
    openFile: function() {
        WorkSpace.loadFile(custoMenu.getData('data-src'))
    },
    
    rename: function(){
	    const src = custoMenu.getData('data-src');
        const name = custoMenu.element.innerText;
        
        Vue.set(WorkSpace, 'prompt', {
            see: true,
            text: 'Choose a new name',
            value: name,
            submitText: 'Rename',
            callback: function(newname) {
                WorkSpace.prompt.see = false;
                postRequest('action.php', {'rename' : src, 'newname' : newname}, function(response, err){
                    if(response == 'done') {
                        custoMenu.element.classList.remove(name.split('.').pop());
                        const newadress = custoMenu.element.attributes.href.value.replace(name, newname)
                        custoMenu.element.setAttribute('href', newadress)
                        custoMenu.element.setAttribute('data-src', newadress)
                        custoMenu.element.innerText = newname;
                        
                        if(newname.indexOf('.') != -1) {
                            const ext = newname.split('.').pop()
                            custoMenu.element.classList.add(ext)
                            custoMenu.element.setAttribute('data-ext', ext)
                        }
                        miniNotif.addNotif({
                            color: 'green',
                            text: 'File successfully renamed',
                            icon: '<i class="fas fa-check"></i>'
                        })
                    } else {
                        console.log(response);
                        miniNotif.addNotif(1, 'An error occured. More infos in console.' ,'<i class="material-icons">&#xE5CD;</i>',"red");
                    }
                });
            }
        });
    },
    
    newFolder: function(){
        const src = custoMenu.getData('data-src');
        
        WorkSpace.update('prompt', {
            see: true,
            text: 'New folder: Choose a name',
            label: 'Name',
            value: '',
            submitText: "Create",
            callback: function(name) {
                this.see = false;
                postRequest('action.php', {'newfolder' : src, 'name' : name}, function(res, err){
                    if(res == 'done') {
                        miniNotif.addNotif({
                            color: 'green',
                            text: 'Folder successfully created',
                            icon: '<i class="fas fa-check"></i>'
                        })
                    } else {
                        console.log(res, err);
                        miniNotif.addNotif({
                            process: false,
                            color: 'red',
                            text: 'An error occured. More infos in console.',
                            icon: '<i class="material-icons">&#xE5CD;</i>',
                        });
                    }
                });
            }
        })
    },
    
    newFile: function(){
        const src = custoMenu.getData('data-src');
        const el = custoMenu.element;
        
        WorkSpace.update('prompt', {
            see: true,
            text: 'New file: Choose a name',
            label: 'Name',
            value: '',
            submitText: "Create",
            callback: function(name) {
                this.see = false;
                postRequest('action.php', {'newfile' : src, 'name' : name}, function(res, err){
                    if(res == 'done') {
                        if(el.classList.contains("charged")) {
                            el.click();
                            el.click();
                        }
                        miniNotif.addNotif({
                            color: 'green',
                            text: 'File successfully renamed',
                            icon: '<i class="fas fa-check"></i>'
                        })
                    } else {
                        console.log(res, err);
                        miniNotif.addNotif({
                            process: false,
                            color: 'red',
                            text: 'An error occured. More infos in console.',
                            icon: '<i class="material-icons">&#xE5CD;</i>',
                        });
                    }
                });
            }
        })
    },
    
    uploadFile: function() {
        const src = custoMenu.getData('data-src');
        const el = custoMenu.element;
        
        if(document.getElementById('fileinput') == null) {
            document.body.appendHTML('<form id="formfile" method="post" enctype="multipart/form-data"><input type="file" id="fileinput" multiple style="display: none;"></form>');
        }
        
        document.getElementById('fileinput').click();
        document.getElementById('fileinput').addEventListener('change', function(){
            let formData = new FormData(document.getElementById('formfile'));
            formData.append('src', src);
            
            for(var i = 0; i < document.getElementById('fileinput').files.length; i++) {
                formData.append("files[]", document.getElementById('fileinput').files[i]);
            }
            
            let notif = miniNotif.addNotif({
                process: false,
                text: 'Loading',
                color: 'white',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="white"><path opacity=".25" d="M16 0 A16 16 0 0 0 16 32 A16 16 0 0 0 16 0 M16 4 A12 12 0 0 1 16 28 A12 12 0 0 1 16 4"/><path d="M16 0 A16 16 0 0 1 32 16 L28 16 A12 12 0 0 0 16 4z"><animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="0.8s" repeatCount="indefinite" /></path></svg>'
            })
            
            let xhr = new XMLHttpRequest();
            
            xhr.open("POST", 'upload.php');
            xhr.send(formData);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    if(xhr.response == "done") {
                        if(el.classList.contains("charged")) {
                            el.click();
                            el.click();
                        }
                        miniNotif.addNotif({
                            color: 'green',
                            text: 'Files successfully uploaded',
                            icon: '<i class="fas fa-check"></i>'
                        })
                        miniNotif.done(notif);
                    }
                } else if(xhr.readyState === 4 && xhr.status !== 200) {
                    console.log(xhr);
                    miniNotif.addNotif({
                        process: false,
                        color: 'red',
                        text: 'An error occured. More infos in console.',
                        icon: '<i class="material-icons">&#xE5CD;</i>',
                    });
                }
            };
            document.getElementById('formfile').reset();
        });
    },
    
    refresh: function() {
        WorkSpace.openInExplorer(custoMenu.element);
        WorkSpace.openInExplorer(custoMenu.element);
    }
});
let filectxmenu = {
	name: 'file',
	items: {
		'openfile' : {
			text: '<i class="fas fa-file-signature"></i> Open',
			desc: 'Open',
            func: function() {
                WorkSpaceExplorer.openFile()
            }
		},
		'downloadfile' : { 
			text: '<i class="fa fa-download" aria-hidden="true"></i> Download',
			desc: 'Download',
            func: function() {
                WorkSpaceExplorer.downloadFile()
            }
		},
		'copy' : { 
			text: '<i class="fa fa-files-o" aria-hidden="true"></i> Copy',
			func: function() {
			    WorkSpaceExplorer.copy();
			}
		},
		'cut' : { 
			text: '<i class="fa fa-scissors" aria-hidden="true"></i> Cut',
			func: function() {
			    WorkSpaceExplorer.cut();
			}
		},
		'delete' : {
			text: '<i class="fa fa-trash" aria-hidden="true"></i> Delete',
			func: function() {
			    WorkSpaceExplorer.delete();
			}
		},
		'rename' : {
			text: '<i class="fa fa-pencil-square-o" aria-hidden="true"></i> Rename',
            func: function() {
               WorkSpaceExplorer.rename()
            }
		},
        'copyurl': {
            text: '<i class="fa fa-link" aria-hidden="true"></i> Copy url',
            desc: 'Copy url',
            func: function() {
               WorkSpaceExplorer.copyUrl()
            }
        }
	}
};
let foldermenu = {
	name: 'folder',
	items: {
		'refresh' : {
			text: '<i class="fa fa-refresh" aria-hidden="true"></i> Refresh',
			func: function() {
			    WorkSpaceExplorer.refresh()
			}
		},
		'copy' : { 
			text: '<i class="fa fa-files-o" aria-hidden="true"></i> Copy',
			func: function() {
			    WorkSpaceExplorer.copy()
			}
		},
		'cut' : { 
			text: '<i class="fa fa-scissors" aria-hidden="true"></i> Cut',
			func: function() {
			    WorkSpaceExplorer.cut()
			}
		},
		'paste' : { 
			text: '<i class="fa fa-clipboard" aria-hidden="true"></i> Paste',
			func: function() {
                WorkSpaceExplorer.paste()
			}
		},
		'delete' : {
			text: '<i class="fa fa-trash" aria-hidden="true"></i> Delete',
			func: function() {
			    WorkSpaceExplorer.delete()
			}
		},
		'rename' : {
			text: '<i class="fa fa-pencil-square-o" aria-hidden="true"></i> Rename'
		},
		'uploadfile' : { 
			text: '<i class="fa fa-upload" aria-hidden="true"></i> Upload',
			desc: 'Upload file',
            func: function() {
                WorkSpaceExplorer.uploadFile()
            }
		},
		'newfile' : { 
			text: '<i class="fas fa-file-medical"></i> New file',
			desc: 'New file',
            func: function() {
                WorkSpaceExplorer.newFile()
            }
		},
		'newfolder' : {
			text: '<i class="fas fa-folder-plus"></i> New folder',
			desc: 'New folder',
            func: function() {
                WorkSpaceExplorer.newFolder()
            }
		},
		'downloadfolder' :  {
            text : '<i class="fa fa-download" aria-hidden="true"></i> Download folder',
            desc: 'Download folder',
            func: function() {
                WorkSpaceExplorer.downloadFolder()
            }
		},
		'copyurl': {
            text: '<i class="fa fa-link" aria-hidden="true"></i> Copy url',
            desc: 'Copy url',
            func: function() {
                WorkSpaceExplorer.copyUrl()
            }
		}
	}
};
let contentmenu = {
	name: 'content',
	items: {
		'contentrefresh' : {
			text: '<i class="fa fa-refresh" aria-hidden="true"></i> Refresh',
			desc: 'Refresh',
			func: function() {
			    console.log('refresh')
			}
		},
		'paste' : { 
			text: '<i class="fa fa-clipboard" aria-hidden="true"></i> Paste',
			func: function() {
                WorkSpaceExplorer.paste()
			}
		},
		'uploadfile' : { 
			text: '<i class="fa fa-upload" aria-hidden="true"></i> Upload',
			desc: 'Upload file',
            func: function() {
                WorkSpaceExplorer.uploadFile()
            }
		},
		'newfile' : { 
			text: '<i class="fas fa-file-medical"></i> New file',
			desc: 'New file',
            func: function() {
                WorkSpaceExplorer.newFile()
            }
		},
		'newfolder' : {
			text: '<i class="fas fa-folder-plus"></i> New folder',
			desc: 'New folder',
            func: function() {
                WorkSpaceExplorer.downloadFolder()
            }
		},
		'copyurl': {
            text: '<i class="fa fa-link" aria-hidden="true"></i> Copy url',
            desc: 'Copy url',
            func: function() {
                WorkSpaceExplorer.copyUrl()
            }
		}
	}
};