Vue.component('directory', {
    props: ['content'],
    template: 
        '<ol>' + 
            '<directory-entry v-for="entry in formatedEntries" :key="entry.key" :entry="entry"></directory-entry>' + 
        '</ol>',
    computed: {
        formatedEntries: function() {
            const result = []
            
            let path, name, content
            
            // folder is either a string if not loaded or an object if loaded
            // folders not loaded : { path : foldername, path2: folder2name, ... }
            // or
            // folders but loaded : { path : { folder : (folders), file : (files) }}
            
            let pathsplit
            for(let key in this.$props.content.folder) {
                // set path and name
                path = key
                name = this.$props.content.folder[key]
                
                // reset content
                content = undefined
                
                if(typeof(name) !== 'string') {
                    // folder is loaded with content
                    content = name
                    
                    // the new name is the pre last string of path
                    pathsplit = path.split('/')
                    pathsplit.pop()
                    name = pathsplit.pop()
                    
                    // send folder and content
                    result.push(this.formatEntry(path, name, true, content))
                } else {
                    result.push(this.formatEntry(path, name, true))
                }
            }
            
            // files : [ { path: filename }, ... ].
            
            let file
            for(let index in this.$props.content.file) {
                file = this.$props.content.file[index]
                
                path = Object.keys(file)[0]
                name = file[path]
                
                result.push(this.formatEntry(path, name))
            }
            
            return result
        }
    },
    methods: {
        formatEntry: function(path, name, isFolder = false, content = undefined) {
            const result = {
                isFolder: isFolder,
                content : content,
                key: path,
                path: path,
                name : name
            }
            
            // if it is a folder add loaded fields
            if(isFolder) {
                result.content = content
                result.isLoading = false
            }
            
            return result
        }
    }
})