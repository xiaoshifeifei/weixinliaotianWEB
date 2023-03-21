
import 'core-js/stable'
import 'regenerator-runtime/runtime'

import Vue from 'vue'
import App from '@/App'
import store from '@/store'
import router from '@/router'
import mixin from './main-mixin'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

console.log(ElementUI)
Vue.use(ElementUI)

// import './core/lazy-use'
import './core/global-component'
import './core/filter'
import './core/directives'
import './core/core.js'
import '@/permission'
import '@/icons'

// 引入动画样式css
import './assets/transform/transform.css'
// 引入自定义全局css
import '@/assets/css/global.less'
import '@/assets/css/element.less'
import '@/assets/css/im.less'
import '@/assets/css/electron.less'
import VueContextMenu from "@/components/third/vue-contextmenu/VueContextMenu";
Vue.component(VueContextMenu.name, VueContextMenu)

// import countryCodeSelector from 'vue-country-code-selector'
// Vue.component(countryCodeSelector.name, countryCodeSelector)

// import VueContextMenu from 'vue-contextmenujs'
// Vue.use(VueContextMenu)

Vue.config.productionTip = false

const Instance = new Vue({
  router,
  store,
  mixins: [mixin],
  render: h => h(App),
}).$mount('#app')

export default Instance
