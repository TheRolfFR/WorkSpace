<?php

function check($var) {
    if(isset($var)) {
        if(!empty($var)) {
            return true;
        }
    }
    return false;
}

function sec($var) {
    return htmlspecialchars($var);
}


function redirect($location) {
    if(!empty($location)) {
        switch ($location) {
            case 'login':
                $host  = $_SERVER['HTTP_HOST'];
                $uri   = rtrim(dirname($_SERVER['PHP_SELF']), '/\\');
                header("Location: http://$host$uri/");
                break;
            case 'this':
                header('Location: http://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
                break;
            case 'editor':
                header('Location: editor.php');
                break;
        }
        exit();
    }
    return;
}

?>