<template>
  <div class="field-row">
    <template v-for="(v, k) in params">
      <span>{{v.label || k}}</span><component :is='componentByType[v.type]' :paramKey="k"/>
    </template>
  </div>
</template>

<script>
import ParamTextField from './ParamTextField.vue';
import ParamNumberField from './ParamNumberField.vue';
import ParamSelectField from './ParamSelectField.vue';
import ParamStlFileField from './ParamStlFileField.vue'
import commands from './commands';

  export default {
    data() {
      return {
        componentByType: {
          text: 'ParamTextField',
          number: 'ParamNumberField',
          select: 'ParamSelectField',
          stlFile: 'ParamStlFileField'
        }
      }
    },
    computed: {
      params() {
        let current = this.$store.state.commandLog.current();
        if (current) {
          return commands[current.id].params
        } else {
          return {}
        }
      }
    },
    methods: {
      fieldClick(ev) {
        ev.target.select();
      },
      inputChanged(event, key) {
        this.$store.commit('updateField', {path: key, value: event.target.value})
      }
    },
    components: {
      ParamTextField,
      ParamNumberField,
      ParamSelectField,
      ParamStlFileField
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
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  ::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
    opacity: .5; /* Firefox */
}
</style>
