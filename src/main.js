import Vue from 'vue'
import App from './App.vue'
import store from './store'
import fullscreen from 'vue-fullscreen'
Vue.use(fullscreen)

new Vue({
  el: '#app',
  store,
  render: h => h(App)
})
