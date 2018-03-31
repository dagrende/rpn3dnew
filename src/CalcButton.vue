<template>
  <div class="calc-button" @click="$store.commit(mutation)">
    <img :src="'dist/'+ image" alt="">
    {{text}}
  </div>
</template>
<script>
export default {
  props: {
    mutation: String,
    image: String,
    text: String
  },
  data() {
    return {
    };
  }
}
</script>
<style>
  .calc-button {
    width: 2em;
    height: 2em;
    border: solid #eee 1px;
    //background-color: #ccc;
    display: inline-block;
  }
  .calc-button img {
    max-width:100%;
    max-height:100%;
  }
</style>
