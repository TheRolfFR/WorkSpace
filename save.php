<?php
require('verifco.php');

$retour = 'error';

if(connected()) {
    if(check($_POST)) {
        if(check($_POST['dir']) and check($_POST['content'])) {
            $filename = $_SERVER['DOCUMENT_ROOT'] . sec($_POST['dir']);
            $content = $_POST['content'];

            if(file_exists($filename)) {
                file_put_contents($filename, $content, LOCK_EX);
                $retour = 'done';
            } else {
                $retour = 'Cant find file';
            }
        }
    }
    // $retour = 'method empty : ' . var_dump($_POST) . var_dump($_GET) . '';
} else {
    $retour = 'not connected';
}

echo $retour;
?>