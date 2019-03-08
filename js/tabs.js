let vm;

document.addEventListener('DOMContentLoaded', function(){
    Vue.config.devtools = true;

    vm = new Vue({
        el: '#vue',
        data() {
            return {
              text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
            }
        }
    })
})