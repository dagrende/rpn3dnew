import Vue from 'vue'
import Vuex from 'vuex'
import commandExecutor from './commandExecutor'
import store from './store';
import { getField, updateField } from 'vuex-map-fields';
import debounce  from 'lodash.debounce'
import commands from './commands'

export default {
  buttonCommand(state, commandId) {
    //state.stack = store.getLastCommand().stackAfter;
    let command = commands[commandId];
    for (let k in command.params) {
      state.params[k] = command.params[k].defaultValue;
    }
    state.formParams = command.params;
    let stackBefore = state.stack;
    if (command.buttonClick) {
      state.stack = command.buttonClick(state.stack, state.params);
    } else {
      state.stack = command.execute(state.stack, prepareParams(command, state.params))
    }
    state.commandLog = state.commandLog.add({id: commandId, stackBefore, stackAfter: state.stack});
  },
  updateField(state) {
    updateField(...arguments);
    if (!state.commandLog.isEmpty()) {
      let logItem = store.state.commandLog.last();
      let command = commands[logItem.id];
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
