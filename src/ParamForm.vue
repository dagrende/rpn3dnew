<template lang="html">
  <div class="field-row">
    <template v-for="(v, k) in params">
      <span>{{k}}</span><component :is='componentByType[v.type]' :paramKey="k"/>
    </template>
  </div>
</template>

<script>
import ParamNumberField from './ParamNumberField.vue';
import ParamSelectField from './ParamSelectField.vue';
import commands from './commands';

  export default {
    data() {
      return {
        componentByType: {
          number: 'ParamNumberField',
          select: 'ParamSelectField'
        }
      }
    },
    computed: {
      params() {
        let current = this.$store.state.commandLog.current();
        console.log('ParamForm params', current);
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
      },
      emptyReplacement(key) {
        let command = this.$store.state.commandLog.last().command
        if (command && command.emptyParamSource) {
          return this.$store.state.params[command.emptyParamSource[key]]
        }
      }
    },
    components: {
      ParamNumberField,
      ParamSelectField
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
