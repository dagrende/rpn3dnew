<template>
  <div id="app">
    <model-viewer class="model-viewer"/>
    <!-- <command-list-viewer class="command-list"/> -->
    <div class="buton-area">
      <div class="buttons">
        <calc-button image="cube-icon.png" mutation="addCube"/>
        <calc-button image="cylinder-icon.png" mutation="addCylinder"/>
        <calc-button image="torus-icon.png" mutation="addTorus"/>
        <calc-button image="sphere-icon.png" mutation="addSphere"/>
      </div>
      <div class="buttons">
        <calc-button image="union-icon.svg" mutation="union"/>
        <calc-button image="difference-icon.svg" mutation="subtract"/>
        <calc-button image="intersection-icon.svg" mutation="intersect"/>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapGetters, mapActions, mapMutations } from 'vuex'
  import ModelViewer from './ModelViewer.vue'
  import CommandListViewer from './CommandListViewer.vue'
  import CalcButton from './CalcButton'
  require('./assets/cube-icon.png')
  require('./assets/cylinder-icon.png')
  require('./assets/torus-icon.png')
  require('./assets/sphere-icon.png')
  require('./assets/union-icon.svg')
  require('./assets/difference-icon.svg')
  require('./assets/intersection-icon.svg')

  export default {
    name: 'app',
    data() {
      return {
      };
    },
    components: {
      ModelViewer,
      CommandListViewer,
      CalcButton
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

  .buttons {
    padding: 0em;
  }

  .model-viewer {
    flex: 1;
  }
</style>
