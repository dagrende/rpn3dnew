<template>
  <div ref="fullscreen" id="app">
    <!-- <div class="viewer-parent"> -->
      <model-viewer ref="viewerCanvas" class="model-viewer top"/>
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
              <mutation-button image="repeat-icon.svg" mutation="repeat" title="repeat"/>
              <mutation-button image="const-icon.svg" mutation="const" title="const"/>
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
require('./assets/repeat-icon.svg')
require('./assets/const-icon.svg')

export default {
  name: 'app',
  data() {
    return {
      fullscreen: false,
      editingTitle: false,
      user: {image: 'assets/unknown-user.png'},
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
  mounted() {
    // let self = this;
    // console.log(this.$refs.viewer);
    // this.$refs.viewer.addEventListener('mousedown', events, true);
    // this.$refs.viewer.addEventListener('mousemove', events, true);
    // this.$refs.viewer.addEventListener('mouseup', events, true);
    // this.$refs.viewer.addEventListener('scroll', events, true);
    // function events(e) {
    //   console.log(e);
    //   // self.$refs.viewerCanvas.dispatchEvent(e);
    //   e.preventDefault();
    //
    // }
  },
  methods: {
    adjustSignedInStatus(googleAuth) {
      this.isSignedIn = googleAuth.currentUser.get().isSignedIn();
      console.log('signeIn', this.isSignedIn);
      if (this.isSignedIn) {
        this.user.image = googleAuth.currentUser.get().getBasicProfile().getImageUrl();
      } else {
        this.user.image = 'assets/unknown-user.png';
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
      this.$store.dispatch('openHttp', '/assets/test1.json');
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
  background: url(assets/fullscreen-icon.svg) center / contain no-repeat;
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
