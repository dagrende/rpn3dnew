<template>
  <div id="app">
    <model-viewer class="model-viewer"/>
    <!-- <command-list-viewer class="command-list"/> -->
    <div class="buttons">
      <param-form class="field-row"/>
      <div class="button-row">
        <mutation-button image="cube-icon.png" mutation="addCube" title="cube"/>
        <mutation-button image="cylinder-icon.png" mutation="addCylinder" title="cylinder"/>
        <mutation-button image="torus-icon.png" mutation="addTorus" title="torus"/>
        <mutation-button image="sphere-icon.png" mutation="addSphere" title="sphere"/>
      </div>
      <div class="button-row">
        <mutation-button image="union-icon.svg" mutation="union"/>
        <mutation-button image="difference-icon.svg" mutation="subtract"/>
        <mutation-button image="intersection-icon.svg" mutation="intersect"/>
        <mutation-button text="move" mutation="translate"/>
        <!-- <mutation-button text="scale" mutation="scale"/>
        <mutation-button text="rotate" mutation="rotate"/> -->
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

  export default {
    name: 'app',
    data() {
      return {
      };
    },
    methods: {
      updateX (e) {
        this.$store.commit('updateX', e.target.value)
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

  .model-viewer {
    background-color: #ddd;
    flex: 1;
  }
  .field-row {
    align-self: center;
  }
  .buttons {
    flex: initial;
    display: flex;
    flex-direction: column;
  }
  .button-row  {
  }

</style>
