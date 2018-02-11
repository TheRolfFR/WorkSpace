<?php 
    require('verifco.php');
    if(!connected()) {
        redirect('login');
    } else {
        if(check($_POST)) {
            if(isset($_POST['disconnect'])) {
                session_destroy();
                redirect('login');
            }
        }
    }
?>
<!DOCTYPE html>
<html>
    <head>
        <?php $nostyle = ""; $title = "WorkSpace"; require_once($_SERVER['DOCUMENT_ROOT'] . '/include/head.php'); ?>
        <link rel="stylesheet" href="css/style.css">
        
        <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>
        <link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">

        <script src="https://cloud9ide.github.io/emmet-core/emmet.js"></script>
        
        <link rel='stylesheet' href='https://rawgit.com/TheRolfFR/custoMenu/master/custoMenu.css'>
        <script src='https://rawgit.com/TheRolfFR/custoMenu/master/custoMenu.js'></script>
        <script src="js/ws_mini_explorer.js"></script>

        <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.8/ace.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.8/ext-language_tools.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.8/ext-emmet.js"></script>
        <script src="js/app.js"></script>
        
        <link rel="shortcut icon" href="img/favicon.ico" type="image/x-icon" >
        <meta name="theme-color" content="#006e9c">
        <meta http-equiv="cache-control" content="no-cache" />
    </head>

    <body>

        <div id="w_topbar" class="middle">
            <div id="w_logo" class="middle">
                <img src="img/workspace_logo_no_bg_white.png" alt=""><h3>Workspace</h3>
            </div><div id="e_tabs" class="middle">
            </div><form action="" method="post" class="middle">
                <label for="disconnect" class="middle pointer">
                    Logout 
                    <i class="fa fa-sign-out" aria-hidden="true"></i><span class="taille"></span>
                </label><input type="submit" value="" id="disconnect" class="none" name="disconnect">
            </form>
        </div>

        <div id="main">
            <div id="top">
                <div class="top">
                    <nav id="w_nav" class="noselect"></nav><div id="e_editors">
                        
                    </div><div id="note">
                        Open file in nav menu or create an empty empty clicking on <i class="fa fa-plus" aria-hidden="true"></i>
                    </div>
                </div>
            </div><div id="preview">
            	<div id="urlbar">
            		<input type="text" name="" id="" placeholder="Preview url here">
            	</div>
            	<div id="frame">
            		<iframe src="/" frameborder="0"></iframe>
            	</div>
            </div>
        </div>

    </body>
</html>
