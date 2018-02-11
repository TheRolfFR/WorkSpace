<?php
require('verifco.php');

$retour = 'error';

if(connected()) {
    if(check($_GET)) {
        if(check($_GET['json'])) {
            $json = json_decode($_GET['json'], true);
            
            $jsonfile = './savetabs.json';

            if(file_exists($jsonfile)) {
                file_put_contents($jsonfile, json_encode($json), LOCK_EX);
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