document.addEventListener('DOMContentLoaded', function(){
    
    // intialize the editor
    ace.require("ace/ext/emmet");
    ace.require("ace/ext/language_tools");
    let aceEditor = ace.edit("editor", {
        showPrintMargin: false,
        enableBasicAutocompletion: true
    });
    aceEditor.setOption("enableEmmet", true);
    aceEditor.setTheme("ace/theme/kuroir");
    aceEditor.commands.addCommand({
        name: "save",
        bindKey: { win: "ctrl-s", mac: "cmd-s" },
        exec: function() { WorkSpace.vueTabs.saveFile() }
    });
    
    WorkSpace.init(aceEditor, function(){
        WorkSpace.vueTabs.explorerElement.addEventListener('click', function(evt) {
            evt.preventDefault();
            WorkSpace.vueTabs.openInExplorer(evt.target);
        });
    });

    // custom context menu
    custoMenu.addMenu(filectxmenu);
    custoMenu.addMenu(contentmenu);
    custoMenu.addMenu(foldermenu);
    
    // initialize notifications
    miniNotif.init();
}, false);