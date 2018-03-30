<template>
  <div id="app">
    <model-viewer class="model-viewer"/>
    <command-list-viewer class="command-list"/>
    <button type="button" @click="addCommand">Add Command</button>
  </div>
</template>

<script>
  import { mapGetters, mapActions, mapMutations } from 'vuex'
  import ModelViewer from './ModelViewer.vue'
  import CommandListViewer from './CommandListViewer.vue'

  export default {
    name: 'app',
    data() {
      return {
        myCommands: ["cube", "cylinder", "subtract", 'translate'],
        commandList: CommandList
      };
    },
    methods: mapMutations([
      'addCommand'
    ]),
    components: {
      ModelViewer,
      CommandListViewer
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

  .model-viewer, .command-list {
    flex: 1;
  }
</style>
