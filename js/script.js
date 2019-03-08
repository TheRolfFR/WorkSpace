function toggleclass(){
    if(!desktop()) {
	    document.getElementById('menu').classList.toggle('active');
    }
}

function desktop() {
    return (document.body.offsetWidth >= 1020) ? true : false;
}

function resize() {
    const isDesktop = desktop();
    aceEditor.renderer.setShowGutter(isDesktop);
    for(let key in WorkSpace.list) {
        WorkSpace.list[key].EditSession.setUseWrapMode(isDesktop);
    }
}

let value, editor, sortable, mcs, edcv, edsh;
document.addEventListener('DOMContentLoaded', function(){
    
    // intialize the editor
    ace.require("ace/ext/emmet");
    ace.require("ace/ext/language_tools");
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
    resize();
    
    WorkSpace.init(aceEditor, function(){
        WorkSpace.explorer.addEventListener('click', function(evt) {
            evt.preventDefault();
            WorkSpace.openInExplorer(evt.target);
        });
    });
    
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
            if(aceEditor.getTheme() == "ace/theme/kuroir") {
                aceEditor.setTheme("ace/theme/pastel_on_dark");
            }
        } else {
            icon.innerHTML = 'check_box_outline_blank';
            if(aceEditor.getTheme() == "ace/theme/pastel_on_dark") {
                aceEditor.setTheme("ace/theme/kuroir");
            }
        }
        document.body.classList.toggle('darktheme');
        icon.setAttribute('alt', 1 - icon.getAttribute('alt'));
        WorkSpace.saveWS();
    });

    // custom context menu
    custoMenu.addMenu(filectxmenu);
    custoMenu.addMenu(contentmenu);
    custoMenu.addMenu(foldermenu);
    
    // initialize notifications
    miniNotif.init();
    
    window.addEventListener("resize", resize);
}, false);