let WorkSpace = {
    list: {},
    tabElement: undefined,
    tabList: undefined,
    explorer: undefined,
    editor: undefined,
    chargedFolders: { "": {}},
    aceEditor: undefined,
    activeEditor: -1,
    maxEditor: 0,
    vueTabs: undefined,
    
    init: function(aceEditor, callback) {
        this.vueTabs = new Vue({
            el: '#app',
            data: () => ({
                drawer: false,
                snackbar: false,
                snackbarText: "",
                color: "#0060ac",
                explorer: {},
                explorerElement: undefined,
                editors: {
                    aceEditor: undefined,
                    element: undefined,
                    list: [],
                    activeEditor: -1
                },
                prompt: {
                    see: false,
                    text: '',
                    submitText: '',
                    value: '',
                    callback: function() {}
                },
                confirm: {
                    see: false,
                    title: '',
                    text: '',
                    cbk: function(value){
                        this.see = false;
                        this.callback(value);
                    },
                    callback: function() {}
                },
                settings: {
                    dialog: false,
                    nightTheme: true,
                    version: '0.0.0',
                    onlineversion: '0.0.0',
                    rules: {
                        password: [v => !!v || 'A value is required']
                    }
                }
            }),
            mounted: function() {
                // initialize
                this.editors.aceEditor = aceEditor;
                this.editors.element = document.getElementById('editor');
                this.explorerElement = document.getElementById('explorer');
                this.drawer = this.$vuetify.breakpoint.lgAndUp;
                this.$nextTick(function(){
                    this.adjustEditor();
                    this.loadSave();
                    callback();
                })
            },
            methods: {
                activeEditor: function(dir) {
                    // active editor
                    WorkSpace.activeEditor(dir);
                },
                adjustEditor: function() {
                    // adjust editor style
                    this.editors.aceEditor.renderer.setShowGutter(this.$vuetify.breakpoint.lgAndUp);
                    if(this.$vuetify.breakpoint.lgAndUp) {
                       this.editors.element.classList.add('desktop');
                    } else {
                       this.editors.element.classList.remove('desktop');
                    }
                },
                checkKeys: function(object, parameters) {
                    // check if an object has all the required keys
                    let isOkay = true, i = 0;
                    while(i < parameters.length && isOkay) {
                        isOkay = parameters[i] in object && object[parameters[i]] != undefined && object[parameters[i]] != null;
                        
                        i++;
                    }
                    return isOkay;
                },
                closeEditor: function(id) {
                    // close an editor
                    const index = this.editors.list.findIndex(function(editor) { return editor.id == id});
                    let editors = this.editors.list;
                    
                    editors.splice(index, 1);
                    
                    this.editors.list = editors;
                    WorkSpace.saveWS();
                },
                getActiveEditor: function() {
                    // return the active editor !!! USEFUL !!!
                    const arr = this.editors.list.filter(ed => ed.directory == this.editors.activeEditor);
                    if(arr.length != 0) {
                        return arr[0];
                    }
                    return undefined;
                },
                getVersions: function(callback = undefined) {
                    // get local version of WorkSpace
                    getRequest('version.txt', {}, (data, err) => {
                        this.settings.version = (err) ? "Unknown version" : data;
                        // get online version of WorkSpace
                        getRequest('https://raw.githubusercontent.com/TheRolfFR/WorkSpace/master/version.txt', {}, (data, err) => {
                            this.settings.onlineversion = (err) ? "Unknown version" : data;
                            if(callback) {
                                // callback if needed
                                callback();
                            }
                        })
                    })
                },
                loadSave: function() {
                    // try to get a response
                    getJSON('savetabs.json', (err, response) => {
                        if(err) { // consider no save if cant find
                            response = {};
                        }
                        
                        // night theme
                        if('nightTheme' in response && typeof(response.nightTheme) == 'boolean') {
                            this.settings.nightTheme = response.nightTheme;
                        }
                        
                        // keep track of all loaded editors
                        let loadedEditors = []; // used not to reopen a file
                        
                        if('editors' in response) {
                            for(let i in response.editors) {
                                // load if got all parameters and not loaded
                                if(this.checkKeys(response.editors[i], ['cursor', 'directory', 'active']) && loadedEditors.findIndex((ed) => { return ed.directory == response.editors[i].directory }) == -1) {
                                    console.log(response.editors[i]);
                                    loadedEditors.push(response.editors[i]);
                                }
                            }
                        }
                        
                        console.log(loadedEditors);
                        
                        // load each file
                        this.$nextTick(() => {
                            for(let i in loadedEditors) {
                                WorkSpace.loadFile(loadedEditors[i].directory, i, loadedEditors[i].cursor, loadedEditors.active);
                            }
                        })
                        
                        // explorer part
                        postRequest('access.php', {loadsave: JSON.stringify(response.explorer) }, (response, err) => {
                            let json;
                            try {
                                json = JSON.parse(response);
                            } catch(e) {
                                WorkSpace.handleError(response.responseText);
                                console.error(e, response);
                                return;
                            }
                            
                            Vue.set(this, 'explorer', json);
                            WorkSpace.setExplorer(this.explorerElement, json);
                            WorkSpace.saveWS();
                        });
                    });
                },
                logout: function() {
                    window.location.href +="?logout";
                },
                openGithub: function() {
                    // or open a popup
                    let win = window.open('https://bit.ly/workspace-github', '_blank');
                    win.focus();
                },
                openSettings: function() {
                    this.getVersions(() => {
                        this.settings.dialog = true;
                    });
                },
                push: function(context, key, val) {
                    let arr = context[key];
                    arr.push(val);
                    Vue.set(context, key, arr);
                },
                switchEditor: function(id = -1) {
                    WorkSpace.activeEditor(id);
                },
                update: function(key, val, index = -1) {
                    if(index == -1) {
                        let temp = this[key];
                        for(attribute in val) {
                            temp[attribute] = val[attribute];
                        }
                        this[key] = temp;
                    } else {
                        let temp = this[key][index];
                        for(attribute in val) {
                            temp[attribute] = val[attribute];
                        }
                        this[key][index] = temp;
                    }
                }
            },
            computed: {
                activeEditorName: function() {
                    return (this.editors.list.length != 0 && this.editors.activeEditor != -1) ? this.getActiveEditor().filename : '';
                },
                colorTheme: function() {
                    return (this.settings.nightTheme) ? "#222" : this.color;
                }
            },
            watch: {
               '$vuetify.breakpoint.lgAndUp': function () {
                   this.adjustEditor();
               },
               'settings.nightTheme': function(value) {
                    if(value) {
                        if(this.editors.aceEditor.getTheme() == "ace/theme/kuroir") {
                            this.editors.aceEditor.setTheme("ace/theme/pastel_on_dark");
                        }
                    } else {
                        if(this.editors.aceEditor.getTheme() == "ace/theme/pastel_on_dark") {
                            this.editors.aceEditor.setTheme("ace/theme/kuroir");
                        }
                    }
                    WorkSpace.saveWS();
               }
            }
        })
    },
    
    loadFile: function(directory, index, cursor = { row: 0, column: 0 }, activeEditor = true) {
        let that = this;
        let filename = directory.split('/').pop();
        
        postRequest('access.php', { file : directory }, function(response, err){
            
            // other result than JSON
            let json;
            try {
                json = JSON.parse(response);
            } catch(err) {
                that.handleError(response.responseText);
                console.error('error ' + response.status + ' : ', response);
                return;
            }
            
            if(json[0].substr(0,4) == "text" || json[0].substr(0,5) == "inode") {
                // add editor to list
                let mime = json[0].split('/').pop();
                console.log(mime);
                switch(mime) {
                    case "plain":
                        mime = "";
                        break;
                    case "md":
                        mime = "markdown";
                    default:
                        break;
                }
                const mode = "ace/mode/" + mime;
                
                // push to editors list
                WorkSpace.vueTabs.push(WorkSpace.vueTabs.editors, 'list', {
                    directory: directory,
                    EditSession: new ace.createEditSession(json[1], mode),
                    filename: filename,
                    cursor: cursor,
                    mime: mime
                });
                
                that.saveWS();
                
                WorkSpace.vueTabs.$nextTick(function(){
                    this.$refs.tabs[this.$refs.tabs.length - 1].click();
                });
            } else {
                // or open a popup
                let win = window.open(directory, '_blank');
                win.focus();
            }
        });
    },

    setExplorer: function(element, json) {
        element.appendHTML("<ol></ol>");
        element = element.querySelector("ol");
        
        let foldername;
        let currentFolder;
        let i;
        for(let key in json.folder) {
            if(typeof(json.folder[key]) == "string") {
                element.appendHTML('<li><a class="folder context custoMe" href="' + key + '" data-name="folder" data-src="' + key + '">' + json.folder[key] + '</a></li>');
            } else {
                // display the charged folder
                foldername = key.split('/');
                foldername.pop();
                currentFolder = this.chargedFolders; 
                i = 0;
                while(foldername[i] in currentFolder) {
                    currentFolder = currentFolder[foldername[i]];
                    i++;
                }
                foldername = foldername[i];
                
                currentFolder[foldername] = {};
                
                foldername = key.split('/');
                element.appendHTML('<li><a class="folder charged context custoMe" href="' + key + '" data-name="folder" data-src="' + key + '">' + foldername[foldername.length - 2] + '</a></li>');
                this.setExplorer(element.lastElementChild, json.folder[key]);
            }
        }
        
        let ext;
        for(let i = 0; i < json.file.length; i++) {
            for(let key in json.file[i]) {
                ext = json.file[i][key].split('.');
                ext = ext[ext.length-1];
                element.appendHTML('<li><a class="file context custoMe ' + ext + '" href="' + key + '" data-name="file" data-src="' + key + '" data-ext="' + ext + '">' + json.file[i][key] + '</a></li>');
            }
        }
    },
    
    loadExplorer: function(directory, destination) {
        var that = this;
        postRequest('access.php', {loadfolder: directory}, function(response, err){
            // remove charging class does not tell if it was successful
            destination.classList.remove('charging');
            
            // try to parse JSON
            let json;
            try {
                json = JSON.parse(response);
            } catch (e) {
                console.error(response);
                return;
            }
            
            // if so it is charged
            destination.classList.add('charged');
            // add content to explorer
            that.setExplorer(destination.parentElement, json);
            
            // add in charged folders
            let directories = directory.split('/');
            directories.pop();
            let currentFolder = that.chargedFolders;
            let i = 0;
            while(directories[i] in currentFolder) {
                currentFolder = currentFolder[directories[i]];
                i++;
            }
            
            directories = directories[i];
            
            currentFolder[directories] = {};
            that.saveWS();
        });
    },
    
    activeEditor: function(directory) {
        // empty list error
        if(this.vueTabs.editors.list.length == 0) {
            this.vueTabs.editors.editor.style.display = "none";
            this.handleError("Empty list");
            return;
        }
        
        // not in the list
        let list = this.vueTabs.editors.list.filter(ed =>ed.directory == directory);
        if(list.length == 0) {
            this.handleError(directory + " not in the editors list");
            return;
        }
        
        let activeEditor = this.vueTabs.getActiveEditor();
        
        // previous editor
        if(activeEditor != undefined) {
            activeEditor.EditSession = this.vueTabs.editors.aceEditor.getSession();
            activeEditor.cursor = this.vueTabs.editors.aceEditor.getCursorPosition();
        }
        
        // new editor
        if(this.vueTabs.editors.list.length != 0) {
            this.vueTabs.editors.activeEditor = directory;
            this.vueTabs.editors.element.style.display = 'block';
        
        
            this.vueTabs.$nextTick(function() {
                activeEditor = this.getActiveEditor();
                
                this.editors.aceEditor.setSession(activeEditor.EditSession);
                this.editors.aceEditor.gotoLine(activeEditor.cursor.row+1, activeEditor.cursor.column, false);
                this.editors.aceEditor.scrollToRow(activeEditor.cursor.row+1);
                this.editors.aceEditor.focus();
            })
        } else  {
            this.vueTabs.editors.activeEditors = -1;
            this.vueTabs.editors.element.style.display = 'none';
        }
    },
    
    switchTab: function(index) {
        this.vueTabs.$refs.tabs[index].$el.click();
    },
    
    getActiveEditor: function() {
        for(let key in this.vueTabs.editors.list) {
            if(this.vueTabs.editors.list[key].directory == this.vueTabs.editors.activeEditor) {
                return key;
            }
        }
        return undefined;
    },
    
    openInExplorer: function(target) {
        if(target.classList.contains('file')) {
            // do not load if alreasy loaded
            const dir = target.getAttribute('data-src');
            const index = this.vueTabs.editors.list.findIndex(function(editor) { return editor.directory == dir});
            if(index != -1) {
                this.switchTab(index);
            } else {
                this.loadFile(dir, this.vueTabs.editors.list.length);
            }
        } else if(target.classList.contains('folder') && !target.classList.contains('charging')) {
            if(target.classList.contains('charged')) {
                
                // delete from charged folders this folder
                let directories = target.getAttribute('data-src').split('/');
                directories.pop();
                let lastdir = directories.pop();
                let currentFolder = this.chargedFolders;
                
                let i = 0;
                while(directories[i] in currentFolder) {
                    currentFolder = currentFolder[directories[i]];
                    i++;
                }
                delete currentFolder[lastdir];
            
                // remove class
                target.classList.remove('charged');
                // remove list ol
                target.parentElement.lastElementChild.remove();
                this.saveWS();
            } else {
            // change to charging icon
                target.classList.add('charging');
                this.loadExplorer(target.getAttribute('data-src'), target);
            }
        }
    },
    
    saveFile: function() {
        let that = this;
        this.vueTabs.editors.list[this.getActiveEditor()].EditSession = this.vueTabs.editors.aceEditor.getSession();
        postRequest("save.php", { dir : this.vueTabs.editors.list[this.getActiveEditor()].directory, content: this.vueTabs.editors.list[this.getActiveEditor()].EditSession.getValue() }, function(response, err){
            if(err) {
                that.handleError(response.responseText);
                console.error("error " + err + " : ", response);
                return;
            }
            // send good response
            if(response == 'done') {
                that.vueTabs.snackbar = true;
                that.vueTabs.snackbarText = "File saved";
                miniNotif.addNotif({
                    text: 'File saved',
                    icon: '<i class="fas fa-save"></i>',
                    color: 'green'
                });
                that.saveWS();
            }
        });
    },
    
    saveWS: function() {
        // editors
        const activeEditor = (this.getActiveEditor() != undefined) ? this.vueTabs.editors.list[this.getActiveEditor()].directory : '';
        let savedEditors = [], isActiveEditor;
        for(let i in this.vueTabs.editors.list) {
            isActiveEditor = this.vueTabs.editors.activeEditor == this.vueTabs.editors.list[i].directory;
            savedEditors.push({
                cursor:  (isActiveEditor) ? this.vueTabs.editors.aceEditor.getCursorPosition() : this.vueTabs.editors.list[i].cursor,
                directory:  this.vueTabs.editors.list[i].directory,
                active: isActiveEditor
            })
        }
        
        // explorer + nightTheme
        let json = {
            explorer: {
                ".." : this.chargedFolders[""]
            },
            nightTheme : this.vueTabs.settings.nightTheme,
            editors: savedEditors
        };
        
        // save tabs
        postRequest("savetabs.php", {json : JSON.stringify(json)}, (response, err) => {
            if(err) {
                this.handleError(response.responseText);
                console.error("error " + response.status + " : " + response.responseText);
                return;
            } else {
                console.log("WorkSpace saved.");
            }
        });
    },
    
    handleError: function(error) {
        if(error == 'not connected') {
            let url = window.location.href.split('/');
            url.pop();
            window.location.href = url.join('/');
        } else {
            console.error(error);
            miniNotif.addNotif({
                process: false,
                text: "An error occured, please check console for more details.",
                color: 'red',
                icon: '<i class="fas fa-exclamation-circle"></i>'
            })
        }
    }
};