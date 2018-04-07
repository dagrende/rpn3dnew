<template lang="html">
  <div class="field-row">
    <template v-for="(v, k) in $store.state.formParams">
      <span>{{k}}</span><input
        :value="$store.state.params[k]"
        @input="$store.commit('updateField', {path: 'params.' + k, value: $event.target.value})"
        type="number"
        onclick="this.select()">
    </template>
  </div>
</template>

<script>
  export default {
    methods: {
      selectAll(ev) {
        ev.target.setSelect
      }
    },
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
</style>
