<template>
  <div id="commands">
    <div v-for="command in $store.state.commands">{{command}}</div>
  </div>
</template>
<script>
export default {
  data() {
    return {
    };
  }
}
</script>
<style>
</style>
