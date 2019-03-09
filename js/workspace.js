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
                    nightTheme: false,
                    version: '0.0.0',
                    onlineversion: '0.0.0',
                    rules: {
                        password: [v => !!v || 'A value is required']
                    }
                }
            }),
            mounted: function() {
                console.log('mounted');
                
                
                this.getVersions();
                Vue.set(this.editors, 'aceEditor', aceEditor);
                /*
                Vue.set(this.editors, 'element' ,document.getElementById('editor'));
                /*
                Vue.set(this, 'drawer', this.$vuetify.breakpoint.lgAndUp);
                /*
                this.explorerElement = document.getElementById('explorer');
                    
                    
                /*this.$nextTick(function() {
                    this.adjustEditor();
                    this.loadSave();
                    callback();
                  })*/
            },
            methods: {
                switchEditor: function(id = -1) {
                    //WorkSpace.activeEditor(id);
                },
                logout: function() {
                    window.location.href +="?logout";
                },
                adjustEditor: function() {
                    this.editors.aceEditor.renderer.setShowGutter(this.$vuetify.breakpoint.lgAndUp);
                    if(this.$vuetify.breakpoint.lgAndUp) {
                       this.editors.element.classList.add('desktop');
                    } else {
                       this.editors.element.classList.remove('desktop');
                    }
                },
                loadSave: function() {
                    getJSON('savetabs.json', (err, response) => {
                        if(err) { // error handling
                            response = {};
                        }
                        
                        // night theme
                        if('nightTheme' in response && typeof(response.nightTheme) == 'boolean') {
                            Vue.set(this.settings, 'nightTheme', response.nightTheme);
                        }
                        
                        // keep track of all loaded editors
                        let loadededitors = []; // used not to reopen a file
                        /*
                        if('editors' in response) {
                            for(let i = 0; i < response.editors.length; i++) {
                                // load if not loaded
                                if(loadededitors.indexOf(response.editors[i].directory) == -1) {
                                    loadededitors.push(response.editors[i].directory);
                                    Vue.nextTick(function(){
                                        console.log(response.editors[i].directory, response.editors[i]);
                                        WorkSpace.loadFile(response.editors[i].directory, i, response.editors[i].cursor, response.editors[i].directory == response.activeEditor);
                                    })
                                }
                            }
                        }*/
                        
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
                closeEditor: function(id) {
                    const index = this.editors.findIndex(function(editor) { return editor.id == id});
                    let editors = this.editors;
                    
                    editors.splice(index, 1);
                    
                    Vue.set(this, 'editors', editors);
                    WorkSpace.saveWS();
                },
                push: function(key, val) {
                    let arr = this[key];
                    arr.push(val);
                    Vue.set(this, key, arr);
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
                },
                getVersions: function() {
                    getRequest('version.txt', {}, (data, err) => {
                        this.settings.version = (err) ? "Unknown version" : data;
                    })
                    getRequest('https://raw.githubusercontent.com/TheRolfFR/WorkSpace/master/version.txt', {}, (data, err) => {
                        this.settings.onlineversion = (err) ? "Unknown version" : data;
                    })
                }
            },
            computed: {
                activeEditorName: function() {
                    let filtered = this.editors.list.filter(tab => tab.id == this.editors.activeEditor);
                    return (this.editors.list.length != 0) ? filtered[0].filename : '';
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
                        if(this.aceEditor.getTheme() == "ace/theme/kuroir") {
                            this.aceEditor.setTheme("ace/theme/pastel_on_dark");
                        }
                    } else {
                        if(this.aceEditor.getTheme() == "ace/theme/pastel_on_dark") {
                            this.aceEditor.setTheme("ace/theme/kuroir");
                        }
                    }
               },
               'editors': {
                    handler: function (val, oldVal) {
                        
                    },
                    deep: true
               }
            }
        })
    },
    
    loadFile: function(directory, index, cursor = { row: 0, column: 0 }, activeEditor = true) {
        let that = this;
        let filename = directory.split('/').pop();
        
        postRequest('access.php', { file : directory }, function(response, err){
            
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
                const mime = json[0].split('/').pop();
                
                WorkSpace.vueTabs.push('editors', {
                    directory: directory,
                    EditSession: new ace.createEditSession(json[1], "ace/mode/" + mime),
                    filename: filename,
                    cursor: cursor,
                    mime: mime
                });
                
                that.activeEditor(WorkSpace.vueTabs.editors.length - 1);
                that.saveWS();
            } else {
                // or open a popup
                document.body.appendHTML('<form target="_blank" action="' + directory + '" method="get" id="popup"></form>');
                document.getElementById('popup').submit();
                document.getElementById('popup').remove();
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
    
    activeEditor: function(index) {
        if(this.vueTabs.editors.length == 0) {
            this.vueTabs.editor.style.display = "none";
            return;
        }
        
        this.vueTabs.editor.style.display = 'block';
        
        // previous editor
        if(this.vueTabs.activeEditor != -1) {
            this.vueTabs.editors[this.vueTabs.activeEditor].EditSession = this.vueTabs.aceEditor.getSession();
            this.vueTabs.editors[this.vueTabs.activeEditor].cursor = this.vueTabs.aceEditor.getCursorPosition();
        }
        
        // new editor
        this.vueTabs.activeEditor = index;
        
        /*
        Vue.nextTick(() => {
            this.vueTabs.aceEditor.setSession(this.vueTabs.editors[index].EditSession);
            this.vueTabs.aceEditor.gotoLine(this.vueTabs.editors[index].cursor.row+1, this.vueTabs.editors[index].cursor.column, false);
            this.vueTabs.aceEditor.scrollToRow(this.vueTabs.editors[index].cursor.row+1);
            this.vueTabs.aceEditor.focus();
        })*/
    },
    
    switchTab: function(index) {
        this.vueTabs.$refs.tabs[index].$el.click();
    },
    
    getActiveEditor: function() {
        for(let key in this.list) {
            if(this.list[key].active == true) {
                return key;
            }
        }
        return undefined;
    },
    
    openInExplorer: function(target) {
        if(target.classList.contains('file')) {
            // do not load if alreasy loaded
            const dir = target.getAttribute('data-src');
            const index = this.vueTabs.editors.findIndex(function(editor) { return editor.directory == dir});
            if(index != -1) {
                this.switchTab(index);
            } else {
                this.loadFile(dir);
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
        postRequest("save.php", { dir : this.list[this.getActiveEditor()].directory, content: this.list[this.getActiveEditor()].EditSession.getValue() }, function(response, err){
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
        let that = this;
        // intialize and blacktheme
        const activeEditor = (this.getActiveEditor() != undefined) ? this.list[this.getActiveEditor()].directory : '';
        
        var savedEditors = [];
        for(i in this.vueTabs.editors) {
            savedEditors.push({
                cursor:  this.vueTabs.editors[i].cursor,
                directory:  this.vueTabs.editors[i].directory
            })
        }
        console.log(savedEditors);
        
        
        
        let json = {
            explorer: {
                ".." : this.chargedFolders[""]
            },
            nightTheme : this.vueTabs.settings.nightTheme,
            editors: savedEditors,
            activeEditor: activeEditor
        };
        
        // editors
        if(this.getActiveEditor() != undefined) {
            this.list[this.getActiveEditor()].cursor = this.vueTabs.aceEditor.getCursorPosition();
        }
        for(let key in this.list) {
            json.editors.push({
                directory: this.list[key].directory,
                filename: this.list[key].filename,
                cursor: this.list[key].cursor
            });
        }
        
        console.log(json);
        postRequest("savetabs.php", {json : JSON.stringify(json)}, function(response, err){
            if(err) {
                that.handleError(response.responseText);
                console.error("error " + response.status + " : " + response.responseText);
                return;
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