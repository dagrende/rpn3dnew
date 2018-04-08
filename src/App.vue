<template>
    <div ref="fullscreen" id="app">
      <button class="fs" type="button" @click="toggleFullscreen"></button>
      <div class="model-viewers">
        <model-viewer stackIndex="0" class="model-viewer top"/>
        <div class="model-viewer stack">
          <model-viewer stackIndex="1" class="model-viewer sx"/>
          <model-viewer stackIndex="2" class="model-viewer sx"/>
          <model-viewer stackIndex="3" class="model-viewer sx"/>
        </div>
      </div>
      <!-- <command-list-viewer class="command-list"/> -->
      <div class="buttons">
        <param-form class="field-row"/>
        <div class="button-row">
          <mutation-button image="cube-icon.png" mutation="addCube" title="cube"/>
          <mutation-button image="cylinder-icon.png" mutation="addCylinder" title="cylinder"/>
          <mutation-button image="torus-icon.png" mutation="addTorus" title="torus"/>
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
        </div>
      </div>
    </div>
</template>

<script>
  import { mapGetters, mapActions, mapMutations } from 'vuex'
  import ModelViewer from './ModelViewer.vue'
  import ParamForm from './ParamForm.vue'
  import CommandListViewer from './CommandListViewer.vue'
  import MutationButton from './MutationButton'
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

  export default {
    name: 'app',
    data() {
      return {
        fullscreen: false
      };
    },
    methods: {
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
  .buttons {
    flex: initial;
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

</style>
