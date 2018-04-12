import Vue from 'vue'
import Vuex from 'vuex'
import commandExecutor from './commandExecutor'
import store from './store';
import { getField, updateField } from 'vuex-map-fields';
import debounce  from 'lodash.debounce'
import commands from './commands'

export default {
  buttonCommand(state, commandId) {
    let command = commands[commandId];
    for (let k in command.params) {
      state.params[k] = command.params[k].defaultValue;
    }
    state.formParams = command.params;

    state.lastCommand = {command: command, stackBefore: state.stack};
    if (command.buttonClick) {
      state.stack = command.buttonClick(state.stack, state.params);
    } else {
      state.stack = command.execute(state.stack, prepareParams(command, state.params))
    }
  },
  updateField(state) {
    updateField(...arguments);
    if (state.lastCommand) {
      let logItem = state.lastCommand;
      let command = logItem.command;
      let f = ()=>{
        if (command.execute) {
          let stack = command.execute(logItem.stackBefore, prepareParams(command, state.params));
          state.stack = stack;
          logItem.stackAfter = stack;
        }
      };
      debounce(f, 600)();
    }
  }
}

function prepareParams(command, params) {
  if (!params || !command.emptyParamSource) {
    return params;
  }
  let p = Object.assign({}, params);
  for (let key in params) {
    if (p[key] === '') {
      p[key] = p[command.emptyParamSource[key]];
    }
  }
  return p;
}
