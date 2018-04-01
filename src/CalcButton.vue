<template>
  <button class="calc-button" :style="'background:url(dist/'+ image + ') center / contain no-repeat'"
      @click="$store.commit(mutation)"
      :title="title || mutation">
    {{text}}
  </button>
</template>
<script>
export default {
  props: {
    mutation: String,
    image: String,
    text: String,
    title: String
  },
  data() {
    return {
    };
  }
}
</script>
<style>
  .calc-button {
    width: 4em;
    height: 4em;
    background-size: contain;
    border: solid #eee 1px;
  }
  .calc-button img {
    /* max-width:100%;
    max-height:100%; */
  }
</style>
