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
    console.log('buttonCommand', state.commandLog.list.length);
    // a command button has been clicked - find the associated command, prepare the param form and execute it
    //state.stack = store.getLastCommand().stackAfter;
    let command = commands[commandId];
    let params = mapValues(command.params, v=>v.defaultValue);
    let logItem = {id: commandId, params, stack: state.commandLog.current().stack};
    if (command.buttonClick) {
      logItem.stack = command.buttonClick(logItem.stack, logItem.params);
    } else {
      console.log('logItem1', logItem.stack);
      logItem.stack = command.execute(logItem.stack, prepareParams(command, logItem.params))
      console.log('logItem2', logItem.stack);
    }
    state.commandLog = state.commandLog.add(logItem);
    console.log(state.commandLog.list());
  },
  updateField(state, {path, value}) {
    console.log('updateField(state, {',path,', ',value,'})');
    state.commandLog.current().params[path] = value;
    if (!state.commandLog.isEmpty()) {
      let logItem = store.state.commandLog.current();
      let command = commands[logItem.id];
      let f = ()=>{
        if (command.execute) {
          logItem.stack = command.execute(store.state.commandLog.prev().stack, prepareParams(command, logItem.params));
          state.commandLog = state.commandLog.replaceCurrent(logItem);
        }
      };
      debounce(f, 600)();
    }
  },
  setCommandLogIndex(state, i) {
    console.log('setCommandLogIndex', state, i);
    state.commandLog = state.commandLog.setCurrentIndex(i);
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
