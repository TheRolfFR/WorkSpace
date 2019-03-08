<html>
    <head>
        <meta charset="UTF-8">
        <script src="https://cdn.jsdelivr.net/npm/vue@2.6.8/dist/vue.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/vuetify/dist/vuetify.js"></script>
        <script src="js/tabs.js"></script>
        
        <link href="https://cdn.jsdelivr.net/npm/vuetify/dist/vuetify.min.css" rel="stylesheet">
        <link href="css/base.css" rel="stylesheet">
    </head>
    <body>
        <div id="vue">
            
    <v-app>
    <v-tabs
      dark
      color="#0060ac"
      show-arrows
    >
      <v-tabs-slider color="yellow"></v-tabs-slider>
  
      <v-tab
        v-for="i in 30"
        :key="i"
        :href="'#tab-' + i"
      >
        Item {{ i }}
      </v-tab>
  
      <v-tabs-items>
        <v-tab-item
          v-for="i in 30"
          :key="i"
          :value="'tab-' + i"
        >
          <v-card flat>
            <v-card-text>{{ text }}</v-card-text>
          </v-card>
        </v-tab-item>
      </v-tabs-items>
    </v-tabs>
        </div>
    </body>
</html>