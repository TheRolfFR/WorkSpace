<?php

require('verifco.php');

// recursive folder deleting
function rrmdir($dir) { 
    if (is_dir($dir)) { 
    $objects = scandir($dir); 
        foreach ($objects as $object) { 
            if ($object != "." && $object != "..") { 
                if (is_dir($dir."/".$object)) {
                    rrmdir($dir."/".$object);
                }
                else {
                    unlink($dir."/".$object);
                } 
            }
        }
    rmdir($dir); 
    }
    return true;
}

function cget($get, $get1='', $get2='') {
    $f = check($_GET[$get]);
    if($get1 !== '') {
        if($get2 !== '') {
            return ($f && cget($get1, $get2));
        }
        return ($f && cget($get1));
    }
    return $f;
}

function csec($get) {
    return sec($_GET[$get]);
}

function dircopy($source, $dest, $perm = 0755) {
    // recreate empty folder with same name
    preg_match("/(\/[^\/]+)(\/([^\/]+)\/)$/", $source, $output);
    $foldername = $output[3];
    $newsource = $dest . $foldername . '/';
    mkdir($newsource);
    chmod($newsource, $perm);
    
    if(is_dir($source)) {
        $dir_handle=opendir($source);
        while($file=readdir($dir_handle)){
            if($file!="." && $file!=".."){
                if(is_dir($source."/".$file)){ // if source is directory
                    dircopy($source . $file . "/", $newsource, $perm);
                } else { // else if source is file
                    copy($source . $file, $newsource . $file);
                }
            }
        }
        closedir($dir_handle);
        return true;
    }
    return false;
}

if(connected()) {
    if(check($_GET)) {
        if(cget('open','src')) {  //open function
            //secure vars
            $fileorfolder = csec('open');
            $src = csec('src');
            
            $return = ['','',''];
            
            if(intval($fileorfolder)) { // if looking for file content
                // prepare return
                
                // get folder
                $folder = $_SERVER['DOCUMENT_ROOT'] . $src;
                
                // get file mime type
                $finfo = finfo_open(FILEINFO_MIME_TYPE);
                $mime = finfo_file($finfo, $folder);
                finfo_close($finfo);
    
                //get files type
                $type = preg_replace('/(.+)\/(.+)/', '$1', $mime);
                
                // if type text or inode return file content
                if($type == 'text' or $type == 'inode') {
                    $return[0] = file_get_contents($folder);
                } else { // else not text
                    $return[0] = 'nottext';
                }
                
            } else { //if looking for a directory content
                if(is_dir($_SERVER['DOCUMENT_ROOT'] . $src)) {
                // scan dir and unset not interesting values
                $children = scandir($_SERVER['DOCUMENT_ROOT'] . $src);
                unset($children[array_search('.', $children, true)]);
                unset($children[array_search('..', $children, true)]);
                
                //init lists for directories and files
                $folders = $unorderedfiles = $files = array();
                
                // sort files and directories
                foreach($children as $child) {
                    if(is_dir($_SERVER['DOCUMENT_ROOT'] . $src . $child)) {
                        array_push($folders, $src . $child . '/');
                    } else {
                        array_push($unorderedfiles, $child);
                    }
                }
                
                //sort files by types
                
                $types = array();
                // search for types
                foreach($unorderedfiles as $file) {
                    $ext = preg_replace("#(.+)\.(.+)#", '$2', $file);
                    $intypes = in_array($ext, $types);
                    if(!$intypes) {
                        array_push($types, $ext);
                    }
                }
                sort($types);
                
                // sort files by name
                foreach($types as $type) {
                    foreach($unorderedfiles as $file) {
                        $pattern = "/(\." . $type . ")$/";
                        if(preg_match($pattern, $file)) {
                            array_push($files, $file);
                        }
                    }
                }
                
                //return array
                $return[1] = $folders;
                $return[2] = $files;
                
                print_r(json_encode($return));
            }
        }
        }//
        
        if(cget('copy', 'dest')) { // copy function
            $return = 'error';
            
            //secure vars
            $src = csec('copy');
            $is_src_file = file_exists($_SERVER['DOCUMENT_ROOT'] . $src);
            $is_src_dir = is_dir($_SERVER['DOCUMENT_ROOT'] . $src);
                
            $dest = $_SERVER['DOCUMENT_ROOT'] . csec('dest');
            $is_dest_dir = is_dir($dest);
            
            if( ($is_src_file or $is_src_dir) and $is_dest_dir) {
                $filename = preg_replace("#(\/.*)+\/(.*)$#", '$2', $src);
                
                $srcfile = $_SERVER['DOCUMENT_ROOT'] . $src;
                $destfile = $dest . $filename;
                
                if($is_src_dir) { // if folder
                    $return = (dircopy($srcfile, $destfile)) ? 'done' : 'Failed to copy folder';
                } else {
                    $return = (copy($srcfile,  $destfile)) ? 'done' : 'Failed to copy file';
                }
            } else {
                $return = 'Incorrect src data or dest data';
                var_dump('$is_src_file : ' . $is_src_file);
                var_dump(' $is_src_dir : ' . $is_src_dir);
                var_dump(' $is_dest_dir : ' . $is_dest_dir);
            }
            
            echo $return;
        }//
        
        if(cget('cut', 'dest')) { // cut function
            $return = 'error';
            
            //secure vars
            $src = csec('cut');
            $is_src_file = file_exists($_SERVER['DOCUMENT_ROOT'] . $src);
            $is_src_dir = is_dir($_SERVER['DOCUMENT_ROOT'] . $src);
            
            $dest = $_SERVER['DOCUMENT_ROOT'] . csec('dest');
            $is_dest_dir = is_dir($dest);
            
            if( ($is_src_file xor $is_src_dir) and $is_dest_dir) {
                $filename = preg_replace("#(\/.*)*\/(.+)$#", '$2', $src);
                
                $srcfile = $_SERVER['DOCUMENT_ROOT'] . $src;
                $destfile = $dest . $filename;
                
                if($is_src_file) { // if file
                    $return = (rename($srcfile, $destfile)) ? 'done' : 'Failed to cut file';
                } else {
                    $insubfolder = (strpos($destfile, $srcfile) !== false) ? true: false;
                    if($insubfolder) {
                        $return = 'Cannot cut in a subfolder';
                    } else {
                        $return = (rename($srcfile, $destfile)) ? 'done' : 'Failed to cut folder';
                    }
                }
            } else {
                $return = 'Incorrect src data or dest data';
                echo '$is_src_file : ';
                var_dump($is_src_file);
                echo' $is_src_dir : ';
                var_dump($is_src_dir);
                echo' $is_dest_dir : ';
                var_dump($is_dest_dir);
            }
            
            echo $return;
        }//
        if(cget('delete')) { // delete function
            $return = '';
            //secure vars
            $src = $_SERVER['DOCUMENT_ROOT'] . csec('delete');
            
            if(is_dir($src)) { // if folder
                $return = (rrmdir($src)) ? 'done' : 'Failed to delete folder';
            } else {
                if(file_exists($src)) {
                    $return = (unlink($src)) ? 'done' : 'Failed to delete file';
                } else {
                    $return = 'File doesnt exists';
                }
            }
            
            echo $return;
        }//
        if(cget('rename', 'newname')) {
            $src = csec('rename');
            $newname = trim(csec('newname'));
            
            $is_src_file = file_exists($_SERVER['DOCUMENT_ROOT'] . $src);
            $is_src_dir = is_dir($_SERVER['DOCUMENT_ROOT'] . $src);
            
            if( ($is_src_file or $is_src_dir) and ($newname !== '')) {
                if(!$is_src_dir) { //if file
                    $srcfolder = preg_replace('#(.*\/)([^\/]+)$#', '$1', $src);
                    
                    $src = $_SERVER['DOCUMENT_ROOT'] . $src;
                    $dst = $_SERVER['DOCUMENT_ROOT'] . $srcfolder . $newname;
                    
                    $return = (rename($src, $dst)) ? 'done' : 'Failed to rename file';
                } else { //if folder
                    $parentfolder = preg_replace('#(.*\/)([^\/]*\/)$#', '$1', $src);
                    
                    $src = $_SERVER['DOCUMENT_ROOT'] . $src;
                    $dst = $_SERVER['DOCUMENT_ROOT'] . $parentfolder . $newname . '/';
                    
                    $return = (rename($src, $dst)) ? 'done' : 'Failed to rename folder';
                }
            } else {
                $return = 'Incorrect rename data or newname data';
                var_dump('$is_src_file : ' . $is_src_file);
                var_dump(' $is_src_dir : ' . $is_src_dir);
                var_dump(' $newname : "' . $newname . '"');
            }
            
            echo $return;
        }//
        
        if(cget('newfile', 'name')) {
            $src = csec('newfile');
            $name = csec('name');
            
            $src = $_SERVER['DOCUMENT_ROOT'] . $src;
            
            $file = $src . $name;
            
            if(file_exists($src) and (!file_exists($file)) ) {
                if (file_put_contents($file, '') !== false) {
                    echo "done";
                } else {
                    echo "Cannot create file (" . basename($file) . ")";
                }
            } else {
                echo 'the file or the directory already exists';
            }
        }//
        
        if(cget('newfolder', 'name')) {
            $src = csec('newfolder');
            $name = csec('name');
            
            $src = $_SERVER['DOCUMENT_ROOT'] . $src;
            
            if(is_dir($src)) {
                if(!is_dir($src.$name)) {
                    if(mkdir($src.$name, 0777, true)) {
                        $retour = 'done';
                    } else {
                        $retour = 'Cannot create folder (' . $name . ')';
                    }
                } else {
                    $retour = 'This folder already exists';
                }
            } else  {
                $retour = 'Containing folder doesnt exists';
            }
            
            echo $retour;
        }
    } else {
        echo 'no parameters sent';
    }
}

?>