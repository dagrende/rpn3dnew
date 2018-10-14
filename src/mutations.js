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
    // add the clicked command to commandSlog and execute it with default params
    state.commandLog = state.commandLog.addAfterCurrent([{id: commandId, params: getDefaultParamValues(commands[commandId])}]).executeCurrent();
  },
  updateField(state, {path, value}) {
    // a command parameter has been edited - store its new value and execute the command
    state.commandLog.current().params[path] = value;
    let f = ()=>state.commandLog = state.commandLog.executeCurrent();
    debounce(f, 600)();
  },
  setCommandLogIndex(state, i) {
    state.commandLog = state.commandLog.setCurrentIndex(i);
  },
  deleteLogRow(state) {
    if (state.firstSelected != -1) {
      state.commandLog = state.commandLog.deleteFromTo(state.firstSelected, state.lastSelected);
    }
  },
  pasteCommandList(state, commands) {
    console.log('mutation pasteCommandList', commands);
    let prevIndex = state.commandLog.currentIndex();
    state.commandLog = state.commandLog.addAfterCurrent(commands).setCurrentIndex(prevIndex + commands.length);

  }
}

function getDefaultParamValues(command) {
  let p = {};
  for (let key in command.params) {
    if (p[key] === '' || p[key] === undefined) {
      p[key] = command.params[key].defaultValue;
    }
  }
  return p;
}
