<?php
require('verifco.php');

if(connected())  {
    redirect('editor');
}

$filename = "password.txt";
$modify = false;

if(file_exists($filename)) {
    $file = file_get_contents($filename);
    if(!empty($file)) {
        if($file == 'password') {
            $modify = true;
        }
    } else {
        echo "ERROR : file password.txt empty, please redownload it.";
        die;
    }
} else {
    echo "ERROR : no file password.txt in this folder";
    die;
}

if($modify) {
    $form = '<p><strong>You have to modify the default password to use WorkSpace</strong></p>
            <input type="password" autocomplete="off" required autofocus name="new_password" placeholder="Type a new password">
            <input type="password" autocomplete="off" required name="confirm_password" placeholder="Confirm your new password">';

    if(isset($_POST) and !empty($_POST)) {
        if(check($_POST['new_password']) and check($_POST['confirm_password'])) {
            if( (sec($_POST['new_password']) == sec($_POST['confirm_password'])) and (md5(sec($_POST['new_password'])) != $file) ) {
                $new_password = md5(sec($_POST['new_password']));
                file_put_contents('password.txt', $new_password);
                redirect('this');
            }
        }
    }
} else {
    $form = '<div id="advice">Advice: don\'t use WorkSpace in a public Wi- without a SSL certificate</div>' . 
    '<input type="password" required autofocus name="password" placeholder="Password">';

    if(check($_POST)) {
        if(check($_POST['password'])) {
            $password = md5($_POST['password']);
            if($password == $file) {
                $_SESSION['session'] = $password;
                redirect('editor');
            }
        }
    }
}
?>
<!DOCTYPE html>
<html>
    <head>
        <?php $nostyle = ""; $title = "WorkSpace"; require('include/head.php')?>
    </head>
    <body class="middle">
    	<div id="present">
    		<h2>
    			<div>Code your website in your website</div>
    			<div>Everywhere</div>
    			<div>Anywhere</div>
    		</h2>
    		<img src="https://therolf.fr/workspace/img/screen.png" alt="picture">
    	</div><div class="quart">
    		<form action="" method="post">
    			<h3 class="middle" id="title">
    				<img src="https://therolf.fr/workspace/img/workspace_logo_no_bg_white.png" alt="WS"><span>WorkSpace</span>
    			</h3>
                <?= $form; ?>
    			<input value="Connect" class="submit" type="submit">
    		</form>
    	</div><span class="taille"></span>
    </body>
</html>