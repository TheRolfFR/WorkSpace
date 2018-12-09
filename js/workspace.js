let WorkSpace = {
    list: {},
    tabElement: undefined,
    tabList: undefined,
    explorer: undefined,
    editor: undefined,
    chargedFolders: { "": {}},
    aceEditor: undefined,
    maxEditor: 0,
    
    init: function(aceEditor) {
        this.tabElement = document.getElementById('topbar');
        this.tabList = document.getElementById('openedfiles');
        this.explorer = document.getElementById('explorer');
        this.editor = document.getElementById('editor');
        this.aceEditor = aceEditor
        
        this.loadSave();
    },
    
    loadSave: function() {
        // load saved json
        let that = this;
        getJSON('savetabs.json', function(err, response){
            if(err) { // error , return
                console.error("error loading savetabs.json : " + err);
                return;
            }
            
            // else load every file
            for(let i = 0; i < response.editors.length; i++) {
                that.loadFile(response.editors[i].directory, response.editors[i].cursor);
            }
            
            // change theme
            let icon = document.getElementById('nighticon');
            if(response.darktheme == true) {
                document.body.classList.add('darktheme');
                icon.setAttribute('alt', 1);
                icon.innerHTML = 'check_box';
            }
            
            postRequest('access.php', {loadsave: JSON.stringify(response.explorer) }, function(response, err) {
                let json;
                try {
                    json = JSON.parse(response);
                } catch(e) {
                    console.error(e, response);
                    return;
                }
                
                that.setExplorer(explorer, json);
            });
        });
    },
    
    loadFile: function(directory, cursor = { row: 0, column: 0 }) {
        let that = this;
        let filename = directory.split('/').pop();
        
        let id = this.maxEditor;
        that.list[id] = {
            directory: directory,
            EditSession: null,
            active: false,
            filename: filename,
            cursor: cursor
        };
        this.maxEditor++;
        
        postRequest('access.php', { file : directory }, function(response, err){
            if(err) {
                console.error('error ' + response.status + ' : ', response);
                delete that.list[id];
                return;
            }
            
            let json;
            try {
                json = JSON.parse(response);
            } catch(err) {
                console.error('error ' + response.status + ' : ', response);
                return;
            }
            
            if(json[0].substr(0,4) == "text" || json[0].substr(0,5) == "inode") {
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
                // activate editor
                that.addTab(id);
                that.activeEditor(id);
                that.saveWS();
            } else {
                // or open a popup
                document.body.innerHTML += '<form target="_blank" action="' + object.directory + '" method="get" id="popup"></form>';
                document.getElementById('popup').submit();
                document.getElementById('popup').remove();
            }
        });
    },

    setExplorer: function(element, json) {
        element.innerHTML += "<ol>";
        element = element.querySelector("ol");
        
        let foldername;
        let currentFolder;
        let i;
        for(let key in json.folder) {
            if(typeof(json.folder[key]) == "string") {
                element.innerHTML += '<li><a class="folder context custoMe" href="' + key + '" data-name="folder" data-src="' + key + '">' + json.folder[key] + '</a></li>';
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
                element.innerHTML += '<li><a class="folder charged context custoMe" href="' + key + '" data-name="folder" data-src="' + key + '">' + foldername[foldername.length - 2] + '</a></li>';
                this.setExplorer(element.lastElementChild, json.folder[key]);
            }
        }
        
        let ext;
        for(let i = 0; i < json.file.length; i++) {
            for(let key in json.file[i]) {
                ext = json.file[i][key].split('.');
                ext = ext[ext.length-1];
                element.innerHTML += '<li><a class="file context custoMe ' + ext + '" href="' + key + '" data-name="file" data-src="' + key + '" data-ext="' + ext + '">' + json.file[i][key] + '</a></li>';
            }
        }
    },
    
    loadExplorer: function(directory, destination) {
        var that = this;
        postRequest('access.php', {loadfolder: directory}, function(response, err){
            destination.classList.remove('charging');
            let json;
            try {
                json = JSON.parse(response);
            } catch (e) {
                console.error(response);
                return;
            }
            destination.classList.add('charged');
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
        const arr = this.list[id].mime.split('/');
        const mime = arr[arr.length-1];
        
        this.tabElement.innerHTML += '<div class="tab middle noselect file '+mime+'" id="tab'+id+'" alt="' + id + '"><span>'+this.list[id].filename+'</span><span class="material-icons">close</span><span class="taille"></span></div>';
        
        var that = this;
        this.tabElement.querySelectorAll('.tab').forEach(function(el){
            el.addEventListener('click', function(){
                that.switchTab(this);
            });
        });
        
        this.tabList.innerHTML += '<li class="file '+mime+'" alt="' + id + '">'+this.list[id].filename+'</li>';
        this.tabList.querySelectorAll('li').forEach(function(el){
            el.addEventListener('click', function(){
                that.switchTab(this);
            });
        });
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
            
            // switch classes
            if(document.querySelector('.tab.active'))
                document.querySelector('.tab.active').classList.remove('active');
            document.getElementById('tab' + id).classList.add('active');
            
            // switch sessions and focus
            
            if(id != activeEditor) {
                this.list[activeEditor].EditSession = this.aceEditor.getSession();
                this.list[activeEditor].cursor = this.aceEditor.getCursorPosition();
            }
            this.aceEditor.setSession(this.list[id].EditSession);
            
            // focus and go to line
            this.aceEditor.gotoLine(this.list[id].cursor.row+1, this.list[id].cursor.column, true);
            this.aceEditor.renderer.scrollToRow(this.list[id].cursor.row);
            this.aceEditor.focus();
            
            //switch active
            this.list[activeEditor].active = false;
            this.list[id].active = true;
        } else {
            this.editor.style.display = "none";
        }
    },
    
    switchTab: function(el) {
        this.activeEditor(el.getAttribute("alt"));
    },
    
    getActiveEditor: function() {
        for(let key in this.list) {
            if(this.list[key].active == true) {
                return key;
            }
        }
        return undefined;
    },
    
    openInExplorer: function(evt) {
        evt.preventDefault();
        if(evt.target.classList.contains('file')) {
            this.loadFile(evt.target.getAttribute('data-src'));
        } else if(evt.target.classList.contains('folder') && !evt.target.classList.contains('charging')) {
            if(evt.target.classList.contains('charged')) {
                
                // delete from charged folders this folder
                let directories = evt.target.getAttribute('data-src').split('/');
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
                evt.target.classList.remove('charged');
                // remove list ol
                evt.target.parentElement.lastElementChild.remove();
                this.saveWS();
            } else {
                // change to charging icon
                evt.target.classList.add('charging');
                this.loadExplorer(evt.target.getAttribute('data-src'), evt.target);
            }
        }
    },
    
    saveFile: function() {
        console.log("save");
        postRequest("save.php", { dir : this.list[this.getActiveEditor()].directory, content: this.list[this.getActiveEditor()].EditSession.getValue() }, function(response, err){
            if(err) {
                console.error("error " + err + " : ", response);
                return;
            }
            
            // send good response
            if(response == 'done') {
                console.log("file saved");
            }
        });
    },
    
    saveWS: function() {
        // intialize and blacktheme
        let json = {
            explorer: {
                ".." : this.chargedFolders[""]
            },
            darktheme : document.getElementById('nighticon').getAttribute('alt') == 1,
            editors: []
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
                console.error("error " + response.status + " : " + response.responseText);
                return;
            }
            
            if(response == "done") {
                console.log("successfully saved");
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
    }
};