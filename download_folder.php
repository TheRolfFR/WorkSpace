<?php
include('verifco.php');
            
function zip_this(&$zip, $dir, $zip_dir = "") {
    
    $ffs = scandir($dir);
    unset($ffs[array_search('.', $ffs, true)]);
    unset($ffs[array_search('..', $ffs, true)]);
        
    foreach($ffs as $element) {
        if(is_file($dir.$element)) {
            $zip -> addFile($dir.$element, $zip_dir.$element); 
        }
        if(is_dir($dir.$element)) {
            $zip -> addEmptyDir($zip_dir.$element);
            zip_this($zip, $dir.$element.'/', $zip_dir.$element.'/');
        }
    }
}

if(connected() and check($_GET)) {
    if(check($_GET["folder"])) {
        $dir = '..' . sec($_GET["folder"]);
        
        if(is_dir($dir)) {
            $zip = new ZipArchive;
            $download = 'workspace-' . time() . '.zip';
            $zip->open($download, ZipArchive::OVERWRITE);
            
            zip_this($zip, $dir);
            $zip->close();
            
            print_r(file_exists($download));
            if (file_exists($download)) {
                header('Content-Description: File Transfer');
                header('Content-Type: application/octet-stream');
                header('Content-Disposition: attachment; filename='.basename($download));
                header('Content-Transfer-Encoding: binary');
                header('Expires: 0');
                header('Cache-Control: must-revalidate');
                header('Pragma: public');
                header('Content-Length: ' . filesize($download));
                ob_clean();
                flush();
                readfile($download);
                unlink($download);
                exit;
            } else {
                echo "Could not find file";
            }
        } else {
            echo "Folder not found";
        }
    } else {
        echo "Request not correct, please enter a \$_GET[\"folder\"] parameter";
    }
}
?>