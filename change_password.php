<?php
require('verifco.php');

$name = 'password.txt';

if(connected()) {
    if(check($_POST)) {
        if(check($_POST['currentpassword']) && check($_POST['newpassword']) && check($_POST['confirmnewpassword'])) {
            if(file_exists($name)) {
                if(file_get_contents($name) == sec($_POST['currentpassword']) && sec($_POST['newpassword']) == sec($_POST['confirmnewpassword'])) {
                    $writepassword = fopen('password.txt', 'w');
                    fwrite($writepassword, sec($_POST['newpassword']));
                    fclose($writepassword);
                } else {
                    echo "incorrect passwords";
                    http_response_code(304); // not modified
                }
            } else {
                echo "password.txt file not found";
                http_response_code(404);
            }
        } else {
            echo "Include currentpassword, newpassword and confirmnewpassword keys";
            http_response_code(400); // bad request
        }
    } else {
        echo "No correct POST content";
        http_response_code(400); // bad request
    }
} else {
    echo "not connected";
    http_response_code(401); // forbidden
}