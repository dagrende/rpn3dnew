import Vue from 'vue'
import Vuex from 'vuex'
import { getField, updateField } from 'vuex-map-fields';
import commandExecutor from './commandExecutor'
import THREE from 'three';
import mutations from './mutations';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // ordered sequence of commands that manipulates the stack
    // items are {id: 'cube', stackAfter: [csg], params: {x: 2, y: '', z: ''}}
    commandLog: [],
    // stack of models represented by ThreeBSP objects - stack[0] is displayed in the web page
    stack: new Stack(),
    params: {
      x: 0,
      y: 0,
      z: 0,
      r: 0,
      r1: 0,
      r2: 0,
      ri: 0,
      ro: 0,
      h: 0,
      n: 0,
      ni: 0,
      no: 0
    },
    formParams: {}
  },
  getters: {
    getField,
    getLastCommand: (state) => () => state.commandLog.length > 0 ? state.commandLog[state.commandLog.length - 1] : null,
    getPrevCommand: (state) => (i) => i > state.commandLog.length ? state.commandLog[i - 1] : null,
  },
  mutations
})

function Stack(item, prev, depth = 0) {
  this.item = item;
  this.prev = prev;
  this.add = (item) => new Stack(item, this, depth + 1);
  this.empty = !prev;
  this.depth = depth;
  return this;
}

// function CommandLog() {
//   const commands = [];
//   this.last = ()=>commands[commands.length - 1];
//   this.add = (command)=>commands.push(command);
//   this.isEmpty = ()=>commands.length == 0;
//   this.list = ()=>commands;
// }
