/*

 uses miniNotif. More at :
 https://github.com/TheRolfFR/miniNotif
 __        __         _     ____                       
 \ \      / /__  _ __| | __/ ___| _ __   __ _  ___ ___ 
  \ \ /\ / / _ \| '__| |/ /\___ \| '_ \ / _` |/ __/ _ \
   \ V  V / (_) | |  |   <  ___) | |_) | (_| | (_|  __/
    \_/\_/ \___/|_|  |_|\_\|____/| .__/ \__,_|\___\___|
                                 |_|                   
  
 by TheRolf
 https://github.com/TheRolfFR
 
*/

function randint() {
    return Math.floor(Math.random() * 10000) + 1;  
}
function iframeload() {
    var iframe = $('#preview iframe');
    var input = $('#urlbar input');
    var src = input.val();
    if(src.trim() !== '') {
        iframe.attr('src','');
        iframe.attr('src', src + '?var=' + randint());
    }
}

function check_required(array,required) {
    var response = true;
    for(var i = 0; i < required.length; i++) {
        if(!(required[i] in array)) { response = false; }
    }
    return response;
}

function openFile(directory, cursor = "") {
    // look for existing opened editor
    var existing = Workspace.searchEditor('directory', directory);
    if(existing !== undefined) {
        Workspace.switchEditor(existing.id);
    } else {
        // grt file content
        $.get("access.php", { "file": directory }, function(data) {
            // data protection
            data = JSON.parse(data);
            if(typeof data =='object')
            {
                if((data[0] == 'text') || (data[0] == 'inode')) {
                    // add an editor
                    data[1] = (data.length == 1) ? "": data[1];
                    var array = {
                        'directory': directory,
                        'content': data[1]
                    };
                    if(cursor != "") {
                        array.cursor = cursor;
                    }
                    Workspace.addEditor(array);
                    return;
                } else {
                    // or open a popup
                    $('<form target="_blank" action="' + directory + '" method="get"></form>').appendTo('body').submit().remove();
                    return;
                }
            }
            else
            {
                console.log("Error loading the file, data received : ");
                console.log(data);
                var icon = '<i class="material-icons">&#xE161;</i>';
                miniNotif.addNotif(1, "Error loading the file, please check the console", icon, 'red');
            }
        });
    }
}

// save a file
function save(dir, content) {
    if(dir !== '') {
        var url = window.location.href;
        var parent = url.substring( 0, url.lastIndexOf( "/" ) + 1);
        var finalurl = parent + "save.php";
    
        var params = {
            dir: dir,
            content: content
        };
    
        $.post(finalurl, params, function(data){
            
            var icon = '<i class="material-icons">&#xE161;</i>';
            if(data == 'done') {
                miniNotif.addNotif(1, 'Saved', icon, 'white');
                
                iframeload();
            } else {
                miniNotif.addNotif(1, data, icon, 'red');
            }
        });
    }
}

var Workspace = {
    tabs_element: '#e_tabs',
    tab_element: '.tab',
    editors_element: '#e_editors',
    editor_element: '.editor',
    
    //editor list empty
    list: [],
    lastid: 0,

    init: function() {
        $.getJSON("savetabs.json", function( data ) {
            
            // editors
            if(data.hasOwnProperty('editors')) {
                for(var i = 0; i < data.editors.length; i++) {
                        var required = ["directory"];
                        if(check_required(data.editors[i], required)) {
                            openFile(data.editors[i].directory, data.editors[i].cursor);
                        }
                }
            }
            
            // preview
            if(data.hasOwnProperty('preview')) {
                var preview = data.preview;
                $(document).find('#preview').css('height', preview.height);
                $(document).find('#main #top').css('height', $(document).find('#main #top').innerHeight() - preview.height);
                $(document).find('#preview input').val(preview.url);
                $(document).find('#preview #urlbar').submit();
            }
        });
    },
    
    // save names of edited files
    saveWs: function() {
        var json = {};
        
        // nav
        json.explorer = {};
        $(document).find('.folder.charged').each(function(i){
            json.explorer[i] = $(this).attr('data-src');
        });
        
        // editors
        json.editors = {};
        $(document).find(this.tabs_element + ' ' + this.tab_element).each(function(i){
           var editorId = parseInt($(this).attr('alt')); 
           var editorIndex = Workspace.searchEditor('id', editorId, true);
           var editor = Workspace.list[editorIndex];
           var active = $(this).hasClass('active');
           
           json.editors[i] = {
               directory: editor.directory,
               filename: editor.filename,
               cursor: editor.ace_editor.getCursorPosition(),
               active: active
           };
        });
        
        // preview
        json.preview = {
            "height" : $(document).find('#preview').innerHeight(),
            "url" : $(document).find('#preview input').val()
        };
        
        json = JSON.stringify(json);
        $.get("savetabs.php", { "json": json}, function(data) {
            if(data != 'done') {
                miniNotif.addNotif(1, data, '<i class="material-icons">&#xE5CD;</i>', 'red');
            }
        });
    },

    addEditor: function(array) {
        
        var required = ['directory', 'content'];
        if(check_required(array, required)) {
            // get extension and filename
            var regex = /\/([^\/]*)\.([^\.]+)$/ ;
            var matches = array['directory'].match(regex);
            var extension = matches[2];
            var filename = matches[1] + '.' + matches[2];
            
            // add a new tab
            $(this.tabs_element).append('<div class="' + this.lastid + ' tab middle" alt="' + this.lastid + '"><div class="file ' + extension + '">' + filename + '</div><div class="close"></div><span class="taille"></span></div>');
            
            // prepare object
            var object = {
                directory: array['directory'],
                id: this.lastid,
                filename: filename,
                name: "editor" + this.lastid,
                saved: true
            }
            
            // add a new pre (before editor)
            $(this.editors_element).append('<pre id="' + object.name + '" class="editor"></pre>');
            
            // create editor
            ace.require("ace/ext/language_tools");
            ace.require("ace/ext/emmet");
        
            // ace editor refers to id
            e = ace.edit(object.name);
            e.$blockScrolling = Infinity;
            
            //Set content
            e.setValue(array['content']);
            
            // set style
            e.setTheme("ace/theme/monokai");
            e.setShowPrintMargin(false);
            
            // add commands
            e.commands.addCommand({
                name: "save",
                bindKey: { win: "ctrl-s", mac: "cmd-s" },
                exec: function (e) {
                    save(array['directory'], e.getValue());
                    object.saved = true;
                    Workspace.switchClassSaved(1, '.tab.' + object.id);
                    Workspace.saveWs();
                }
            });
            e.commands.addCommand({
                name: 'close',
                bindKey: { win: 'alt-w', mac: 'alt-w' },
                exec: function (e) {
                    Workspace.deleteEditor(object.id, array['directory']);
                }
            });
        
            //set type
            if (extension == 'js') {
                extension = 'javascript';
            }
            e.session.setMode("ace/mode/" + extension);
        
            // set options
            e.setOptions({
                enableBasicAutocompletion: true,
                enableSnippets: true,
                enableLiveAutocompletion: false
            });
            e.setOption("enableEmmet", true);
            e.getSession().setUseWrapMode(true);
        
            // focus e
            e.focus();
        
            // goto cursor else goto line 1, comumn 0
            var row = 1;
            var column = 0;
            if(array.hasOwnProperty('cursor')) {
                if(array.cursor.hasOwnProperty('row') && array.cursor.hasOwnProperty('column')) {
                    row = array.cursor.row;
                    column = array.cursor.column;
                }
            }
            e.gotoLine(row, column);
    
            object.ace_editor = e;
    
            this.list.push(object);
            this.lastid++;
            
            e.on('input', function () {
                object.saved = false;
                Workspace.saveWs();
                Workspace.switchClassSaved(0, '.tab.' + object.id);
            });
            
            this.switchEditor(object.id);
            
            Workspace.switchClassSaved(1, object.id);
        }
    },
    
    switchClassSaved: function(addornot, selector) {
        var element = $(document).find(selector);
        if(addornot) { element.addClass('saved') } else { element.removeClass('saved') }
    },

    // return object with id
    searchEditor: function(property, value, getIndex = false) {
        for(var i = 0; i < this.list.length; i++) {
            if(this.list[i][property] == value) {
                if(getIndex) {
                    return i;
                } else {
                    return this.list[i];
                }
            }
        }
        return undefined;
    },

    // switch tabs
    switchEditor: function(id = undefined) {
        if(id === undefined) {
            if(this.list.length) {
                id = Workspace.list[0].id;
            } else {
                $('title').text('WorkSpace');
                return;
            }
        }
        
        // tabs
        $(this.tab_element).removeClass('active');
        $(this.tab_element + '.' + id).addClass('active');

        // editors
        $(this.editors_element + ' > .editor').hide();
        var e = this.searchEditor('id',id);
        e.ace_editor.focus();
        
        // title
        $('title').text('WorkSpace - ' + e.filename);
        
        $('#' + e.name).show();
        
        //save tabs
        Workspace.saveWs();
    },

    // delete editor
    deleteEditor: function(id, dir) {
        // remove tab
        $('.tab.' + id).remove();
        
        //delete localStorage element
        localStorage.removeItem(dir);

        //remove editor
        var e = this.searchEditor('id',id);
        $('#' + e.name).remove();

        //remove list object
        var i = this.searchEditor('id',id, true);
        this.list.splice(i, 1);

        //switch to first tab
        this.switchEditor();
    }
}

// how to switch to previous tabs : Shift-)
$(document).on('keydown', function(e) {
    if (e.shiftKey && e.which == 169) {
        e.preventDefault();
        var active = $('.tab.active');
        if($('.tab').length > 1) {
            var index = $('.tab').index(active);
            if(index > 0) {
                var prevId = $('.tab.active').prev().attr('alt');
                Workspace.switchEditor(prevId);
            }
        }
    }
});
// how to switch  to next tab : Shift-=
$(document).on('keydown', function(e) {
    if (e.shiftKey && e.which == 61) {
        e.preventDefault();
        var active = $('.tab.active');
        if($('.tab').length > 1) {
            var index = $('.tab').index(active);
            if(index < ($('.tab').length-1)) {
                var nextId = $('.tab.active').next().attr('alt');
                Workspace.switchEditor(nextId);
            }
        }
    }
});

// how to switch between tabs
$(document).on('click', '.tab', function(){
    var id = $(this).attr('alt');
    Workspace.switchEditor(id);
});

//how to switch beetween tabs with shift and numbers
$(document).on('keydown', function(e) {
    // if is a top digit
    var number = (e.which > 48) && (e.which < 58);
    if (e.shiftKey && e.altKey && number) {
        var index = parseInt(String.fromCharCode(e.keyCode));
        // if number is lower or equal to the number of editors
        if(index <= Workspace.list.length) {
            // switch tab
            var id = Workspace.list[index-1].id; 
            Workspace.switchEditor(id);
        } else {
            if(Workspace.list.length && index==9) {
                var id = Workspace.list[Workspace.list.length-1].id;
                Workspace.switchEditor(id);
            }
        }
        return false;
    }
});

// how to close a tab
$(document).on('click', '.tab .close', function(event){
    event.stopPropagation();
    var id = $(this).parent().attr('alt');
    var dir = Workspace.searchEditor('id',id).directory;
    Workspace.deleteEditor(id, dir);
    Workspace.saveWs();
});

$(document).ready(function() {
    // init editor instance
    Workspace.init();
    
    //init jquery ui
    $( "#top" ).resizable({
    	handles: 's',
    	minHeight: 150,
    	resize: function(event, ui) {
    		var parentSize = ui.element.parent().innerHeight();
    		
    		var nextSize = parentSize - ui.size.height;
    		
    		var nextElement = ui.element.next();
    		nextElement.css('height', nextSize);
    		
    		// solve bug ace editor to resize to content height
    		window.dispatchEvent(new Event('resize'));
    	}
    });
    
    //make tabs sortables
    $( Workspace.tabs_element ).sortable({
		axis: "x",
		helper : 'clone',
        items: 'div.tab',
        stop: function(){
            Workspace.saveWs();
        }
	});
    $( "#sortable" ).disableSelection();
    
    // update iframe on enter key
    $('#urlbar').on('submit', function(e) {
        e.preventDefault();
        iframeload();
        Workspace.saveWs();
    });
});