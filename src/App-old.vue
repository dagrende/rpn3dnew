<template>
    <div ref="fullscreen" id="app">
      <span class="title" :hidden="editingTitle" @click.stop="editTitle">{{$store.state.currentFile.name || 'Untitled'}}</span>
      <input class="title-edit" ref="titleField" :hidden="!editingTitle" @keyup.enter="commitTitleEdit" type="text" v-model="$store.state.currentFile.name">
      <button class="fs" type="button" @click="toggleFullscreen"></button>
      <button class="user-image" type="button" @click="loginOut" :style="'background:url('+ user.image + ') center / contain no-repeat'"></button>
      <div class="model-viewers">
        <model-viewer stackIndex="0" class="model-viewer top"/>
        <div class="model-viewer stack">
          <model-viewer stackIndex="1" class="model-viewer sx"/>
          <model-viewer stackIndex="2" class="model-viewer sx"/>
          <model-viewer stackIndex="3" class="model-viewer sx"/>
        </div>
      </div>
      <div class="controls">
        <div class="buttons">
          <div ref="buttons">
            <param-form class="field-row"/>
            <div class="button-row">
              <mutation-button image="cube-icon.png" mutation="addCube" title="cube"/>
              <mutation-button image="cylinder-icon.png" mutation="addCylinder" title="cylinder"/>
              <mutation-button image="sphere-icon.png" mutation="addSphere" title="sphere"/>
              <mutation-button image="torus-icon.png" mutation="addTorus" title="torus"/>
              <mutation-button image="cube-icon.png" mutation="importStl" title="stl object"/>
              <mutation-button image="named-icon.svg" mutation="addNamedObject" title="add named object"/>
              <mutation-button image="pop-icon.svg" mutation="popStack" title="remove top of stack"/>
              <mutation-button image="dup-icon.svg" mutation="dupStack" title="duplicates top of stack"/>
              <mutation-button image="swap-icon.svg" mutation="swapStack" title="swap top two stack items"/>
            </div>
            <div class="button-row">
              <mutation-button image="union-icon.svg" mutation="union"/>
              <mutation-button image="difference-icon.svg" mutation="subtract"/>
              <mutation-button image="intersection-icon.svg" mutation="intersect"/>
              <mutation-button image="translate-icon.svg" mutation="translate"/>
              <mutation-button image="scale-icon.svg" mutation="scale"/>
              <mutation-button image="rotate-icon.svg" mutation="rotate"/>
              <mutation-button image="align-icon.svg" mutation="align"/>
              <mutation-button image="mirror-icon.svg" mutation="mirror"/>
              <mutation-button image="cube-icon.png" mutation="addEnclosingBlock" title="enclosing block"/>
              <mutation-button image="cube-icon.png" mutation="growBlock" title="grow block"/>
              <mutation-button image="name-icon.svg" mutation="nameTop" title="name current object"/>
              <mutation-button image="comment-icon.svg" mutation="comment" title="#"/>
            </div>
            <div class="button-row">
              <!-- <button type="button" @click="get">get</button> -->
              <button type="button" :disabled="!isSignedIn" @click="open">open</button>
              <button type="button" :disabled="!isSignedIn" @click="save">save</button>
              <button type="button" @click="$store.commit('deleteLogRow')">delete</button>
              <button type="button" @click="download">download</button>
            </div>
          </div>
        </div>
        <command-list-viewer :style="{height: buttonsHeight() + 'px'}" class="command-list"/>
      </div>
    </div>
</template>

<script>
  import Vue from 'vue'
  import { mapGetters, mapActions, mapMutations } from 'vuex'
  import ModelViewer from './ModelViewer.vue'
  import ParamForm from './ParamForm.vue'
  import CommandListViewer from './CommandListViewer.vue'
  import MutationButton from './MutationButton'
  import downloader from 'downloadjs'
  import stlSerializer from '@jscad/stl-serializer'
  import axios from 'axios'

  require('./assets/unknown-user.png')
  require('./assets/cube-icon.png')
  require('./assets/cylinder-icon.png')
  require('./assets/torus-icon.png')
  require('./assets/sphere-icon.png')
  require('./assets/union-icon.svg')
  require('./assets/difference-icon.svg')
  require('./assets/intersection-icon.svg')
  require('./assets/translate-icon.svg')
  require('./assets/scale-icon.svg')
  require('./assets/rotate-icon.svg')
  require('./assets/fullscreen-icon.svg')
  require('./assets/pop-icon.svg')
  require('./assets/swap-icon.svg')
  require('./assets/dup-icon.svg')
  require('./assets/align-icon.svg')
  require('./assets/name-icon.svg')
  require('./assets/named-icon.svg')
  require('./assets/test1.json')
  require('./assets/mirror-icon.svg')
  require('./assets/comment-icon.svg')

  export default {
    name: 'app',
    data() {
      return {
        fullscreen: false,
        editingTitle: false,
        user: {image: 'dist/unknown-user.png'},
        isSignedIn: false,
        buttonsHeight() {
          if (this.$refs.buttons) {
            return this.$refs.buttons.getBoundingClientRect().height
          } else {
            return 30
          }
        }
      }
    },
    created() {
      let self = this;
      window.googleApiLoad.then(function() {
        gapi.auth2.getAuthInstance().then(function(googleAuth) {
          self.adjustSignedInStatus(googleAuth);
          googleAuth.currentUser.listen(function() {
            self.adjustSignedInStatus(googleAuth)
          });
        })
      })
    },
    methods: {
      adjustSignedInStatus(googleAuth) {
        this.isSignedIn = googleAuth.currentUser.get().isSignedIn();
        console.log('signeIn', this.isSignedIn);
        if (this.isSignedIn) {
          this.user.image = googleAuth.currentUser.get().getBasicProfile().getImageUrl();
        } else {
          this.user.image = 'dist/unknown-user.png';
        }
      },
      editTitle() {
        this.editingTitle = true;
        setTimeout(()=>{
          this.$refs.titleField.focus();
          this.$refs.titleField.select()
        }, 10)
      },
      commitTitleEdit() {
        console.log('commit title');
        this.editingTitle = false;
      },
      loginOut() {
        if (gapi.auth2.getAuthInstance().currentUser.get().isSignedIn()) {
          this.logout();
        } else {
          this.login();
        }
      },
      login() {
        console.log('login');
        let self = this;
        Vue.googleAuth().signIn(function (authorizationCode) {
          console.log('login success');
        }, function (error) {
          console.log('login failure');
        })
      },
      logout() {
        console.log('logout');
        let self = this;
        Vue.googleAuth().signOut(function () {
          console.log('logout success');
        }, function (error) {
          console.log('logout failure');
        })
      },
      get() {
        this.$store.dispatch('openHttp', '/dist/test1.json');
      },
      open() {
        this.$store.dispatch('open');
      },
      save() {
        this.$store.commit('save')
      },
      download() {
        const rawData = stlSerializer.serialize(this.$store.state.commandLog.current().stack.item)
        const blob = new Blob(rawData)
        downloader(blob, this.$store.state.currentFile.name + '.stl' || 'Untitled', 'application/slb')
      },
      updateX (e) {
        this.$store.commit('updateX', e.target.value)
      },
      toggleFullscreen () {
        this.$fullscreen.toggle(this.$refs['fullscreen'], {background: '#eee'})
      }
    },
    components: {
      ModelViewer,
      CommandListViewer,
      MutationButton,
      ParamForm
    }
  }
</script>

<style>
  html, body {
    margin: 0;
    padding: 0;
  }

  #app {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 4px);
    background-color: #eee;
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    align-items: stretch;
  }

  .model-viewers {
    background-color: #ddd;
    flex: 1;
    display: flex;
    flex-direction: row;
  }
  .model-viewer.top {
    flex: 8;
    border-right: solid #e8e8e8 1px;
  }
  .model-viewer.stack {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .model-viewer.sx {
    flex: 1;
  }
  .field-row {
  }
  .controls {
    flex: initial;
    display: flex;
    flex-direction: row;
  }
  .buttons {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .command-list {
    border-left: solid #fff 2px;
    padding: .2em .3em;
    overflow: scroll;
    height: 2em
  }
  .button-row  {
    margin: .1em;
    padding-left: 4px;
  }
  button.fs {
    width: 15px;
    height: 15px;
    border: none;
    position: absolute;
    background: url(/dist/fullscreen-icon.svg) center / contain no-repeat;
  }
  span.title, input.title-edit {
      text-align: center;
      position: absolute;
      width: 100%;
      font-size: 125%;
      background-color: #ffffff40;
  }
  input.title-edit {
    font-size: 100%;
  }
  button.user-image {
    position: absolute;
    top: 2px;
    right: 2px;
    width: 2em;
    height: 2em;
    background-size: contain;
    border: none;
    border-radius: 50%;
    outline: 0;
  }

</style>
<template>
    <div ref="fullscreen" id="app">
      <!-- <model-viewer stackIndex="0" class="model-viewer top"/> -->
      <div class="top-row">
        hej
        <!-- <span class="title" :hidden="editingTitle" @click.stop="editTitle">{{$store.state.currentFile.name || 'Untitled'}}</span>
        <input class="title-edit" ref="titleField" :hidden="!editingTitle" @keyup.enter="commitTitleEdit" type="text" v-model="$store.state.currentFile.name">
        <button class="fs" type="button" @click="toggleFullscreen"></button>
        <button class="user-image" type="button" @click="loginOut" :style="'background:url('+ user.image + ') center / contain no-repeat'"></button> -->
      </div>
      <div class="main">
        <div class="left-fill">
          <div class="viewer">

          </div>
          <div class="buttons">
            <param-form class="field-row"/>
            <div class="button-row">
