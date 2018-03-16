<?php
require('verifco.php');

if(connected()) {
    function listFolderFiles($dir){
        $files = $directories = array();
        $ffs = scandir($dir);

        unset($ffs[array_search('.', $ffs, true)]);
        unset($ffs[array_search('..', $ffs, true)]);

        // prevent empty ordered elements
        if (count($ffs) < 1)
            return;

        foreach($ffs as $ff){
            if(is_dir($dir.'/'.$ff)){
                array_push($directories, $ff . '/');
            } else {
                array_push($files, $ff);
            }
        }
        
        $result = array_merge($directories, $files);
        return $result;
    }

    function sortByType($array) {
        $retour = $types = array();

        foreach($array as $element) {
            $isfile = (preg_match("#(.+)\.(.+)#", $element)) ? 1 : 0;
            
            if($isfile) {
                $ext = preg_replace("#(.+)\.(.+)#", '$2', $element);
                $intypes = in_array($ext, $types);
                if(!$intypes) {
                    array_push($types, $ext);
                }
            } else {
                array_push($retour, $element);
            }
        }
        sort($types);
        foreach($types as $type) {
            foreach($array as $element) {
                $pattern = "/(\." . $type . ")$/";
                if(preg_match($pattern, $element)) {
                    array_push($retour, $element);
                }
            }
        }
        return $retour;
    }

    function format($array, $parent) {
        $retour = '<ol class="custoMe">';

        foreach ($array as $element) {
            if(preg_match('/(.+)\/$/', $element)) {
                $retour .= '<li><a class="folder context custoMe" href="' . $parent . $element . '" data-name="folder" data-src="' . $parent . $element . '">' . rtrim($element,'/') . '</a></li>';
            } else {
                $ext = trim(preg_replace("#(.+)\.(.+)#", '$2', $element), '.');
                $retour .= '<li><a class="context custoMe file ' . $ext . '" href="' . $parent . $element . '" data-name="file" data-src="' . $parent . $element . '" data-ext="' . $ext . '">' . $element . '</a></li>';
            }
        }
        $retour .= '</ol>';
        return $retour;
    }

    if(isset($_GET) and !empty($_GET)) {
        if(check($_GET['folder'])) {
            $folder = htmlspecialchars($_GET['folder']);
            print_r( format(sortByType(listFolderFiles('..'.$folder)), $folder) );
        }
        if(check($_GET['file'])) {
            $retour = array();

            $dir = $_SERVER['DOCUMENT_ROOT'] . sec($_GET['file']);
            
            if(file_exists($dir)) {
                $finfo = finfo_open(FILEINFO_MIME_TYPE); // Retourne le type mime à l'extension mimetype
                $mime = finfo_file($finfo, $dir);
                finfo_close($finfo);
    
                $type = preg_replace('/(.+)\/(.+)/', '$1', $mime);
    
                array_push($retour, $type);
                if($type == 'text') {
                    array_push($retour, '' . file_get_contents($dir));
                }
    
                $retour = json_encode($retour);
                print_r($retour);
            } else {
                print_r("File not existing");
            }

        }
    }
} else {
    echo "not connected";
    return null;
}
?>