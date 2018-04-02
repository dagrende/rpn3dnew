<template lang="html">
  <div class="field-row">
    <span>x</span><input v-model="x" onFocus="this.setSelectionRange(0, this.value.length)">
    <span>y</span><input v-model="y" onFocus="this.setSelectionRange(0, this.value.length)">
    <span>z</span><input v-model="z" onFocus="this.setSelectionRange(0, this.value.length)">
  </div>
</template>

<script>
import { mapFields } from 'vuex-map-fields'

export default {
  computed: {
    ...mapFields([
      'form.x',
      'form.y',
      'form.z'
  ])}
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
