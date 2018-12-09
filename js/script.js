function toggleclass(){
    if(!desktop()) {
	    document.getElementById('menu').classList.toggle('active');
    }
}

function desktop() {
    return (document.body.offsetWidth >= 1200) ? true : false;
}

let value, editor, sortable;
document.addEventListener('DOMContentLoaded', function(){
    
    // intialize the editor
    ace.require("ace/ext/language_tools");
    ace.require("ace/ext/emmet");
    aceEditor = ace.edit("editor", {
        showPrintMargin: false,
        enableBasicAutocompletion: true
    });
    aceEditor.setOption("enableEmmet", true);
    aceEditor.setTheme("ace/theme/kuroir");
    aceEditor.commands.addCommand({
        name: "save",
        bindKey: { win: "ctrl-s", mac: "cmd-s" },
        exec: function() { WorkSpace.saveFile() }
    });
    if(!desktop()) {
        editor.renderer.setShowGutter(false);
    }
    
    // intialize sortable tabs
    if(desktop) {
        let el = document.getElementById('topbar');
        sortable = Sortable.create(el, {
            fallbackTolerance: 10
        });
    }
    
    WorkSpace.init(aceEditor);
    
    // commands menu
    document.getElementById('topbar').addEventListener('click', toggleclass);
    document.getElementById('close').addEventListener('click', toggleclass);
    
    // commands settings menu
    document.getElementById('settings').addEventListener('click', menu);
    document.getElementById('closesettings').addEventListener('click', menu);
    function menu() {
        document.body.classList.toggle('blurred');
        let div = document.getElementById('settingspanel');
        
        if (div.style.display == 'block') {
            div.style.display = 'none';
        }
        else {
            div.style.display = 'block';
        }
    }
    
    // night theme toggle
    document.getElementById('night').addEventListener('click', function(){
        let icon = document.getElementById('nighticon');
        if(icon.getAttribute('alt') == 0) {
            icon.innerHTML = 'check_box';
        } else {
            icon.innerHTML = 'check_box_outline_blank';
        }
        document.body.classList.toggle('darktheme');
        icon.setAttribute('alt', 1 - icon.getAttribute('alt'));
        WorkSpace.saveWS();
    });
    
    // workspace delegated commands
    WorkSpace.explorer.addEventListener('click', function(evt) {
        WorkSpace.openInExplorer(evt);
    });
    WorkSpace.tabElement.addEventListener('click', function(evt) {
        WorkSpace.closeEditor(evt);
    });
});