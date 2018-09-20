<template lang="html">
  <input
      :value="$store.state.commandLog.current().params[paramKey]"
      @input="inputChanged($event, paramKey)"
      @click="fieldClick"
      :placeholder="emptyReplacement(paramKey)">
</template>

<script>
  import commands from './commands';

  export default {
    props: {
      paramKey: String
    },
    data() {
      return {
      }
    },
    methods: {
      fieldClick(ev) {
        ev.target.select();
      },
      inputChanged(event, key) {
        this.$store.commit('updateField', {path: key, value: event.target.value})
      },
      emptyReplacement(key) {
        let command = commands[this.$store.state.commandLog.current().id]
        if (command && command.emptyParamSource) {
          return this.$store.state.commandLog.current().params[command.emptyParamSource[key]]
        }
      }
    }
  }
</script>

<style scoped>
  input {
    width: 19em;
    text-align: left;
    margin-left: .2em;
  }
  ::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
    opacity: .5; /* Firefox */
  }
</style>
