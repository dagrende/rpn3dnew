import Vue from 'vue'
import Vuex from 'vuex'
import commandExecutor from './commandExecutor'
import store from './store';
import { getField, updateField } from 'vuex-map-fields';
import debounce  from 'lodash.debounce';
import mapValues  from 'lodash.mapvalues';
import commands from './commands';

let pathValueCollection = {};
let f = (context, pathValue) => {context.commit('updateField', pathValue); pathValueCollection = {}};
let changeCommandFieldDebounced = debounce(f, 600);

export let actions = {
  changeCommandField(context, pathValue) {
    Object.assign(pathValueCollection, pathValue);
    changeCommandFieldDebounced(context, pathValueCollection)
  }
}

export let mutations = {
  buttonCommand(state, commandId) {
    // add the clicked command to commandSlog and execute it with default params
    setCommandLogUndoable(state, state.commandLog.addAfterCurrent([{id: commandId, params: getDefaultParamValues(commands[commandId])}]).executeCurrent());
  },
  updateField(state, pathValue) {
    // a command parameter has been edited - store its new value and execute the command
    let newCommandLog = state.commandLog.setCurrentParam(pathValue);
    setCommandLogUndoable(state, newCommandLog.executeCurrent());
  },
  undo(state) {
    if (state.undoIndex > 1) {
      state.commandLog = state.undoStack[--state.undoIndex - 1]
    }
  },
  redo(state) {
    if (state.undoIndex < state.undoStack.length) {
      state.commandLog = state.undoStack[state.undoIndex++]
    }
  },
  clearUndoState(state) {
    state.undoStack.length = 1;
    state.undoIndex = 1;
  },
  setCommandLogIndex(state, i) {
    state.commandLog = state.commandLog.setCurrentIndex(i);
  },
  deleteLogRow(state) {
    if (state.firstSelected != -1) {
      setCommandLogUndoable(state, state.commandLog.deleteFromTo(state.firstSelected, state.lastSelected));
    }
  },
  pasteCommandList(state, commands) {
    let prevIndex = state.commandLog.currentIndex();
    setCommandLogUndoable(state, state.commandLog.addAfterCurrent(commands).setCurrentIndex(prevIndex + commands.length));
  }
}

function setCommandLogUndoable(state, commandLog) {
  state.undoStack[state.undoIndex++] = commandLog;
  state.undoStack.length = state.undoIndex;
  state.commandLog = commandLog
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
