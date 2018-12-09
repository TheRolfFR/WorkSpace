<?php
require('verifco.php');

$retour = 'error';

if(connected()) {
    if(check($_POST)) {
        if(check($_POST['json'])) {
            $json = json_decode($_POST['json'], true);
            
            $jsonfile = './savetabs.json';

            if(file_exists($jsonfile)) {
                file_put_contents($jsonfile, json_encode($json), LOCK_EX);
                http_response_code(200);
                $retour = 'done';
            } else {
                http_response_code(404);
                $retour = 'Cant find file';
            }
        }
    }
} else {
    http_response_code(403);
    $retour = 'not connected';
}

echo $retour;
?>