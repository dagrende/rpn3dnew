import Vue from 'vue'
import Vuex from 'vuex'
import commandExecutor from './commandExecutor'
import store from './store';
import { getField, updateField } from 'vuex-map-fields';
import debounce  from 'lodash.debounce';
import mapValues  from 'lodash.mapvalues';
import commands from './commands';

export default {
  buttonCommand(state, commandId) {
    // a command button has been clicked - find the associated command, prepare the param form and execute it
    let command = commands[commandId];
    let params = mapValues(command.params, v=>v.defaultValue);
    let logItem = {id: commandId, params, stack: state.commandLog.current().stack};
    if (command.buttonClick) {
      logItem.stack = command.buttonClick(logItem.stack, logItem.params);
    } else {
      logItem.stack = command.execute(logItem.stack, prepareParams(command, logItem.params))
    }
    state.commandLog = state.commandLog.addAfterCurrent(logItem);
  },
  updateField(state, {path, value}) {
    state.commandLog.current().params[path] = value;
    let f = ()=>{
      state.commandLog = state.commandLog.executeCurrent();
    };
    debounce(f, 600)();
  },
  setCommandLogIndex(state, i) {
    state.commandLog = state.commandLog.setCurrentIndex(i);
  },
  deleteLogRow(state) {
    state.commandLog = state.commandLog.deleteCurrent();
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
