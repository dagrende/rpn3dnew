import Vue from 'vue'
import Vuex from 'vuex'
import { getField, updateField } from 'vuex-map-fields';
import commandExecutor from './commandExecutor'
import mutations from './mutations';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // ordered sequence of commands that manipulates the stack
    // items are {id: 'cube', stack: [csg], params: {x: 2, y: '', z: ''}}
    // stack is after command execution
    // viewer should show stack of last log item
    commandLog: new CommandLog(),
  },
  getters: {
    getField,
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

function CommandLog(list = [], currentIndex = -1) {
  this.last = ()=>list[list.length - 1];
  this.add = (command)=>new CommandLog([...list, command], currentIndex + 1);
  this.replaceCurrent = (command)=>new CommandLog([...list.slice(0, currentIndex), command, ...list.slice(currentIndex + 1)], currentIndex);
  this.isEmpty = ()=>list.length == 0;
  this.list = ()=>list;
  this.prev = ()=>currentIndex > 0 ? list[currentIndex - 1] : {id: 'noop', params: {}, stack: new Stack()};
  this.current = ()=>currentIndex > -1 ? list[currentIndex] : {id: 'noop', params: {}, stack: new Stack()};
  this.currentIndex = ()=>currentIndex;
  this.setCurrentIndex = (i)=>new CommandLog(list, i)
}
