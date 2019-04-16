<template>
    <div ref="fullscreen" id="app">
      <!-- <div class="viewer-parent"> -->
        <model-viewer ref="viewerCanvas" stackIndex="0" class="model-viewer top"/>
      <!-- </div> -->
      <div class="top-row">
        <button class="fs" type="button" @click="toggleFullscreen"></button>
        <span class="title" :hidden="editingTitle" @click.stop="editTitle">{{$store.state.currentFile.name || 'Untitled'}}</span>
        <input class="title-edit" ref="titleField" :hidden="!editingTitle" @keyup.enter="commitTitleEdit" type="text" v-model="$store.state.currentFile.name">
        <button class="user-image" type="button" @click="loginOut" :style="'background:url('+ user.image + ') center / contain no-repeat'"></button>
      </div>
      <div class="main">
        <div class="left-fill">
          <div ref="viewer" class="viewer">
          </div>
          <div class="buttons">
              <param-form class="field-row"/>
              <div class="button-row">
                <mutation-button image="/dist/cube-icon.png" mutation="addCube" title="cube"/>
                <mutation-button image="/dist/cylinder-icon.png" mutation="addCylinder" title="cylinder"/>
                <mutation-button image="/dist/sphere-icon.png" mutation="addSphere" title="sphere"/>
                <mutation-button image="/dist/torus-icon.png" mutation="addTorus" title="torus"/>
                <mutation-button image="/dist/gear-icon.png" mutation="gear"/>
                <mutation-button :image="svgTextIcon('.STL')" mutation="importStl" title="stl object"/>
                <mutation-button :image="svgTextIcon('RCL')" mutation="addNamedObject" title="add named object"/>
                <mutation-button :image="svgTextIcon('POP')" mutation="popStack" title="remove top of stack"/>
                <mutation-button :image="svgTextIcon('DUP')" mutation="dupStack" title="duplicates top of stack"/>
                <mutation-button :image="svgTextIcon('SWAP')" mutation="swapStack" title="swap top two stack items"/>
              </div>
              <div class="button-row">
                <mutation-button image="/dist/union-icon.svg" mutation="union"/>
                <mutation-button image="/dist/difference-icon.svg" mutation="subtract"/>
                <mutation-button image="/dist/intersection-icon.svg" mutation="intersect"/>
                <mutation-button image="/dist/translate-icon.svg" mutation="translate"/>
                <mutation-button image="/dist/scale-icon.svg" mutation="scale"/>
                <mutation-button image="/dist/rotate-icon.svg" mutation="rotate"/>
                <mutation-button :image="svgTextIcon('ALGN')" mutation="align"/>
                <mutation-button :image="svgTextIcon('MIRR')" mutation="mirror"/>
                <mutation-button image="/dist/cube-icon.png" mutation="addEnclosingBlock" title="enclosing block"/>
                <mutation-button image="/dist/cube-icon.png" mutation="growBlock" title="grow block"/>
                <mutation-button :image="svgTextIcon('STO')" mutation="nameTop" title="name current object"/>
                <mutation-button :image="svgTextIcon('#')" mutation="comment" title="#"/>
                <mutation-button :image="svgTextIcon('RPT')" mutation="repeat" title="repeat"/>
                <mutation-button :image="svgTextIcon('CNST')" mutation="const" title="const"/>
                <mutation-button :image="svgTextIcon('TRF')" mutation="transformVertices" title="trf"/>
              </div>
              <div class="button-row">
                <!-- <button type="button" @click="get">get</button> -->
                <button type="button" :disabled="!isSignedIn" @click="open">open</button>
                <button type="button" :disabled="!isSignedIn" @click="save">save</button>
                <button type="button" @click="$store.commit('deleteLogRow')">delete</button>
                <button type="button" :disabled="!$store.getters.canUndo" @click="$store.commit('undo')">undo</button>
                <button type="button" :disabled="!$store.getters.canRedo" @click="$store.commit('redo')">redo</button>
                <button type="button" @click="download">download</button>
              </div>
          </div>
        </div>
        <command-list-viewer class="right command-list"/>
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

  import './assets/unknown-user.png'
  import './assets/cube-icon.png'
  import './assets/cylinder-icon.png'
  import './assets/torus-icon.png'
  import './assets/sphere-icon.png'
  import './assets/union-icon.svg'
  import './assets/difference-icon.svg'
  import './assets/intersection-icon.svg'
  import './assets/translate-icon.svg'
  import './assets/scale-icon.svg'
  import './assets/rotate-icon.svg'
  import './assets/fullscreen-icon.svg'
  import './assets/test1.json'

  export default {
    name: 'app',
    data() {
      return {
        fullscreen: false,
        editingTitle: false,
        user: {image: '/dist/unknown-user.png'},
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
      window.addEventListener( 'keydown', this.keyListener, false);
    },
    destroyed() {
      window.removeEventListener( 'keydown', this.keyListener, false);
    },
    mounted() {
    },
    methods: {
      keyListener(e) {
        if (e.ctrlKey && e.key === 'z') {
          this.$store.commit('undo');
          e.preventDefault();
        } else if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
          this.$store.commit('redo');
          e.preventDefault();
        } else if (e.key === 'Delete') {
          this.$store.commit('deleteLogRow');
          e.preventDefault();
        }
      },
      svgTextIcon(text) {
        return `data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22utf-8%22%3F%3E%0A%3C%21DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%0A%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%0A%20%20version%3D%221.1%22%20baseProfile%3D%22full%22%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%2024.00%2024.00%22%20enable-background%3D%22new%200%200%2024.00%2024.00%22%20xml%3Aspace%3D%22preserve%22%3E%0A%20%20%3Ctext%20x%3D%225%22%20y%3D%2216%22%20font-family%3D%22Verdana%22%20font-size%3D%227%22%20%20stroke%3D%22none%22%20fill%3D%22black%22%3E${encodeURIComponent(text)}%3C%2Ftext%3E%0A%3C%2Fsvg%3E%0A`
      },
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
  body {
    padding: 0;
    margin: 0;
    font-family: helvetica, arial, sans-serif;
  }
  div {
    /* border: solid black 1px; */
  }
  #app {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }
  .top-row {
    display: flex;
    flex-direction: row;
    min-height: 1.2em;
  }
  button.fs {
    width: 15px;
    height: 15px;
    border: none;
    background: url(/dist/fullscreen-icon.svg) center / contain no-repeat;
  }
  span.title, input.title-edit {
    flex: 1;
    text-align: center;
    font-size: 110%;
    background-color: #ffffff40;
  }
  input.title-edit {
    font-size: 100%;
  }
  button.user-image {
    width: 2em;
    height: 2.1em;
    background-size: contain;
    border: none;
    border-radius: 50%;
    outline: 0;
  }
  .top-row {

  }
  .main {
    flex: 1;
    display: flex;
    flex-direction: row;
    min-height: 0;
  }
  .left-fill {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .viewer {
    flex: 1;
    overflow: hidden;
    min-height: 0;
    /* pointer-events: none; */
  }
  .viewer-parent {
    position: absolute;
    z-index: -1;
    width: 100%;
    height: 100%;
  }
  .buttons {
    background-color: #ffffff40;
  }
  .button-row {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
  }
  ::-webkit-scrollbar {
    height: 0px;  /* remove scrollbar space */
    background: transparent;  /* optional: just make scrollbar invisible */
  }

  .mutation-button {
    flex: 0 0 auto;
  }
  .right {
    overflow: scroll;
    background-color: #ffffff40;
    z-index: 100;
  }
</style>
