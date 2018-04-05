<template lang="html">
  <div class="field-row">
    <span>x</span><input v-model="x" @focus="selectAll">
    <span>y</span><input v-model="y" @focus="selectAll">
    <span>z</span><input v-model="z" @focus="selectAll">
  </div>
</template>

<script>
import { mapFields } from 'vuex-map-fields'

export default {
  computed: {
    ...mapFields([
      'params.x',
      'params.y',
      'params.z'
  ])},
  methods: {
    selectAll(ev) {
      ev.target.setSelectionRange(0, ev.target.value.length)
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
</style>
