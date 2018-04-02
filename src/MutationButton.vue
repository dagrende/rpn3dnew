<template>
  <button class="mutation-button" :style="'background:url(dist/'+ image + ') center / contain no-repeat'"
      @click="$store.commit(mutation)"
      :title="title || mutation">
    <span>{{text}}</span>
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
  .mutation-button {
    width: 4em;
    height: 4em;
    background-size: contain;
    border: solid #eee 1px;
  }
  .mutation-button span {
    /* position: relative;
    top: 50%;
    transform: translateY(-50%); */
  }
</style>
