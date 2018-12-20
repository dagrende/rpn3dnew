<template>
  <button class="mutation-button" :style="'background:url(/dist/'+ image + ') center / contain no-repeat'" :disabled="disabled"
      @click="$store.commit('buttonCommand', mutation)"
      :title="title || mutation">
    <span>{{text}}</span>
  </button>
</template>
<script>
import commands from './commands';

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
      const command = commands[this.mutation];
      return command
        && command.inItemCount != undefined
        && this.$store.state.commandLog.current().stack
        && this.$store.state.commandLog.current().stack.depth < command.inItemCount
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
    width: 3em;
    height: 3em;
    background-size: contain;
    border: none;
  }
  .mutation-button span {
  }
  .mutation-button:disabled {
    opacity: 0.2;
    filter: alpha(opacity=20); /* msie */
  }
</style>
