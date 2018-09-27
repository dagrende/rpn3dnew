import commands from './commands';

export function Stack(item, prev, depth = 0) {
  this.item = item;
  this.prev = prev;
  this.add = (item) => new Stack(item, this, depth + 1);
  this.empty = !prev;
  this.depth = depth;
  return this;
}

// list contains command descriptors {id, params, stack}
// currentIndex is the command whos stack is displayed in the viewer
// dirtyIndex says that this command has to be executes, for its stack to be valid
// errorIndex if !== null says that this command was missing stack items to be executable
export function CommandLog(list = [], currentIndex = -1, dirtyIndex = 0, errorIndex = null) {
  // if (errorIndex !== null && errorIndex >=  dirtyIndex) {
  //   errorIndex = null;
  // }
  const emptyStack = new Stack();
  const stackAt = i => i < 0 || i >=list.length ? emptyStack : list[i].stack;
  // returns a copy of list where item start up to end is replaced by executed items
  const executeSlice = (start, end)=>{
    let prevStack = stackAt(start - 1);
    return list.map((listItem, i)=>{
      if (start <= i && i < end && (errorIndex == null || i < errorIndex)) {
        const command = commands[listItem.id];
        if (prevStack.depth >= command.inItemCount) {
          const stack = command.execute(prevStack, prepareParams(command, listItem.params));
          prevStack = stack;
          return {id: listItem.id, params: listItem.params, stack}
        } else {
          errorIndex = i;
          return listItem;
        }
      } else {
        return listItem;
      }
    })
  }
  this.last = ()=>list[list.length - 1];
  this.add = (command)=>new CommandLog([...list, command], currentIndex + 1, dirtyIndex + 1, errorIndex);
  this.replaceIndex = (command, i)=>new CommandLog([...list.slice(0, i), command, ...list.slice(i + 1)], currentIndex, i + 1, errorIndex);
  this.isEmpty = ()=>list.length == 0;
  this.list = ()=>list;
  this.prev = ()=>currentIndex > 0 ? list[currentIndex - 1] : {id: 'noop', params: {}, stack: new Stack()};
  this.current = ()=>currentIndex > -1 ? list[currentIndex] : {id: 'noop', params: {}, stack: new Stack()};
  this.currentIndex = ()=>currentIndex;
  this.errorIndex = ()=>errorIndex;
  this.setCurrentIndex = (i)=>new CommandLog(executeSlice(dirtyIndex, i + 1), i, i + 1, errorIndex);
  this.dirtyIndex = ()=>dirtyIndex
  this.executeCurrent = () => new CommandLog(executeSlice(currentIndex, currentIndex + 1), currentIndex, currentIndex + 1, errorIndex);
  // returns an object suitable for storing
  this.saveFormat = ()=>list.map(item=>({id: item.id, params: item.params}));
  // returns a new CommandLog set from content that is loaded from a file storage
  this.load = content=>new CommandLog(content, 0, errorIndex).setCurrentIndex(content.length - 1);
  this.deleteCurrent = ()=>{
    return new CommandLog([...list.slice(0, currentIndex, errorIndex), ...list.slice(currentIndex + 1)], currentIndex, currentIndex)
      .setCurrentIndex(currentIndex > list.length - 2 ? currentIndex - 1 : currentIndex);
  };
  this.addAfterCurrent = (command) => new CommandLog([...list.slice(0, currentIndex + 1), command, ...list.slice(currentIndex + 1)], currentIndex + 1, currentIndex + 2, errorIndex);
  this.itemByName = name => list.find(item => item.id == 'nameTop' && item.params.name === name);
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
