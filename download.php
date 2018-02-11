<?php
include('verifco.php');

if(connected() and check($_GET)) {
    $file = $_SERVER['DOCUMENT_ROOT'] . sec($_GET['filename']);
    //
    //$file =  '/photo.jpg';
    if (file_exists($file)) {
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename='.basename($file));
        header('Content-Transfer-Encoding: binary');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . filesize($file));
        ob_clean();
        flush();
        readfile($file);
        exit;
    } else {
        echo 'file not existing';
    }
} else {
    exit();
}
?>