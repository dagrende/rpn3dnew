import Vue from 'vue';
import App from './App.vue';
import store from './store';
import fullscreen from 'vue-fullscreen';
// import GoogleAuth from './vue-google-oauth';

// Vue.use(fullscreen);

// Vue.use(GoogleAuth, {
//   scope: 'https://www.googleapis.com/auth/drive.file',
//   client_id:
//     '29994050237-f3lub4cu9e3av54fsbsc6rfgcog2lujr.apps.googleusercontent.com'
// });
// window.googleApiLoad = Vue.googleAuth().load();

new Vue({
  el: '#app',
  store,
  render: h => h(App)
});
