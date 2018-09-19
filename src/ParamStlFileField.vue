// let user upload a stl file
// upload code inspired by https://codepen.io/Atinux/pen/qOvawK
<template lang="html">
  <span><input type="file" @change="onFileChange" accept=".stl" value=""></span>
</template>

<script>
  import commands from './commands';

  export default {
    props: {
      paramKey: String
    },
    data() {
      return {
        name: ''
      }
    },
    computed: {
      fileName() {
        let fileParam = this.$store.state.commandLog.current().params[this.paramKey];
        return fileParam.name || ''
      }
    },
    methods: {
      onFileChange(e) {
        var files = e.target.files || e.dataTransfer.files;
        if (!files.length)
          return;
        this.createImage(files[0]);
      },
      createImage(file) {
        var reader = new FileReader();

        reader.onload = (e) => {
          this.$store.commit('updateField', {path: this.paramKey, value: {name: file.name, content: btoa(e.target.result)}})
        };
        reader.readAsBinaryString(file);
      },
    }
  }
</script>

<style scoped>
  input {
    text-align: right;
    margin-left: .2em;
  }
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  ::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
    opacity: .5; /* Firefox */
  }
</style>
