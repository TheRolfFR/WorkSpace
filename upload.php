<?php

include('verifco.php');

if(connected()) {
    if(check($_FILES) and check($_POST)) {
        if(check($_POST['src'])) {
            if ($_FILES["file"]["error"] > 0) {
                echo $_FILES["file"]["error"];
            } else {
                $dir = $_SERVER['DOCUMENT_ROOT'] . sec($_POST['src']);
                for($i = 0; $i < count($_FILES['files']['name']); $i++) {
                    $filename = $_FILES['files']['name'][$i];
                    move_uploaded_file($_FILES["files"]["tmp_name"][$i], $dir . $filename);
                }
                echo "done";
            }
            
        } else { echo 'Script error modified'; }
    } else { echo 'No files or no destination'; }
} else { echo 'Not connected, please reconnect'; }

?>