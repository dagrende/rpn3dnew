import Vue from 'vue'
import Vuex from 'vuex'
import { getField, updateField } from 'vuex-map-fields';
import commandExecutor from './commandExecutor'
import mutations from './mutations';
import commands from './commands';

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

function CommandLog(list = [], currentIndex = -1, dirtyIndex = 0) {
  this.last = ()=>list[list.length - 1];
  this.add = (command)=>new CommandLog([...list, command], currentIndex + 1, dirtyIndex + 1);
  this.replaceIndex = (command, i)=>new CommandLog([...list.slice(0, i), command, ...list.slice(i + 1)], currentIndex, i + 1);
  this.isEmpty = ()=>list.length == 0;
  this.list = ()=>list;
  this.prev = ()=>currentIndex > 0 ? list[currentIndex - 1] : {id: 'noop', params: {}, stack: new Stack()};
  this.current = ()=>currentIndex > -1 ? list[currentIndex] : {id: 'noop', params: {}, stack: new Stack()};
  this.currentIndex = ()=>currentIndex;
  this.setCurrentIndex = (i)=>new CommandLog(list, i);
  this.dirtyIndex = ()=>dirtyIndex;
  this.executeIndex = (i)=>{
    let logItem = i >= 0 ? list[i] : {id: 'noop', params: {}, stack: new Stack()};
    let stackBefore = i > 0 ? list[i - 1].stack : new Stack();
    let command = commands[logItem.id];
    if (command.execute) {
      logItem.stack = command.execute(stackBefore, prepareParams(command, logItem.params));
      dirtyIndex = i + 1;
      return this.replaceIndex(logItem, i);
    }
    return this;
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
