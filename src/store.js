import Vue from 'vue';
import Vuex from 'vuex';
import { getField, updateField } from 'vuex-map-fields';
import commandExecutor from './commandExecutor';
import mutations from './mutations';
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
    firstSelected: 1,
    lastSelected: 2,
    currentFile: {name: undefined, id: undefined}
  },
  getters: {
    getField,
    getCommandLog: state => state.commandLog,
    getFirstSelected: state => state.firstSelected,
    getLastSelected: state => state.lastSelected,
  },
  actions: {
    openHttp: openSave.openHttpAction,
    open: openSave.openAction
  },
  mutations: {
    buttonCommand: mutations.buttonCommand,
    updateField: mutations.updateField,
    setCommandLogIndex: mutations.setCommandLogIndex,
    deleteLogRow: mutations.deleteLogRow,
    pasteCommandList: mutations.pasteCommandList,
    loadJson: openSave.loadJsonMutation,
    save: openSave.saveMutation
  }
})
