<template lang="html">
  <div class="field-row">
    <span>x</span><input v-model="x" @focus="selectAll">
    <span>y</span><input v-model="y" @focus="selectAll">
    <span>z</span><input v-model="z" @focus="selectAll">
    <span>r</span><input v-model="r" @focus="selectAll">
    <span>r1</span><input v-model="r1" @focus="selectAll">
    <span>r2</span><input v-model="r2" @focus="selectAll">
    <span>ri</span><input v-model="ri" @focus="selectAll">
    <span>ro</span><input v-model="ro" @focus="selectAll">
    <span>h</span><input v-model="h" @focus="selectAll">
    <span>n</span><input v-model="n" @focus="selectAll">
    <span>ni</span><input v-model="ni" @focus="selectAll">
    <span>no</span><input v-model="no" @focus="selectAll">
  </div>
</template>

<script>
import { mapFields } from 'vuex-map-fields'

export default {
  computed: {
    ...mapFields([
      'params.x',
      'params.y',
      'params.z',
      'params.r',
      'params.r1',
      'params.r2',
      'params.ri',
      'params.ro',
      'params.h',
      'params.n',
      'params.ni',
      'params.no'
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
