<template>
  <div :hidden="$store.state.commandLog.length == 0">
    <div v-for="command in $store.state.commandLog"
      class="command-log-item"
      :class="{selected: selected.indexOf(command) != -1}"
      @click="click($event, command)">{{commands[command.id].title}}</div>
  </div>
</template>
<script>
  import commands from './commands';

  export default {
    data() {
      return {
        commands,
        selected: []
      };
    },
    methods: {
      click(event, command) {
        console.log(event, command);
        this.selected = [];
        this.selected.push(command);
        this.$store.state.stack = command.stackAfter;
      }
    }
  }
</script>
<style>
  .command-log-item.selected {
    background-color: white;
  }
</style>
