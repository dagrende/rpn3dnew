<template>
  <div :hidden="$store.state.commandLog.isEmpty()" @cut="cut" @copy="copy" @paste="paste">
    <div v-for="(command, i) in $store.state.commandLog.list()"
      class="command-log-item"
      :class="{selected: $store.state.commandLog.selection().indexOf(i) != -1, error: $store.state.commandLog.errorIndex() !== null && i >= $store.state.commandLog.errorIndex()}"
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
      cut(e) {
        console.log(e);
      },
      copy(e) {
        console.log(e);
      },
      paste(e) {
        console.log(e);
      },
      click(event, i) {
        if (event.shiftKey) {

        } else {
          this.$store.commit('setCommandLogIndex', i)
        }
      }
    }
  }
</script>
<style>
.command-log-item.selected {
  background-color: white;
}
.command-log-item.error {
  background-color: red;
}
</style>
