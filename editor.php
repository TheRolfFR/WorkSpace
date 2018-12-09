<?php 
    require('verifco.php');
    if(!connected()) {
        redirect('login');
    } else {
        if(check($_POST)) {
            if(isset($_POST['logout'])) {
                session_destroy();
                redirect('login');
            }
        }
    }
?>
<!DOCTYPE html>
<html>
    <head>
        <?php $title = "WorkSpace"; require_once('include/head.php'); ?>
        <link rel="shortcut icon" href="img/favicon.ico" type="image/x-icon" >
        <meta name="theme-color" content="#1b1c18">
        <meta http-equiv="cache-control" content="no-cache" />
        <link rel="stylesheet" href="css/style.css">
        
        <!-- Ace Editor !-->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.1/ace.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.1/ext-language_tools.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.1/ext-emmet.js"></script>
        
        <!-- Sortable !-->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.6.0/Sortable.min.js"></script>
        
        <!-- my js !-->
        <!-- <script src="js/ws_mini_explorer.js"></script> !-->
        <script src="js/extensionjs.js"></script>
        <script src="js/ajax.js"></script>
        <script src="js/workspace.js"></script>
        <script src="js/script.js"></script>
    </head>

    <body>
        <div id="settingspanel" class="middle">
            <div id="settingsform" class="element middle noselect">
                <div id="left">
                    <img src="https://therolf.fr/workspace/img/workspace_logo_no_bg_white.png" alt="WS">
                </div><div id="right">
                    <i id="closesettings" class="material-icons">close</i>
                    <h2>WorkSpace Settings</h2>
                    <div>
                        <label id="night" class="bottom">
                            <h3>Night theme</h3> <i class="material-icons" id="nighticon" alt="0">check_box_outline_blank</i>
                          </label>
                        <p>Because night theme is cool.</p>
                    </div>
                    <div>
                        <label for="highlighting"><h3>Highlighting theme</h3></label>
                        <p>Press Ctrl-, in the editor to show settings menu and change theme.</p>
                    </div>
                </div><span class="taille"></span>
            </div><span class="taille"></span>
        </div>
        <div id="main" class="top">
            <div id="menu">
            	
            	<div id="logo" class="middle noselect">
            		<img src="https://therolf.fr/workspace/img/workspace_logo_no_bg.png" alt="ws"><span>WorkSpace</span>
            		<div id="closemenu" class="middle"><i id="settings" class="material-icons">settings</i><i id="close" class="material-icons">close</i><span class="taille"></span></div>
            	</div>
            	
            	<ul id="openedfiles">
            		<h3>Opened files</h3>
            	</ul>
            	
            	<ul id="explorer">
            		<h3>Explorer</h3>
            	</ul>
            	
            </div><div id="rightpart">
            	
            	<div id="topbar" class="middle">
            		<div id="menubar" class="middle"><i class="material-icons">menu</i><span class="taille"></span></div>
        		</div>
            	
            	<div id="editor"></div>
            </div>
        </div>
    </body>
</html>
