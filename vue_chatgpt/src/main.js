import { createApp } from 'vue'
import App from './App.vue'

// 修改title
// document.title = 'PowerAI'

// 修改icon
// let link = document.querySelector("link[rel*='icon']") || document.createElement('link')
// link.type = 'image/x-icon'
// link.rel = 'shortcut icon'
// link.href = 'https://powerai.cc/static/3.ico' // 新图标地址
// document.getElementsByTagName('head')[0].appendChild(link)

// import { basicSetup } from 'codemirror'
// import VueCodemirror from 'vue-codemirror'

// const app = createApp()

// app.use(VueCodemirror, {
//     // optional default global options
//     autofocus: true,
//     disabled: false,
//     indentWithTab: true,
//     tabSize: 2,
//     placeholder: 'Code goes here...',
//     extensions: [basicSetup]
//     // ...
// })

createApp(App).mount('#app')

// import ConfirmDialog from './components/ConfirmDialog.vue'
// app.component('confirm-dialog', ConfirmDialog)
