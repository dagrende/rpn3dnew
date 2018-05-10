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
    currentFile: {name: undefined, id: undefined}
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
function logList(list) {
  console.log(list.map(li=>{
    const b = li.stack.item.getBounds();
    return [b[1].x-b[0].x, b[1].y-b[0].y, b[1].z-b[0].z]
  }));
  return list;
}

function CommandLog(list = [], currentIndex = -1, dirtyIndex = 0) {
  const emptyStack = new Stack();
  const stackAt = i => i < 0 || i >=list.length ? emptyStack : list[i].stack;
  // returns a copy of list where item start up to end is replaced by executed items
  const executeSlice = (start, end)=>{
    let prevStack = stackAt(start - 1);
    return list.map((listItem, i)=>{
      if (start <= i && i < end) {
        const command = commands[listItem.id];
        const stack = command.execute(prevStack, prepareParams(command, listItem.params));
        prevStack = stack;
        return {id: listItem.id, params: listItem.params, stack}
      } else {
        return listItem;
      }
    })
  }
  this.last = ()=>list[list.length - 1];
  this.add = (command)=>new CommandLog([...list, command], currentIndex + 1, dirtyIndex + 1);
  this.replaceIndex = (command, i)=>new CommandLog([...list.slice(0, i), command, ...list.slice(i + 1)], currentIndex, i + 1);
  this.isEmpty = ()=>list.length == 0;
  this.list = ()=>list;
  this.prev = ()=>currentIndex > 0 ? list[currentIndex - 1] : {id: 'noop', params: {}, stack: new Stack()};
  this.current = ()=>currentIndex > -1 ? list[currentIndex] : {id: 'noop', params: {}, stack: new Stack()};
  this.currentIndex = ()=>currentIndex;
  this.setCurrentIndex = (i)=>new CommandLog(executeSlice(dirtyIndex, i + 1), i, i + 1);
  this.dirtyIndex = ()=>dirtyIndex
  this.executeCurrent = () => new CommandLog(executeSlice(currentIndex, currentIndex + 1), currentIndex, currentIndex + 1);
  // returns an object suitable for storing
  this.saveFormat = ()=>list.map(item=>({id: item.id, params: item.params}));
  // returns a new CommandLog set from content that is loaded from a file storage
  this.load = content=>new CommandLog(content, 0, 0).setCurrentIndex(content.length - 1);
  this.deleteCurrent = ()=>{
    return new CommandLog([...list.slice(0, currentIndex), ...list.slice(currentIndex + 1)], currentIndex, currentIndex)
      .setCurrentIndex(currentIndex > list.length - 2 ? currentIndex - 1 : currentIndex);
  };
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
