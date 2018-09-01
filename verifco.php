<?php
    session_start();
    require('functions.php');

    function connected() {
        if(isset($_SESSION['atom']) and !empty($_SESSION['atom'])) {
            return true;
        }
        return false;
    }
?>