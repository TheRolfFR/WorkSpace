<?php
    session_start();
    require('functions.php');

    function connected() {
        if(isset($_SESSION['session']) and !empty($_SESSION['session'])) {
            return true;
        }
        return false;
    }
?>