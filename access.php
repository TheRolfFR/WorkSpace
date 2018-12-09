<?php
require('verifco.php');

if(connected()) {
    /*
    
    INPUT
    
    {
        '..' : {
            'workspace': {
                'css' : {}
                'img' : {}
            }
        }
    }
    */
    
    function getFoldersJSON($source, $input) {
        $return = $files = $directories = array();
        
        //find in the current folder
        $ffs = scandir('..' . $source);

        // unset some mean values
        unset($ffs[array_search('.', $ffs, true)]);
        unset($ffs[array_search('..', $ffs, true)]);
        
        // push the files and directories in proper arrays;
        foreach($ffs as $ff){
            if(is_dir('..' . $source .'/'.$ff)){
                array_push($directories, $ff);
            } else {
                array_push($files, $ff);
            }
        }
        
        // sort
        sort($directories);
        $files = sortByExtension($files);
        
        // restart if folder inclluded in input else put in in the return
        $return['folder'] = array();
        foreach($directories as $dir) {
            if(array_key_exists($dir, $input)) {
                $return['folder'][$source . '/' . $dir . '/'] = getFoldersJSON($source . '/' . $dir, $input[$dir]);
            } else {
                $return['folder'][$source . '/' . $dir . '/'] = $dir;
            }
        }
        
        // put in the return
        $return['file'] = array();
        $i = 0;
        foreach($files as $file) {
            $return['file'][$i] = array($source . '/' . $file=> $file);
            $i++;
        }
        
        return $return;
    }
    
    function sortByExtension($array) {
        $return = $extensions = array();
        
        // search all extensions
        foreach($array as $file) {
            $ext = preg_replace("#(.+)\.(.+)#", '$2', $file);
            if(!in_array($ext, $extensions)) {
                array_push($extensions, $ext);
            }
        }
        
        // sort extensions
        sort($extensions);
        
        // sort foreach extensions
        foreach($extensions as $ext) {
            foreach($array as $file) {
                $pattern = "/(\." . $ext . ")$/";
                if(preg_match($pattern, $file)) {
                    array_push($return, $file);
                }
            }
        }
        
        return $return;
    }
    
    function loadFolder($directory) {
        $return = $files = $folders = array();
        
        // scan the folder
        $ffs = scandir(".." . $directory);
        
        // unset some mean values
        unset($ffs[array_search('.', $ffs, true)]);
        unset($ffs[array_search('..', $ffs, true)]);
        
        // seperate in folders and files
        foreach($ffs as $ff) {
            if(is_dir('..' . $directory .'/'.$ff)){
                array_push($folders, $ff);
            } else {
                array_push($files, $ff);
            }
        }
        
        sort($folders);
        $files = sortByExtension($files);
            
        // put in folder array
        $return['folder'] = array();
        foreach($folders as $folder) {
            $return['folder'][$directory . $folder . '/'] = $folder;
        }
        
        // put in the return
        $return['file'] = array();
        $i = 0;
        foreach($files as $file) {
            $return['file'][$i] = array($directory . $file=> $file);
            $i++;
        }
        
        return $return;
    }

    if(isset($_POST) and !empty($_POST)) {
        if(check($_POST['loadsave'])) {
            $loadsave = json_decode($_POST['loadsave'], true);
            echo json_encode(getFoldersJSON('', $loadsave[".."]));
        } else if(check($_POST["loadfolder"])) {
            echo json_encode(loadFolder(htmlspecialchars($_POST["loadfolder"])));
        } else {
            if(check($_POST['file'])) {
                $retour = array();
                
                $dir = '..' . sec($_POST['file']);
                
                if(file_exists($dir)) {
                    $mime = custom_mime($dir);
                    
                    array_push($retour, $mime);
                    if(substr($mime, 0, 4 ) === 'text') {
                        array_push($retour, '' . file_get_contents($dir));
                    }
                    
                    $retour = json_encode($retour);
                    print_r($retour);
                } else {
                    http_response_code(404);
                    echo "File not existing";
                }
    
            } else {
                http_response_code(400);
                echo "no loadsave, loadfolder or file parameter";
            }
        }
    } else {
        http_response_code(400);
        echo "no POST parameter";
    }
} else {
    http_response_code(403);
    echo "not connected";
}
?>