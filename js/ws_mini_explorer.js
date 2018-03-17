/*

 uses miniNotif. More at :
 https://github.com/TheRolfFR/miniNotif

 uses custoMenu. More at :
 https://github.com/TheRolfFR/custoMenu
 __        __         _     ____                       
 \ \      / /__  _ __| | __/ ___| _ __   __ _  ___ ___ 
  \ \ /\ / / _ \| '__| |/ /\___ \| '_ \ / _` |/ __/ _ \
   \ V  V / (_) | |  |   <  ___) | |_) | (_| | (_|  __/
    \_/\_/ \___/|_|  |_|\_\|____/| .__/ \__,_|\___\___|
                                 |_|                   
            _       _                   _                     
  _ __ ___ (_)_ __ (_)   _____  ___ __ | | ___  _ __ ___ _ __ 
 | '_ ` _ \| | '_ \| |  / _ \ \/ / '_ \| |/ _ \| '__/ _ \ '__|
 | | | | | | | | | | | |  __/>  <| |_) | | (_) | | |  __/ |   
 |_| |_| |_|_|_| |_|_|  \___/_/\_\ .__/|_|\___/|_|  \___|_|   
                                 |_|                          
  
 by TheRolf
 https://github.com/TheRolfFR
 
*/

// get a directory and what it contains
function getDirectory(dir, destination, main = false) {
    if(main) { destination.html('').attr('data-name', 'content').attr('data-src', '/').addClass('context custoMe') }
    var url = window.location.href;
    var parent = url.substring( 0, url.lastIndexOf( "/" ) + 1);
    
    $.get( parent + "access.php", { "folder": dir }, function( data ) {
        if(main) {
            destination.append(data);
        } else {
            destination.addClass('charged');
            destination.after(data); 
        }
    });
    return;
}

var wsmini = new Object({
    clipboard: ['', '',''],
    parenturl: window.location.href.substring( 0, window.location.href.lastIndexOf( "/" ) + 1),
    
    // set element properties to var clipboard
    copy: function() {
        var src = custoMenu.getData('data-src');
        this.clipboard = ['copy', src, ''];
    },
    
    // set element properties to var clipboard
    cut: function() {
        var src = custoMenu.getData('data-src');
        this.clipboard = ['cut', src, custoMenu.element];
    },
    
    // send request to action.php to cut or copy folder/files
    paste: function() {
        var url = wsmini.parenturl + 'action.php';
        var src = this.clipboard[1];
        var dest = custoMenu.getData('data-src');
        var type = this.clipboard[0];
        
                    console.log(wsmini.clipboard[2]);
        
        var params, word, effectued, type;
        if (type == 'copy') {
            word = "Copying items";
            effectued = "Copied";
            params = { 'copy' : src, 'dest' : dest};
        } else {
            word = "Moving items";
            effectued = "Moved";
            params = { 'cut' : src, 'dest' : dest};
        }
        
        var notif = miniNotif.addNotif(0, word, '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="white"><path opacity=".25" d="M16 0 A16 16 0 0 0 16 32 A16 16 0 0 0 16 0 M16 4 A12 12 0 0 1 16 28 A12 12 0 0 1 16 4"/><path d="M16 0 A16 16 0 0 1 32 16 L28 16 A12 12 0 0 0 16 4z"><animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="0.8s" repeatCount="indefinite" /></path></svg>', 'white');
        
        $.get(url, params, function(data){
            miniNotif.done(notif);
            if(data == 'done') {
                miniNotif.addNotif(1, effectued + ' successfully' ,'<i class="material-icons">&#xE876;</i>',"green");
                var parent_attr = custoMenu.getData('data-name');
                if(type == 'cut') {
                    wsmini.folderrefresh(wsmini.clipboard[2]);
                }
                if (parent_attr == 'content') {
                    wsmini.contentrefresh();
                } else {
                    wsmini.folderrefresh(custoMenu.element);
                }
            } else {
                console.log(data);
                miniNotif.addNotif(1, 'An error occured. More infos in console.' ,'<i class="material-icons">&#xE5CD;</i>',"red");
            }
        });
    },
    
    // send request to action.php to delete folder/files
    delete: function() {
        var src = custoMenu.getData('data-src');
        var filename = custoMenu.element.text();
        var parenturl = window.location.href.substring( 0, window.location.href.lastIndexOf( "/" ) + 1);
        
        if(confirm('Are you sure to delete ' + filename + ' ?')) {
            $.get(parenturl + 'action.php', {'delete' : src}, function(data){
                if(data == 'done') {
                    custoMenu.element.closest('li').remove();
                } else {
                    console.log(data);
                    miniNotif.addNotif(1, 'An error occured. More infos in console.' ,'<i class="material-icons">&#xE5CD;</i>',"red");
                }
            });
        }
    },
    
    // refresh content
    contentrefresh: function() {
        getDirectory('/', $('#w_nav'), true);
    },
    
    // refresh folder
    folderrefresh: function(element = "") {
        var destination = (element !== "") ? element : custoMenu.element;
        if(destination.hasClass('charged')) {
            destination.trigger('click').trigger('click');
        }
    },
    
    // send request to action.php to rename folder/file
    rename: function(){
        var parenturl = window.location.href.substring( 0, window.location.href.lastIndexOf( "/" ) + 1);
	    var src = custoMenu.getData('data-src');
        var name = custoMenu.element.text();
        
		var newname = prompt('Choose new name', name);
		
        if(newname !== '') {
            $.get(parenturl + 'action.php', {'rename' : src, 'newname' : newname}, function(data){
                if(data == 'done') {
                    var parent_attr = custoMenu.element.parent().parent().parent().attr('data-name');
                    if (parent_attr == 'content') {
                        wsmini.contentrefresh();
                    } else {
                        wsmini.folderrefresh(custoMenu.element.parent().parent().parent().find('a'));
                    }
                } else {
                    console.log(data);
                    miniNotif.addNotif(1, 'An error occured. More infos in console.' ,'<i class="material-icons">&#xE5CD;</i>',"red");
                }
            });
        }
    },
    
    // send request to action.php to create new file
    newfile: function(){
        var parenturl = window.location.href.substring( 0, window.location.href.lastIndexOf( "/" ) + 1);
        var src = custoMenu.getData('data-src');
        
        var name = prompt('New file: Choose name');
        if(name !== '') {
            $.get(parenturl + 'action.php', {'newfile' : src, 'name' : name}, function(data){
                if(data == 'done') {
                    var parent_attr = custoMenu.element.attr('data-name');
                    if (parent_attr == 'content') {
                        wsmini.contentrefresh();
                    } else {
                        wsmini.folderrefresh();
                    }
                } else {
                    console.log(data);
                    miniNotif.addNotif(1, 'An error occured. More infos in console.' ,'<i class="material-icons">&#xE5CD;</i>',"red");
                }
            });
        }
    },
    
    // send request to action.php to create new folder
    newfolder: function(){
        var parenturl = window.location.href.substring( 0, window.location.href.lastIndexOf( "/" ) + 1);
        var src = custoMenu.getData('data-src');
        
        var name = prompt('New folder: Choose name');
        if(name !== '') {
            $.get(parenturl + 'action.php', {'newfolder' : src, 'name' : name}, function(data){
                if(data == 'done') {
                    var parent_attr = custoMenu.element.attr('data-name');
                    if (parent_attr == 'content') {
                        wsmini.contentrefresh();
                    } else {
                        wsmini.folderrefresh();
                    }
                } else {
                    console.log(data);
                    miniNotif.addNotif(1, 'An error occured. More infos in console.' ,'<i class="material-icons">&#xE5CD;</i>',"red");
                }
            });
        }
    },
    
    // send request to action.php to upload multiple files
    uploadfile: function() {
        var parenturl = window.location.href.substring( 0, window.location.href.lastIndexOf( "/" ) + 1);
        var src = custoMenu.getData('data-src');
        
        if(!$('#fileinput').length) {
            $('<form id="formfile" method="post" enctype="multipart/form-data"><input type="file" id="fileinput" multiple></form>').appendTo('body').hide();
        }
        
        $('#fileinput').trigger('click');
        $('#fileinput').one('change', function(){
            var file_data = $('#fileinput').prop('files')[0];  
            var formData = new FormData($('#formfile')[0]);
            formData.append('src', src);
            console.log(parenturl);
            
            for(var i = 0; i < $('#fileinput').prop('files').length; i++) {
                formData.append("files[]", $('#fileinput').prop('files')[i]);
            }
            
            var notif = miniNotif.addNotif(0, 'Loading', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="white"><path opacity=".25" d="M16 0 A16 16 0 0 0 16 32 A16 16 0 0 0 16 0 M16 4 A12 12 0 0 1 16 28 A12 12 0 0 1 16 4"/><path d="M16 0 A16 16 0 0 1 32 16 L28 16 A12 12 0 0 0 16 4z"><animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="0.8s" repeatCount="indefinite" /></path></svg>', 'white');
            
            $.ajax({
                url: parenturl + 'upload.php', 
                type: 'POST',
                data: formData,
                cache: false,
                processData: false,
                dataType: 'text',   //No I18N
                contentType: false, // Set content type to false as jQuery will tell the server its a query string request
                success: function(data, textStatus, jqXHR) {
                    miniNotif.done(notif);
                    if(data == "done") {
                        miniNotif.addNotif(1, 'Upload succeeded' ,'<i class="material-icons">&#xE876;</i>',"green");
                        var parent_attr = custoMenu.getData('data-name');
                        if (parent_attr == 'content') {
                            wsmini.contentrefresh();
                        } else {
                            wsmini.folderrefresh();
                        }
                    } else {
                        console.log(data);
                        miniNotif.addNotif(1, 'An error occured. More infos in console.' ,'<i class="material-icons">&#xE5CD;</i>',"red");
                    }
                }
            });
            $('#formfile')[0].reset();
        });
    },
    
    // redirect to download.php to download a file
    downloadfile: function() {
        var src = custoMenu.getData('data-src');
        $('<form target="_blank" action="download.php" method="get"><input type="hidden" name="filename" value="' + src + '"></form>').appendTo('body').submit().remove();
    },
    
    // redirect to download a folder
    downloadfolder: function() {
        var src = custoMenu.getData('data-src');
        $('<form target="_blank" action="download_folder.php" method="get"><input type="hidden" name="folder" value="' + src + '"></form>').appendTo('body').submit().remove();
    },
    
    // copy into user clipoard the url of file / folder
    copyurl: function() {
        var src = custoMenu.getData('data-src');
        
        var url = window.location.href;
        var arr = url.split("/");
        var domain = arr[0] + "//" + arr[2];
        
        var val = domain + src;

        var dummy = document.createElement("input");
        document.body.appendChild(dummy);
        dummy.setAttribute("id", "dummy_id");
        dummy.setAttribute('value', val);
        dummy.select();
        document.execCommand("copy");
        document.body.removeChild(dummy)
    }
});

// define context menus
// (if there is no fonction, it was already defined before with the same name)
// (if there is no desc, the desc is equal to the fonction name)

var filectxmenu = {
	name: 'file',
	items: {
		'openfile' : {
			text: '<i class="fa fa-pencil" aria-hidden="true"></i> Open',
			desc: 'Open',
			func: function() {
				openFile(custoMenu.element.attr('data-src'));
			}
		},
		'downloadfile' : { 
			text: '<i class="fa fa-download" aria-hidden="true"></i> Download',
			desc: 'Download',
			func: wsmini.downloadfile
		},
		'copy' : { 
			text: '<i class="fa fa-files-o" aria-hidden="true"></i> Copy',
			func: wsmini.copy
		},
		'cut' : { 
			text: '<i class="fa fa-scissors" aria-hidden="true"></i> Cut',
			func: wsmini.cut
		},
		'delete' : {
			text: '<i class="fa fa-trash" aria-hidden="true"></i> Delete',
			func: wsmini.delete
		},
		'rename' : {
			text: '<i class="fa fa-pencil-square-o" aria-hidden="true"></i> Rename',
			func: wsmini.rename
		},
		'copyurl': {
   		    text: '<i class="fa fa-link" aria-hidden="true"></i> Copy url',
   		    desc: 'Copy url',
		    func: wsmini.copyurl
		}
	}
}
var foldermenu = {
	name: 'folder',
	items: {
		'refresh' : {
			text: '<i class="fa fa-refresh" aria-hidden="true"></i> Refresh',
			func: wsmini.folderrefresh
		},
		'copy' : { 
			text: '<i class="fa fa-files-o" aria-hidden="true"></i> Copy'
		},
		'cut' : { 
			text: '<i class="fa fa-scissors" aria-hidden="true"></i> Cut'
		},
		'paste' : { 
			text: '<i class="fa fa-clipboard" aria-hidden="true"></i> Paste',
			func: wsmini.paste
		},
		'delete' : {
			text: '<i class="fa fa-trash" aria-hidden="true"></i> Delete'
		},
		'rename' : {
			text: '<i class="fa fa-pencil-square-o" aria-hidden="true"></i> Rename'
		},
		'uploadfile' : { 
			text: '<i class="fa fa-upload" aria-hidden="true"></i> Upload',
			desc: 'Upload file',
			func: wsmini.uploadfile
		},
		'newfile' : { 
			text: '<i class="fa fa-file-o" aria-hidden="true"></i> New file',
			desc: 'New file',
			func: wsmini.newfile
		},
		'newfolder' : {
			text: '<i class="fa fa-folder-o" aria-hidden="true"></i> New folder',
			desc: 'New folder',
			func: wsmini.newfolder
		},
		'downloadfolder' :  {
		    text : '<i class="fa fa-download" aria-hidden="true"></i> Download folder',
		    desc: 'Download folder',
		    func: wsmini.downloadfolder
		},
		'copyurl': {
  		    text: '<i class="fa fa-link" aria-hidden="true"></i> Copy url',
   		    desc: 'Copy url',
		    func: wsmini.copyurl
		}
	}
}
var contentmenu = {
	name: 'content',
	items: {
		'contentrefresh' : {
			text: '<i class="fa fa-refresh" aria-hidden="true"></i> Refresh',
			desc: 'Refresh',
			func: wsmini.contentrefresh
		},
		'paste' : { 
			text: '<i class="fa fa-clipboard" aria-hidden="true"></i> Paste',
			func: wsmini.paste
		},
		'uploadfile' : { 
			text: '<i class="fa fa-upload" aria-hidden="true"></i> Upload',
			desc: 'Upload file'
		},
		'newfile' : { 
			text: '<i class="fa fa-file-o" aria-hidden="true"></i> New file',
			desc: 'New file',
			func: wsmini.newfile
		},
		'newfolder' : {
			text: '<i class="fa fa-folder-o" aria-hidden="true"></i> New folder',
			desc: 'New folder',
			func: wsmini.newfolder
		},
		'copyurl': {
  		    text: '<i class="fa fa-link" aria-hidden="true"></i> Copy url',
   		    desc: 'Copy url',
		    func: wsmini.copyurl
		}
	}
}

$(document).ready(function(){

    // start file explorer
    getDirectory('/', $('#w_nav'), true);

    // how to open a folder
    $(document).on('click', '.context.folder:not(.charged)', function(e){
        e.preventDefault();
        var dir = $(this).attr('href');
        getDirectory(dir, $(this)); 
    });
    
    // how to close a folder
    $(document).on('click', '.context.folder', function(e){
        e.preventDefault();
        $(this).removeClass('charged').next().remove();
    });
    
    // how to open a file
    $(document).on('click', '.context.file', function(e){
        e.preventDefault();
        openFile($(this).attr('data-src'));
    });
    
    // load context menus
    custoMenu.addMenu(filectxmenu);
    custoMenu.addMenu(contentmenu);
    custoMenu.addMenu(foldermenu);
    
    // init notifications
    miniNotif.init();
});