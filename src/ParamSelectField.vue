<template lang="html">
  <select
      :value="$store.state.params[paramKey]"
      @input="inputChanged($event, paramKey)">
      <option v-for="option in $store.state.formParams[paramKey].options":value="option.value">{{option.title}}</option>
  </select>
</template>

<script>
  export default {
    props: {
      paramKey: String
    },
    data() {
      return {
      }
    },
    methods: {
      inputChanged(event, key) {
        this.$store.commit('updateField', {path: 'params.' + key, value: event.target.value})
      },
      emptyReplacement(key) {
        let command = commands[this.$store.getters.getLastCommand().id]
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
</style>
