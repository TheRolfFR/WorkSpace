let WorkSpace;
document.addEventListener('DOMContentLoaded', function(){
    WorkSpace = new Vue({
        el: '#app',
        data: () => ({
            themes: {
                light: 'ace/theme/kuroir',
                dark: 'ace/theme/srcery'
            },
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
                },
                currentpassword: '',
                newpassword: '',
                confirmnewpassword: ''
            }
        }),
        methods: {
            activeEditor: function(directory) {
                // empty list error
                if(this.editors.list.length == 0) {
                    this.editors.element.style.display = "none";
                    return;
                }
                
                // not in the list
                let list = this.editors.list.filter(ed =>ed.directory == directory);
                if(list.length == 0) {
                    this.handleError(directory + " not in the editors list");
                    this.editors.element.style.display = "none";
                    return;
                }
                
                let activeEditor = this.getActiveEditor();
                
                // previous editor
                if(activeEditor != undefined) {
                    activeEditor.EditSession = this.editors.aceEditor.getSession();
                    activeEditor.cursor = this.editors.aceEditor.getCursorPosition();
                }
                
                // new editor
                if(this.editors.list.length != 0) {
                    this.editors.activeEditor = directory;
                    this.editors.element.style.display = 'block';
                
                
                    this.$nextTick(function() {
                        activeEditor = this.getActiveEditor();
                        
                        if(activeEditor != undefined) {
                            this.editors.aceEditor.setSession(activeEditor.EditSession);
                            this.editors.aceEditor.scrollToLine(activeEditor.cursor.row+1, true, false, function(){});
                            this.editors.aceEditor.gotoLine(activeEditor.cursor.row+1, activeEditor.cursor.column, false);
                            this.editors.aceEditor.focus();
                        } else  {
                            this.editors.activeEditors = undefined;
                            this.editors.element.style.display = 'none';
                        }
                    })
                } else  {
                    this.editors.activeEditors = undefined;
                    this.editors.element.style.display = 'none';
                }
            },
            
            adjustEditor: function() {
                // adjust editor style
                let isDesktop = this.isDesktop;
                this.editors.aceEditor.renderer.setShowGutter(isDesktop);
                if(isDesktop) {
                    this.editors.element.classList.add('desktop');
                } else {
                    this.editors.element.classList.remove('desktop');
                }
                if(!this.settings.nightTheme && this.editors.aceEditor.getTheme() == this.themes.dark) {
                    this.editors.aceEditor.setTheme(this.themes.light);
                }
                if(this.settings.nightTheme && this.editors.aceEditor.getTheme() == this.themes.light) {
                    this.editors.aceEditor.setTheme(this.themes.dark);
                }
            },
            
            changePassword: function() {
                let MD5 = new Hashes.MD5()
                const json = {
                    currentpassword: MD5.hex(this.settings.currentpassword),
                    newpassword: MD5.hex(this.settings.newpassword),
                    confirmnewpassword: MD5.hex(this.settings.confirmnewpassword)
                };
                console.log(json);
                postRequest('change_password.php', json, (data, err) =>{
                    if(err) {
                        this.handleError(data);
                    }
                    
                    this.settings.dialog = false;
                })
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
            
            closeEditor: function(dir) {
                // close an editor
                
                // get index of the editor to close
                const index = this.editors.list.findIndex(function(editor) { return editor.directory == dir});
                
                // IMPORTANT: DELETE FIRST EDITOR
                let editors = this.editors.list;
                editors.splice(index, 1);
                this.editors.list = editors;
                
                // IMPORTANT THEN SWITCH TO ANOTHER ONE
                // switch to previous editor or the first one
                if(this.$refs.tabs.length) {
                    const indexTab = (index - 1 < 0) ? 0 : index - 1;
                    this.switchTab(indexTab);
                } // or display no editor
                else {
                    this.activeEditor(-1);
                }
                
                this.saveWS();
            },
            
            getActiveEditor: function() {
                // return the active editor !!! USEFUL !!!
                const arr = this.editors.list.filter(ed => ed.directory == this.editors.activeEditor);
                if(arr.length != 0) {
                    return arr[0];
                }
                return undefined;
            },
            
            getLoadedFolders: function(dir = undefined, dirpath = '..') {
                if(dir === undefined) dir = this.explorer
                
                const result = {}
                let notFound = true
                
                // now we need to cross through the explorer element and add charged folders
                // aka folder that type Object
                for(let key in dir.folder) {
                    let fullpath = key
                    
                    if(typeof(dir.folder[fullpath]) === 'object') {
                        let sp = fullpath.split('/')
                        sp.pop()
                        result[sp.pop()] = this.getLoadedFolders(dir.folder[fullpath], fullpath)
                        notFound = false
                    }
                }
                
                if(notFound)
                    return dirpath
                
                return result
            },
            
            getModeByFileExtension: function(path){
                var modelist = ace.require("ace/ext/modelist");
                return modelist.getModeForPath(path).mode;
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
            
            handleError: function(error) {
                let doLogout = false;
                
                if(typeof(error) == 'string' && error == 'not connected') {
                    doLogout = true;
                } else {
                    if(typeof(error) == 'object' && 'responseText' in error && error['responseText'] != '' && error['responseText'] == 'not connected') {
                        doLogout = true;
                    }
                    console.error(error);
                    miniNotif.addNotif({
                        process: false,
                        text: "An error occured, please check console for more details.",
                        color: 'red',
                        icon: '<i class="fas fa-exclamation-circle"></i>'
                    })
                }
                
                if(doLogout) {
                    this.logout();
                }
            },
            
            init: function(aceEditor, callback) {
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
            
            loadExplorer: function(directory, destination) {
                postRequest('access.php', {loadfolder: directory}, (response, err) => {
                    // console.log(directory, destination)
                    // remove charging class does not tell if it was successful
                    destination.classList.remove('charging');
                    
                    // try to parse JSON
                    let json;
                    try {
                        json = JSON.parse(response);
                    } catch (e) {
                        this.handleError(response);
                        return;
                    }
                    
                    // console.log(json)
                    
                    const directorySplit = directory.split('/')
                    directorySplit.splice(0, 1) // remove first one
                    directorySplit.pop() // remove last one
                    
                    if(directorySplit.length === 0)
                        return
                    
                    let location = this.explorer.folder // define variable to update
                    let path = '/' + directorySplit[0] + '/' // define field to update
                    
                    directorySplit.splice(0, 1) // remove first directory
                    
                    // navigate through the path
                    // /folder/
                    // /folder/subfolder/
                    // /folder/subfolder/subsubfolder/
                    
                    while(directorySplit.length > 0) {
                        location = location[path].folder
                        path = path + directorySplit[0] + '/'
                        
                        directorySplit.splice(0, 1)
                    }
                    
                    // console.warn(location, path)
                    
                    Vue.set(location, path, json)
                    
                    this.saveWS();
                });
            },
            
            loadFile: function(directory, index, cursor = { row: 0, column: 0 }, activeEditor = true) {
                let filename = directory.split('/').pop();
                
                postRequest('access.php', { file : directory }, (response, err) => {
                    
                    // other result than JSON
                    let json;
                    try {
                        json = JSON.parse(response);
                    } catch(err) {
                        this.handleError(response.responseText);
                        console.error('error ' + response.status + ' : ', response);
                        return;
                    }
                    
                    if(json[0].substr(0,4) == "text" || json[0].substr(0,5) == "inode") {
                        // add editor to list
                        let mime = json[0].split('/').pop();
                        switch(mime) {
                            case "md":
                                mime = "markdown";
                            default:
                                break;
                        }
                        
                        const mode = this.getModeByFileExtension(filename);
                        
                        // push to editors list
                        this.push(this.editors, 'list', {
                            directory: directory,
                            EditSession: new ace.createEditSession(json[1], mode),
                            filename: filename,
                            cursor: cursor,
                            offset: 0,
                            mime: mime
                        });
                        
                        this.saveWS();
                        
                        this.$nextTick(function(){
                            this.$refs.tabs[this.$refs.tabs.length - 1].click();
                        });
                    } else {
                        // or open a popup
                        let win = window.open(directory, '_blank');
                        win.focus();
                    }
                });
            },
            
            loadSave: function() {
                // disable syyntax validation for all editors
                require("ace/config").setDefaultValue("session", "useWorker", false);
                // try to get a response
                getJSON('savetabs.json', (err, response) => {
                    if(err) { // consider no save if cant find
                        response = {};
                    }
                    
                    // night theme
                    if('nightTheme' in response && typeof(response.nightTheme) == 'boolean') {
                        Vue.set(this.settings, 'nightTheme', response.nightTheme);
                    }
                    
                    // keep track of all loaded editors
                    let loadedEditors = []; // used not to reopen a file
                    
                    if('editors' in response) {
                        for(let i in response.editors) {
                            // load if got all parameters and not loaded
                            if(this.checkKeys(response.editors[i], ['cursor', 'directory']) && loadedEditors.findIndex((ed) => { return ed.directory == response.editors[i].directory }) == -1) {
                                //console.log(response.editors[i]);
                                loadedEditors.push(response.editors[i]);
                            }
                        }
                    }
                    
                    //console.log(loadedEditors);
                    
                    // load each file
                    this.$nextTick(() => {
                        for(let i in loadedEditors) {
                            this.loadFile(loadedEditors[i].directory, i, loadedEditors[i].cursor, response.activeEditor == loadedEditors[i].directory);
                        }
                    })
                    
                    // console.warn(response.explorer)
                    
                    // explorer part
                    // save looks like
                    // { ".." : { "folder": { "folder/subfolder" : "folder/subfolder" }}}
                    postRequest('access.php', {loadsave: JSON.stringify(response.explorer) }, (response, err) => {
                        let json;
                        // console.warn(response, err)
                        try {
                            json = JSON.parse(response);
                        } catch(e) {
                            this.handleError(response);
                            console.error(e, response);
                            return;
                        }
                        
                        Vue.set(this, 'explorer', json);
                        this.saveWS();
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
    
            openInExplorer: function(target) {
                // close navigation drawer in not a desktop mode
                this.drawer = this.isDesktop;
                
                // of this is a file
                if(target.classList.contains('file')) {
                    // do not load if alreasy loaded
                    const dir = target.getAttribute('data-src');
                    const index = this.editors.list.findIndex(function(editor) { return editor.directory == dir});
                    if(index != -1) {
                        this.switchTab(index);
                    } else {
                        this.loadFile(dir, this.editors.list.length);
                    }
                } else if(target.classList.contains('folder') && !target.classList.contains('charging')) {
                    // if this is not a loading folder
                    if(target.classList.contains('charged')) {
                        // delete folder from data
                        
                        // get directory
                        const src = target.getAttribute('data-src')
                        // console.warn(src)
                        
                        const directorySplit = src.split('/') // split directory
                        directorySplit.splice(0, 1) // remove first /
                        directorySplit.pop() // remove last /
                        
                        if(directorySplit.length !== 0) {
                            let location = this.explorer.folder
                            let path = '/' + directorySplit[0] + '/' // first folder
                            let folderName = directorySplit[0] // first folder name
                            directorySplit.splice(0, 1) // remove first occurence
                            
                            while(directorySplit.length > 0) {
                                location = location[path].folder // get inside folder
                                path = path + directorySplit[0] + '/' // append first folder name
                                folderName = directorySplit[0] // the folder name is now the first name
                                
                                directorySplit.splice(0, 1) // remove occurence
                            }
                            
                            // console.warn(location, path, folderName)
                            
                            // we have the object=location, the field=path, the newvalue=folder's name
                            Vue.set(location, path, folderName)
                        } else {
                            // I am at root
                            this.explorer.folder = {}
                            this.explorer.file = []
                        }
                        
                        this.saveWS();
                    } else {
                    // change to charging icon
                        target.classList.add('charging');
                        this.loadExplorer(target.getAttribute('data-src'), target);
                    }
                }
            },
            
            openSettings: function() {
                this.$refs.passwordform.reset()
                this.getVersions(() => {
                    this.settings.dialog = true;
                });
            },
            
            push: function(context, key, val) {
                let arr = context[key];
                arr.push(val);
                Vue.set(context, key, arr);
            },
    
            saveFile: function() {
                this.getActiveEditor().EditSession = this.editors.aceEditor.getSession();
                let saving = miniNotif.addNotif({
                    process: false,
                    text: 'Saving ' + this.getActiveEditor().filename
                })
                postRequest("save.php", { dir : this.getActiveEditor().directory, content: this.getActiveEditor().EditSession.getValue() }, (response, err) => {
                    miniNotif.done(saving);
                    if(err) {
                        this.handleError(response);
                        return;
                    }
                    // send good response
                    if(response == 'done') {
                        this.snackbar = true;
                        this.snackbarText = "File saved";
                        this.saveWS();
                    }
                });
            },
    
            saveWS: function() {
                // editors
                const activeEditor = (this.getActiveEditor() != undefined) ? this.getActiveEditor().directory : '';
                let savedEditors = [], isActiveEditor;
                for(let i in this.editors.list) {
                    isActiveEditor = this.editors.activeEditor == this.editors.list[i].directory;
                    savedEditors.push({
                        cursor:  (isActiveEditor) ? this.editors.aceEditor.getCursorPosition() : this.editors.list[i].cursor,
                        directory:  this.editors.list[i].directory
                    })
                }
                
                // explorer + nightTheme
                let json = {
                    explorer: this.chargedFolders,
                    activeEditor: this.editors.activeEditor,
                    nightTheme : this.settings.nightTheme,
                    editors: savedEditors
                };
                
                // save tabs
                postRequest("savetabs.php", {json : JSON.stringify(json)}, (response, err) => {
                    if(err) {
                        this.handleError(response);
                    } else {
                        console.log("WorkSpace saved.");
                    }
                });
            },
            
            switchEditor: function(id = -1) {
                this.activeEditor(id);
            },
    
            switchTab: function(index) {
                this.activeEditor((this.editors.list[index]) ? this.editors.list[index].directory : -1);
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
                return (this.editors.list.length != 0 && this.getActiveEditor()) ? this.getActiveEditor().filename : '';
            },
            colorTheme: function() {
                return (this.settings.nightTheme) ? "#222" : this.color;
            },
            isDesktop: function() {
                return this.$vuetify.breakpoint.lgAndUp;
            },
            chargedFolders: function() {
                let l = this.getLoadedFolders()
                
                return { "..": l }
            }
        },
        watch: {
           '$vuetify.breakpoint.lgAndUp': function () {
               this.adjustEditor();
           },
           'settings.nightTheme': function() {
               this.adjustEditor();
               this.saveWS();
           },
           explorer: {
               handler: function(_val, _oldval) {
                   this.saveWS();
               },
               deep: true
           }
        }
    })
})
