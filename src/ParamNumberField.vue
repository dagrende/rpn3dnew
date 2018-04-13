<template lang="html">
  <input
      :value="$store.state.params[paramKey]"
      @input="inputChanged($event, paramKey)"
      type="number"
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
        this.$store.commit('updateField', {path: 'params.' + key, value: event.target.value})
      },
      emptyReplacement(key) {
        let command = commands[this.$store.state.commandLog.last().id]
        if (command && command.emptyParamSource) {
          return this.$store.state.params[command.emptyParamSource[key]]
        }
      }
    }
  }
</script>

<style scoped>
  input {
    width: 3em;
    text-align: right;
    margin-left: .2em;
  }
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  ::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
    opacity: .5; /* Firefox */
  }
</style>
