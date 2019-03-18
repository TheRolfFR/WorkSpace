<?php
require('verifco.php');

$retour = 'error';

if(connected()) {
    if(check($_POST)) {
        if(check($_POST['json'])) {
            $json = json_decode($_POST['json'], true);
            
            $jsonFileName = './savetabs.json';

            $jsonFile = fopen($jsonFileName, 'w');
            fwrite($jsonFile, json_encode($json));
            fclose($jsonFile);
        }
    }
} else {
    http_response_code(403);
    $retour = 'not connected';
}

echo $retour;
?>