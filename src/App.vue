<template>
    <div ref="fullscreen" id="app">
      <span class="title" :hidden="editingTitle" @click.stop="editTitle">{{$store.state.currentFile.name || 'Untitled'}}</span>
      <input class="title-edit" :hidden="!editingTitle" @keyup.enter="commitTitleEdit" type="text" v-model="$store.state.currentFile.name">
      <button class="fs" type="button" @click="toggleFullscreen"></button>
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
          <param-form class="field-row"/>
          <div class="button-row">
            <mutation-button image="cube-icon.png" mutation="addCube" title="cube"/>
            <mutation-button image="cylinder-icon.png" mutation="addCylinder" title="cylinder"/>
            <!-- <mutation-button image="torus-icon.png" mutation="addTorus" title="torus"/> -->
            <mutation-button image="sphere-icon.png" mutation="addSphere" title="sphere"/>
            <mutation-button image="pop-icon.svg" mutation="popStack" title="remove top of stack" opCount="1"/>
            <mutation-button image="dup-icon.svg" mutation="dupStack" title="duplicates top of stack" opCount="1"/>
            <mutation-button image="swap-icon.svg" mutation="swapStack" title="swap top two stack items" opCount="2"/>
          </div>
          <div class="button-row">
            <mutation-button image="union-icon.svg" mutation="union" opCount="2"/>
            <mutation-button image="difference-icon.svg" mutation="subtract" opCount="2"/>
            <mutation-button image="intersection-icon.svg" mutation="intersect" opCount="2"/>
            <mutation-button image="translate-icon.svg" mutation="translate" opCount="1"/>
            <mutation-button image="scale-icon.svg" mutation="scale" opCount="1"/>
            <mutation-button image="rotate-icon.svg" mutation="rotate" opCount="1"/>
            <mutation-button image="align-icon.svg" mutation="align" opCount="2"/>
          </div>
          <div class="button-row">
            <button type="button" @click="login">login</button>
            <button type="button" @click="logout">logout</button>
            <button type="button" @click="save">save</button>
            <button type="button" @click="open">open</button>
          </div>
        </div>
        <command-list-viewer class="command-list"/>
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
  import openSave from './openSave.js'
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

  export default {
    name: 'app',
    data() {
      return {
        fullscreen: false,
        editingTitle: false
      };
    },
    methods: {
      editTitle() {
        this.editingTitle = true;
      },
      commitTitleEdit() {
        console.log('commit title');
        this.editingTitle = false;
      },
      login() {
        console.log('login');
        Vue.googleAuth().signIn(function (authorizationCode) {
          console.log('login success');
        }, function (error) {
          console.log('login failure');
        })
      },
      logout() {
        console.log('logout');
        Vue.googleAuth().signOut(function () {
          console.log('logout success');
        }, function (error) {
          console.log('logout failure');
        })
      },
      save() {
        openSave.save();
      },
      open() {
        openSave.open();
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
  .command-list {
    border-left: solid #fff 2px;
    padding: .2em .3em;
    max-height: 5em;
    overflow: scroll;
  }
  .buttons {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  .button-row  {
    margin: .1em;
    padding-left: 4px;
  }
  button.fs {
    width: 24px;
    height: 24px;
    left: 10px;
    top: 10px;
    border: none;
    position: absolute;
    background: url(/dist/fullscreen-icon.svg) center / contain no-repeat;
  }
  span.title, input.title-edit {
      text-align: center;
      position: absolute;
      width: 100%;
      background-color: #ffffff40;
  }
  input.title-edit {
    font-size: 100%;
  }

</style>
