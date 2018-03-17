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
    if(check($_GET)) {
        if(check($_GET['message']) && check($_GET['class'])) {
            $message = sec($_GET['message']);
            $class = sec($_GET['class']);
        }
    }
    if(check($_POST)) {
        if(check($_POST['password']) && check($_POST['npassword']) && check($_POST['cpassword'])) {
            $filename = "password.txt";
            if(file_exists($filename)) {
                $file = file_get_contents($filename);
            } else {
                echo "ERROR : no file password.txt in this folder";
                die;
            }
            
            $password = md5(sec($_POST['password']));
            if($password == $file) {
                if(sec($_POST['npassword']) == sec($_POST['cpassword'])) {
                    $new_password = md5(sec($_POST['npassword']));
                    file_put_contents('password.txt', $new_password);
                    $message = "New password saved !";
                    $class = "saved";
                } else {
                    $message = "The new passwords dont match";
                    $class = "error";
                }
            }
        } else {
            $message = "Missing fields";
            $class = "error";
        }
    }
    $version = file_get_contents('version.txt');
    $last_version = file_get_contents('https://raw.githubusercontent.com/TheRolfFR/WorkSpace/master/version.txt');
    $message_update = ($version < $last_version) ? 'not updated' : 'up-to-date';
    $github_message = ($version < $last_version) ? 'DOWNLOAD LATEST VERSION ON GITHUB' : 'VIEW ON GITHUB';
?>
<!DOCTYPE html>
<html>
    <head>
        <?php $title = "WorkSpace settings"; require_once('include/head.php'); ?>
        <link rel="stylesheet" href="css/settings.css">
    </head>
    
    <body class="middle">
    	<div id="settings">
    		<div class="message <?= $class; ?>"><?= $message; ?></div>
    		<a href="settings.php" id="top" class="middle">
    			<img src="https://therolf.fr/workspace/img/workspace_logo_no_bg.png" alt="W"><span>Settings</span>
    		</a>
    		<div id="main">
    			<div class="title">Version</div>
    			<div>Version <b><?= $version; ?></b> <?= $message_update ?></div>
        		<a href="https://github.com/TheRolfFR/WorkSpace" target="_blank"><div class="element" id="github">
        		    <i class="fa fa-github-alt" aria-hidden="true"></i><span> <?= $github_message; ?></span>
        		</div></a>
    			<div class="title">Modify password</div>
    			<form action="" method="post">
    				<label for="currentpassword">
    					Curent password
    				</label>
    				<input type="password" id="currentpassword" name="password" placeholder="Type your current password">
    				<hr>
    				<label for="newpassword">
    					New password
    				</label>
    				<input type="password" id="newpassword" name="npassword" placeholder="Type your new password">
    				<label for="confirmpassword">
    					Confirm password
    				</label>
    				<input type="password" id="confirmpassword" name="cpassword" placeholder="Confirm your new password">
    				<a href="editor.php" id="return"> < <span>Return to WorkSpace editor</span></a>
    				<input type="submit" id="submit" class="nostyle" value="Save">
    			</form>
    		</div>
    	</div><span class="taille"></span>
    </body>
</html>