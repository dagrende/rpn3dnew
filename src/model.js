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
// dirtyIndex says that this command has to be executed, for its stack to be valid
// errorIndex if !== null says that this command was missing stack items to be executable
export function CommandLog(list = [], currentIndex = -1, dirtyIndex = 0, errorIndex = null) {
  if (errorIndex !== null && errorIndex >=  dirtyIndex) {
    errorIndex = null;
  }
  const emptyStack = new Stack();
  const stackAt = i => i < 0 || i >=list.length ? emptyStack : list[i].stack;
  // returns a copy of list where item start up to end is replaced by executed items
  const executeSlice = (start, end) => {
    let prevStack = stackAt(start - 1);
    let newList = list.slice();
    for (let i = 0; i < newList.length; i++) {
      let listItem = newList[i];
      if (start <= i && i < end && (errorIndex == null || i < errorIndex)) {
        const command = commands[listItem.id];
        if (prevStack.depth >= command.inItemCount) {
          const stack = command.execute(prevStack, prepareParams(command, listItem.params), newList);
          prevStack = stack;
          listItem = {id: listItem.id, params: listItem.params, stack}
        } else {
          errorIndex = i;
        }
      }
      newList[i] = listItem;
    }
    return newList;
  }
  this.last = () => list[list.length - 1];
  this.add = (command) => new CommandLog([...list, command], currentIndex + 1, dirtyIndex + 1, errorIndex);
  this.replaceIndex = (command, i) => new CommandLog([...list.slice(0, i), command, ...list.slice(i + 1)], currentIndex, i + 1, errorIndex);
  this.isEmpty = () => list.length == 0;
  this.list = () => list;
  this.prev = () => currentIndex > 0 ? list[currentIndex - 1] : {id: 'noop', params: {}, stack: new Stack()};
  this.current = () => currentIndex > -1 ? list[currentIndex] : {id: 'noop', params: {}, stack: new Stack()};
  this.currentIndex = () => currentIndex;
  this.errorIndex = () => errorIndex;
  this.setCurrentIndex = (i) => new CommandLog(executeSlice(dirtyIndex, i + 1), i, i + 1, errorIndex);
  this.dirtyIndex = () => dirtyIndex
  this.executeCurrent = () => new CommandLog(executeSlice(currentIndex, currentIndex + 1), currentIndex, currentIndex + 1, errorIndex);
  // returns an object suitable for storing
  this.saveFormat = () => list.map(item=>({id: item.id, params: item.params}));
  // returns a new CommandLog set from content that is loaded from a file storage
  this.load = content=>new CommandLog(content, -1, 0, null).setCurrentIndex(content.length - 1);
  this.deleteCurrent = () => {
    return new CommandLog([...list.slice(0, currentIndex, errorIndex), ...list.slice(currentIndex + 1)], currentIndex, currentIndex)
      .setCurrentIndex(currentIndex > list.length - 2 ? currentIndex - 1 : currentIndex);
  };
  this.deleteFromTo = (from, to) => {
    return new CommandLog([...list.slice(0, from), ...list.slice(to + 1)], from, from)
      .setCurrentIndex(from >= list.length - (to - from) - 1 ? from - 1 : from);
  };
  this.addAfterCurrent = (commands) => new CommandLog([...list.slice(0, currentIndex + 1), ...commands, ...list.slice(currentIndex + commands.length)], currentIndex + commands.length, currentIndex + 1, errorIndex);
  this.commandByName = name => list.find(item => item.id == 'nameTop' && item.params.name === name);
}

export function prepareParams(command, actualParams) {
  let p = {};
  if (command.params) {
    for (let key in command.params) {
      p[key] = getParamValue(key, command, actualParams);
    }
  }
  return p;
}

export function getParamValue(key, command, actualParams, redirectionsLeft = 10) {
  if (redirectionsLeft > 0) {
    if (actualParams[key] == undefined || actualParams[key] == '') {
      let redirectedKey = command.emptyParamSource && command.emptyParamSource[key];
      if (redirectedKey) {
        return getParamValue(redirectedKey, command, actualParams, redirectionsLeft - 1);
      }
      return command.params[key].defaultValue;
    } else {
      return actualParams[key];
    }
  } else {
    throw 'Circular reference in emptyParamSource for command ' + command.title + ' param ' + key
  }
}
