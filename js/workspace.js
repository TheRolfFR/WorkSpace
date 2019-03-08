let WorkSpace = {
    list: {},
    tabElement: undefined,
    tabList: undefined,
    explorer: undefined,
    editor: undefined,
    chargedFolders: { "": {}},
    aceEditor: undefined,
    maxEditor: 0,
    vueTabs: undefined,
    
    init: function(aceEditor, callback) {
        this.vueTabs = new Vue({
            data: () => ({
                tabs: [],
                activeEditor: 0,
                editors: [],
                drawer: false,
                snackbar: false,
                snackbarText: "I love you boby",
                color: "#0060ac",
                settingsDialog: false,
                nightTheme: false
            }),
            el: '#app',
            methods: {
                switchEditor: function(id = -1) {
                    Vue.set(this, 'activeEditor', id);
                    WorkSpace.activeEditor(id);
                },
                logout: function() {
                    window.location.href +="?logout";
                }
            },
            computed: {
                activeEditorName: function() {
                    let filtered = this.tabs.filter(tab => tab.id == this.activeEditor);
                    return (this.tabs.length != 0) ? filtered[0].filename : '';
                },
                colorTheme: function() {
                    return (this.nightTheme) ? "#222" : this.color;
                }
            },
            mounted: function() {
                this.$nextTick(function() {
                    this.drawer = this.$vuetify.breakpoint.lgAndUp;
                    WorkSpace.loadSave(this);
                    WorkSpace.adjustEditor(this.$vuetify.breakpoint.lgAndUp);
                    callback();
                  })
            },
            watch: {
               '$vuetify.breakpoint.lgAndUp': function (value) {
                   WorkSpace.adjustEditor(value);
               }
            }
        })
    },
    
    adjustEditor: function(value) {
        if(value) {
           this.editor.classList.add('desktop');
        } else {
           this.editor.classList.remove('desktop');
        }
    },
    
    loadSave: function(vue) {
        this.explorer = document.getElementById('explorer');
        this.editor = document.getElementById('editor');
        this.aceEditor = aceEditor;
        // load saved json
        let that = this;
        getJSON('savetabs.json', function(err, response){
            if(err) { // error , return
                that.handleError(response.responseText);
                console.error("error loading savetabs.json : " + err);
                return;
            }
            
            
            // change theme
            let icon = document.getElementById('nighticon');
            if(response.darktheme == true) {
                document.body.classList.add('darktheme');
                icon.setAttribute('alt', 1);
                icon.innerText = 'check_box';
                this.aceEditor.setTheme("ace/theme/pastel_on_dark");
            }
            
            // keep track of all loaded editors
            let loadededitors = vue.editors || [];
            for(let i = 0; i < response.editors.length; i++) {
                // load if not loaded
                if(loadededitors.indexOf(response.editors[i].directory) == -1) {
                    that.loadFile(response.editors[i].directory, response.editors[i].cursor, response.editors[i].directory == response.activeEditor);
                    loadededitors.push(response.editors[i].directory);
                }
            }
            Vue.set(vue, 'editors', loadededitors);
            
            // explorer part
            postRequest('access.php', {loadsave: JSON.stringify(response.explorer) }, function(response, err) {
                let json;
                try {
                    json = JSON.parse(response);
                } catch(e) {
                    that.handleError(response.responseText);
                    console.error(e, response);
                    return;
                }
                
                that.setExplorer(explorer, json);
                that.saveWS();
            });
        });
    },
    
    loadFile: function(directory, cursor = { row: 0, column: 0 }, activeEditor = true) {
        let that = this;
        let filename = directory.split('/').pop();
        
        postRequest('access.php', { file : directory }, function(response, err){
            if(err) {
                that.handleError(response.responseText);
                console.error('error ' + response.status + ' : ', response);
                delete that.list[id];
                return;
            }
            
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
                let id = that.maxEditor;
                that.list[id] = {
                    directory: directory,
                    EditSession: null,
                    active: false,
                    filename: filename,
                    cursor: cursor
                };
                that.maxEditor++;
                
                // add content and mime to list
                
                let val = json[0].split('/');
                val = val[val.length -1];
                that.list[id].mime = val;
                
                // set session
                that.list[id].EditSession = new ace.createEditSession(json[1], "ace/mode/" + val);
                if(desktop()) {
                    that.list[id].EditSession.setUseWrapMode(true);
                }
                that.list[id].EditSession.setUseWorker(false);
                that.aceEditor.selection.clearSelection();
                
                // add a tab
                that.addTab(id);
                
                // if activate switch to this tab
                if(activeEditor) {
                    //that.activeEditor(id);
                }
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
    
    addTab: function(id) {
        var that = this;
        const arr = this.list[id].mime.split('/');
        const mime = arr[arr.length-1];
        
        let tabs = this.vueTabs.tabs || [];
        tabs.push({
            mime: mime,
            id: id,
            filename: this.list[id].filename
        })
        Vue.set(this.vueTabs, 'tabs', tabs);
    },
    
    activeEditor: function(id = -1) {
        if(!isEmptyObject(this.list)) {
            // select first editor loaded
            if(id == -1) {
                id = Object.keys(this.list)[0];
            }
            
            let activeEditor = this.getActiveEditor();
            if(activeEditor == undefined) {
                WorkSpace.list[id].active = true;
                activeEditor = id;
            }
            
            this.editor.style.display = 'block';
            
            // switch sessions and focus
            
            if(id != activeEditor) {
                this.list[activeEditor].EditSession = this.aceEditor.getSession();
                this.list[activeEditor].cursor = this.aceEditor.getCursorPosition();
            }
            this.aceEditor.setSession(this.list[id].EditSession);
            
            // focus and go to line
            this.aceEditor.gotoLine(this.list[id].cursor.row+1, this.list[id].cursor.column, false);
            this.aceEditor.scrollToRow(this.list[id].cursor.row+1);
            this.aceEditor.focus();
            
            //switch active
            this.list[activeEditor].active = false;
            this.list[id].active = true;
        } else {
            this.editor.style.display = "none";
        }
    },
    
    switchTab: function(el) {
        if(typeof(el) == "object") {
            this.activeEditor(el.getAttribute("alt"));
        } else {
            this.activeEditor(el);
        }
        this.saveWS();
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
            for(let key in this.list) {
                if(this.list[key].directory == dir) {
                    this.switchTab(key);
                    toggleclass();
                    return;
                }
            }
            
            this.loadFile(dir);
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
        let json = {
            explorer: {
                ".." : this.chargedFolders[""]
            },
            darktheme : document.getElementById('nighticon').getAttribute('alt') == 1,
            editors: [],
            activeEditor: activeEditor
        };
        
        // editors
        if(this.getActiveEditor() != undefined) {
            this.list[this.getActiveEditor()].cursor = this.aceEditor.getCursorPosition();
        }
        for(let key in this.list) {
            json.editors.push({
                directory: this.list[key].directory,
                filename: this.list[key].filename,
                cursor: this.list[key].cursor
            });
        }
        
        postRequest("savetabs.php", {json : JSON.stringify(json)}, function(response, err){
            if(err) {
                that.handleError(response.responseText);
                console.error("error " + response.status + " : " + response.responseText);
                return;
            }
        });
    },
    
    closeEditor: function(evt) {
        evt.preventDefault();
        if(evt.target.classList.contains('material-icons') && evt.target.parentElement.classList.contains('tab')) {
            // get id
            let id = evt.target.parentElement.getAttribute('alt');
            
            // splice the element in the list
            delete this.list[id];
            
            // try to activate first editor
            this.activeEditor();
            
            // delete the tab
            evt.target.parentElement.remove();
            
            // save ws
            this.saveWS();
        }
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
                text: "An error occured, please chack console for more details.",
                color: 'red',
                icon: '<i class="fas fa-exclamation-circle"></i>'
            })
        }
    }
};