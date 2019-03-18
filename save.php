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
                http_response_code(404);
                $retour = 'Cant find file';
            }
        } else {
            http_response_code(400);
            $retour = "No dir or content parameter";
        }
    } else {
        http_response_code(400);
        $retour = "No POST parameter";
    }
} else {
    http_response_code(403);
    $retour = 'not connected';
}

echo $retour;
?>