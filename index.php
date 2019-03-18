<?php
require('verifco.php');

if(connected())  {
    redirect('editor');
}

$filename = "password.txt";
$modify = false;

if(!file_exists($filename) || empty(file_get_contents($filename))) {
    $modify = true;
}

if($modify) {
    $form = '<p><strong>You have to modify the default password to use WorkSpace</strong></p>
            <input type="password" autocomplete="off" required autofocus name="new_password" placeholder="Type a new password" class="password">
            <input type="password" autocomplete="off" required name="confirm_password" placeholder="Confirm your new password" class="password">';

    if(isset($_POST) and !empty($_POST)) {
        if(check($_POST['new_password']) and check($_POST['confirm_password'])) {
            if(sec($_POST['new_password']) == sec($_POST['confirm_password'])) {
                $new_password = md5(sec($_POST['new_password']));
                file_put_contents('password.txt', $new_password);
                redirect('this');
            }
        }
    }
} else {
    $form = '<div id="advice">Don\'t use WorkSpace in a public Wi- without a SSL certificate</div>' . 
    '<div id="passcontainer"><input type="password" required autofocus name="password" placeholder="Password" class="password"></div>';

    if(check($_POST)) {
        if(check($_POST['password'])) {
            if(md5(sec($_POST['password'])) == file_get_contents($filename)) {
                $_SESSION['workspace'] = 'I love WorkSpace';
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
        <link rel="stylesheet" href="css/homepage.css">
        <script>
            document.addEventListener('DOMContentLoaded', function(){
            document.getElementById('title').addEventListener('click', function(){
	document.body.classList.add('active');
});

document.getElementById('close').addEventListener('click', function(){
	document.body.classList.remove('active');
});
            })
        </script>
    </head>
    
    <body>
        <h3 id="creator">Created by TheRolf</h3>

<a id="forkme" href="http://bit.ly/workspace-github" target="_blank"><img width="149" height="149" src="https://github.blog/wp-content/uploads/2008/12/forkme_right_darkblue_121621.png?resize=149%2C149" class="attachment-full size-full" alt="Fork me on GitHub" data-recalc-dims="1"></a>

<div id="titlecontainer">
	<div id="title">
		<img src="https://therolf.fr/workspace/img/workspace_logo_no_bg_white.png" alt="ws" class="floatleft"><span class="noselect">Login</span>
	</div>
</div>


<div class="middle">
	<span class="taille"></span><form action="" id="loginform" method="POST" class="element middle">
		<div id="left" class="middle">
			<img src="https://therolf.fr/workspace/img/workspace_logo_no_bg_white.png" alt="WS"><span class="taille"></span>
		</div><div id="right">
			<div id="close" class="noselect"><i class="material-icons">close</i></div>

			<h2>WorkSpace - Login</h2>

			<?= $form; ?>
			
			<div>
				<span id="sn" class="middle"><a href="http://bit.ly/workspace-github" target="_blank"><i class="fab fa-github-alt fa-2x"></i></a><span class="taille"></span></span>
				<input type="submit" value="Login" class="" id="submit">
			</div>
		</div>
	</form>
</div>
    </body>
</html>