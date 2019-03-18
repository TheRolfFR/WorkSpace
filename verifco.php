<?php
    session_start();
    require('functions.php');

    function connected() {
        if(isset($_SESSION['workspace']) and !empty($_SESSION['workspace'])) {
            return true;
        }
        return false;
    }
?>