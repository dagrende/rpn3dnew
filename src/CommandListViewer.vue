<template>
  <div :hidden="$store.state.commandLog.isEmpty()">
    <div v-for="(command, i) in $store.state.commandLog.list()"
      class="command-log-item"
      :class="{selected: i == $store.state.commandLog.currentIndex()}"
      @click="click($event, i)">{{commands[command.id].title}}</div>
  </div>
</template>
<script>
  import commands from './commands';

  export default {
    data() {
      return {
        commands,
      };
    },
    methods: {
      click(event, i) {
        this.$store.commit('setCommandLogIndex', i)
      }
    }
  }
</script>
<style>
  .command-log-item.selected {
    background-color: white;
  }
</style>
