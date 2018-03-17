<?php
error_reporting(E_PARSE);

function check($var) {
    if(isset($var) and !empty($var)) {
        return true;
    }
    return false;
}

function sec($var) {
    return htmlspecialchars($var);
}


function redirect($location, $extension) {
    if(!empty($location)) {
        switch ($location) {
            case 'login':
                $host  = $_SERVER['HTTP_HOST'];
                $uri   = rtrim(dirname($_SERVER['PHP_SELF']), '/\\');
                header("Location: http://$host$uri/");
                break;
            case 'this':
                $location = 'Location: http://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
                if(isset($extension)) {
                    $location += sec($extension);
                }
                header($location);
                break;
                case 'editor':
                    header('Location: http://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'] . 'editor.php');
                    break;
        }
        exit();
    }
    return;
}

?>