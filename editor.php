<?php 
    require('verifco.php');
    if(!connected()) {
        //redirect('login');
    } else {
        if(check($_GET)) {
            if(isset($_GET['logout'])) {
                unset($_SESSION["workspace"]);
                redirect('login');
            }
        }
    }
?>
<!DOCTYPE html>
<html>
    <head>
        <?php $title = "WorkSpace"; require_once('include/head.php'); ?>
        <link rel="shortcut icon" href="img/favicon.ico" type="image/x-icon" >
        <meta name="theme-color" content="#1b1c18">
        
        <!-- Ace Editor : text editor !-->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.1/ace.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.1/ext-language_tools.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.1/ext-emmet.js"></script>
        
        <!-- CustoMenu : custom contextmenu !-->
        <link  href="https://cdn.jsdelivr.net/gh/TheRolfFR/custoMenu@2/custoMenu.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/gh/TheRolfFR/custoMenu@2/custoMenu.js"></script>
        
        <!-- miniNotif : custom browser notification !-->
        <link  href="https://cdn.jsdelivr.net/gh/TheRolfFR/miniNotif@2/miniNotif.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/gh/TheRolfFR/miniNotif@2/miniNotif.js"></script>
        
        <!-- FontAwesome : because I like icons -->
        <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.6.0/css/all.css" integrity="sha384-aOkxzJ5uQz7WBObEZcHvV5JvRW3TUc2rNPA7pe3AwnsUohiw1Vj2Rgx2KSOkF5+h" crossorigin="anonymous"> 
        
        <!-- Vue.js + Vuetify -->
        <script src="https://cdn.jsdelivr.net/npm/vue@2.6.8/dist/vue.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/vuetify/dist/vuetify.js"></script>
        <link href="https://cdn.jsdelivr.net/npm/vuetify/dist/vuetify.min.css" rel="stylesheet">
        
        <!-- my js -->
        <script src="js/extensionjs.js"></script>
        <script src="js/ajax.js"></script>
        <script src="js/workspace.js"></script>
        <script src="js/workspace_explorer.js"></script>
        <script src="js/script.js"></script>
        
        <!-- my css -->
        <link rel="stylesheet" href="css/style.css">
    </head>

    <body>
        <v-app id="app">
            <v-layout row justify-center>
                <v-dialog v-model="settingsDialog" max-width="400px">
                  <v-card>
                    <v-card-title>
                        <span class="headline">Settings</span>
                    </v-card-title>
                    
                    <v-list-tile avatar>
                        <v-list-tile-action>
                            <v-checkbox :color="colorTheme" v-model="nightTheme"></v-checkbox>
                        </v-list-tile-action>
                        
                        <v-list-tile-content>
                            <v-list-tile-title>Night theme</v-list-tile-title>
                            <v-list-tile-sub-title>Enable night theme not to burn your eyes</v-list-tile-sub-title>
                        </v-list-tile-content>
                    </v-list-tile>
                    <v-divider></v-divider>
                    
                    <v-list>
                        <v-list-tile>
                            <v-list-tile-content>
                                <v-list-tile-title>Highlighting theme</v-list-tile-title>
                                <v-list-tile-sub-title>Press Ctrl-, in the editor to show settings menu and change theme.</v-list-tile-sub-title>
                            </v-list-tile-content>
                        </v-list-tile>
                    </v-list>
                  </v-card>
                </v-dialog>
              </v-layout>
            
            <!-- snackbar -->
            <v-snackbar
              v-model="snackbar" bottom right :vertical="$vuetify.breakpoint.mdAndDown" :timeout="700">
              {{ snackbarText }}
              <v-btn
                color="lightgray"
                flat
                @click="snackbar = false"
              >
                Close
              </v-btn>
            </v-snackbar>
            <v-navigation-drawer :dark="nightTheme" app id="drawer" v-model="drawer" class="elevation-2" fixed>
                <div id="workspace" class="middle">
                    <img src="img/workspace_logo_no_bg.png" alt=" "><span>WorkSpace</span>
                </div>
                <v-card class="elevation-0 hidden-lg-and-up">
                    <h3>Opened files</h3>
                    
                    <!-- Opened files -->
                    <ul id="list">
                        <li v-for="item in tabs" :key="item.id" :class="[item.mime, 'file']" v-on:click><a href="editors[i]">{{ item.filename }}</a></li>
                    </ul>
                </v-card>
                <div id="explorer" :class="{ desktop: $vuetify.breakpoint.lgAndUp }">
                    <h3 class="hidden-lg-and-up">Explorer</h3>
                </div>
            </v-navigation-drawer>
            <div id="settingspanel" class="middle">
                <div id="settingsform" class="element middle noselect">
                    <div id="left">
                        <img src="https://therolf.fr/workspace/img/workspace_logo_no_bg_white.png" alt="WS">
                    </div><div id="right">
                        <i id="closesettings" class="material-icons">close</i>
                        <h2>WorkSpace Settings</h2>
                        <div>
                            <label id="night" class="bottom">
                                <h3>Night theme</h3> <i class="material-icons" id="nighticon" alt="0">check_box_outline_blank</i>
                              </label>
                            <p>Because night theme is cool.</p>
                        </div>
                        <div>
                            <label for="highlighting"><h3>Highlighting theme</h3></label>
                            <p>Press Ctrl-, in the editor to show settings menu and change theme.</p>
                        </div>
                    </div><span class="taille"></span>
                </div><span class="taille"></span>
            </div>
            
            <!-- Desktop toolbar -->
            <v-toolbar height="48" :color="colorTheme" dark app class="toolbar elevation-2 hidden-md-and-down">
                <v-tabs dark color="transparent" show-arrows v-on:change="switchEditor">
                    <v-tabs-slider></v-tabs-slider>
                    <v-tab v-for="tab in tabs" :key="tab.id" :class="tab.mime" :value="tab.id">{{ tab.filename }}</v-tab>
                </v-tabs>
                
        	    <v-btn icon @click="settingsDialog = true">
                    <v-icon>settings</v-icon>
                </v-btn>
            	
        	    <v-btn icon @click="logout">
                    <v-icon>power_settings_new</v-icon>
                </v-btn>
            </v-toolbar>
            
            <!-- mobile toolbar -->
        	<v-toolbar height="48" :color="colorTheme" dark tabs class="toolbar elevation-2 hidden-lg-and-up">
        	    <v-toolbar-side-icon @click="drawer = !drawer"></v-toolbar-side-icon>
        	    <v-toolbar-title>{{ activeEditorName }}</v-toolbar-title>
        	    <v-spacer></v-spacer>
                
        	    <v-btn icon @click="settingsDialog = true">
                    <v-icon>settings</v-icon>
                </v-btn>
            	
        	    <v-btn icon @click="logout">
                    <a href="?logout"><v-icon>power_settings_new</v-icon></a>
                </v-btn>
        	</v-toolbar>
        </v-app>
    	<div id="editor"></div>
    </body>
</html>
