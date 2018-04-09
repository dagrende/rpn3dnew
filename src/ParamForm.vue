<template lang="html">
  <div class="field-row">
    <template v-for="(v, k) in $store.state.formParams">
      <span>{{k}}</span><input
        :value="$store.state.params[k]"
        @input="inputChanged($event, k)"
        type="number"
        @click="fieldClick"
        :placeholder="emptyReplacement(k)">
    </template>
  </div>
</template>

<script>
  export default {
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
        let command = this.$store.state.lastCommand.command
        if (command && command.emptyParamSource) {
          return this.$store.state.params[command.emptyParamSource[key]]
        }
      }
    }
  }
</script>

<style scoped>
  .field-row {
    padding: .5em 0 .2em .2em;
  }
  .field-row span {
    padding-left: .3em;
  }
  .field-row input {
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
