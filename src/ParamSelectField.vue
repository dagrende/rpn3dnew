<template>
  <select
      :value="$store.state.commandLog.current().params[paramKey]"
      @input="inputChanged($event, paramKey)">
      <option v-for="option in command.params[paramKey].options" :value="option.value">{{option.title}}</option>
  </select>
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
    computed: {
      command() {
        return commands[this.$store.state.commandLog.current().id]
      }
    },
    methods: {
      inputChanged(event, key) {
        this.$store.commit('updateField', {path: key, value: event.target.value})
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
</style>
