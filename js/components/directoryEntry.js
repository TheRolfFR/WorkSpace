Vue.component('directory-entry', {
    props: ['entry'],
    template:
        '<li>' +
            '<a :class="classes" v-text="$props.entry.name" :data-name="dataName" :data-src="dataSrc"></a>' +
            '<directory v-if="isFolderLoaded" :content="$props.entry.content"></directory>' +
        '</li>',
    computed: {
        classes: function() {
            const result = ['context', 'custoMe']
            
            // insert first classes
            if(this.$props.entry.isFolder) {
                result.splice(0, 0, 'folder')
                
                if(this.isFolderLoading) {
                    result.push('charging')
                }
                else if(this.isFolderLoaded) {
                    result.push('charged')
                }
            } else {
                result.splice(0, 0, 'file')
                
                // append file extension
                result.push(this.$props.entry.name.split('.').pop())
            }
            
            return result
        },
        dataName: function() {
            return this.$props.entry.isFolder ? 'folder' : 'file'
        },
        dataSrc: function() {
            return this.$props.entry.path
        },
        isFolderLoaded: function() {
            return 'content' in this.$props.entry && typeof(this.$props.entry.content) === 'object'
        },
        idFolderLoading: function() {
            return this.$props.isLoading
        }
    }
})