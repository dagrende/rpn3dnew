import Vue from 'vue'
import Vuex from 'vuex'
import { getField, updateField } from 'vuex-map-fields';
import commandExecutor from './commandExecutor'
import {actions, mutations} from './actionsMutations';
import commands from './commands';
import openSave from './openSave.js'
import {CommandLog, Stack} from './model'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // ordered sequence of commands that manipulates the stack
    // items are {id: 'cube', stack: [csg], params: {x: 2, y: '', z: ''}}
    // stack is after command execution
    // viewer should show stack of last log item
    commandLog: new CommandLog(),
    undoStack: [new CommandLog()],
    undoIndex: 1,
    firstSelected: 1,
    lastSelected: 2,
    currentFile: {name: undefined, id: undefined}
  },
  getters: {
    getField,
    getCommandLog: state => state.commandLog,
    canUndo: state => state.undoIndex > 1,
    canRedo: state => state.undoIndex < state.undoStack.length,
    getFirstSelected: state => state.firstSelected,
    getLastSelected: state => state.lastSelected,
  },
  actions: {
    openHttp: openSave.openHttpAction,
    open: openSave.openAction,
    ...actions
  },
  mutations: {
    ...mutations,
    loadJson: openSave.loadJsonMutation,
    save: openSave.saveMutation
  }
})
