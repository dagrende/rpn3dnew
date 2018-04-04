<template>
  <button class="mutation-button" :style="'background:url(dist/'+ image + ') center / contain no-repeat'" :disabled="disabled"
      @click="$store.commit('buttonCommand', mutation)"
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
    title: String,
    opCount: String
  },
  computed: {
    disabled() {
      return this.opCount && this.$store.state.stack.length < +this.opCount
    }
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
  }
  .mutation-button:disabled {
    opacity: 0.2;
    filter: alpha(opacity=20); /* msie */
  }
</style>
