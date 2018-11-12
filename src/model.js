import commands from './commands';
import {compileCode} from './compilecode';

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
          const stack = command.execute(prevStack, prepareParams(command, listItem.params, prevStack), newList);
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
  this.setCurrentIndex = (i) => {
    if (i != currentIndex && 0 <= i && i < list.length) {
      return new CommandLog(executeSlice(dirtyIndex, i + 1), i, i + 1, errorIndex)
    } else {
      return this;
    }
  };
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
  this.addAfterCurrent = (commands) => new CommandLog([...list.slice(0, currentIndex + 1), ...commands, ...list.slice(currentIndex + 1)], currentIndex + commands.length, currentIndex + 1, errorIndex);
  this.commandByName = name => list.find(item => item.id == 'nameTop' && item.params.name === name);
}

// returns an object with all effective param values, after handling any redirect for empty params
export function prepareParams(command, actualParams, prevStack) {
  let s1Bounds = prevStack.item ? prevStack.item.getBounds(): [{x:0,y:0,z:0},{x:0,y:0,z:0}];
  let context = {
    sqrt: Math.sqrt,
    sqr: x => x * x,
    sin: degrees => Math.sin(degrees * Math.PI / 180),
    cos: degrees => Math.cos(degrees * Math.PI / 180),
    tan: degrees => Math.tan(degrees * Math.PI / 180),
    asin: x => Math.asin(x) / Math.PI * 180,
    acos: x => Math.acos(x) / Math.PI * 180,
    atan: x => Math.atan(x) / Math.PI * 180,
    atan2: (y, x) => Math.atan2(y, x) / Math.PI * 180,
    s1: {w: s1Bounds[1].x - s1Bounds[0].x, d: s1Bounds[1].y - s1Bounds[0].y, h: s1Bounds[1].z - s1Bounds[0].z},
    ...commands.constants
  };
  let p = {};
  if (command.params) {
    for (let key in command.params) {
      p[key] = getParamValue(key, command, actualParams, context);
    }
  }
  return p;
}


// returns the value of param key, and redirect to other param if it is empty and there is a redirection
export function getParamValue(key, command, actualParams, context, redirectionsLeft = 10) {
  if (redirectionsLeft > 0) {
    if (actualParams[key] == undefined || actualParams[key] == '') {
      let redirectedKey = command.emptyParamSource && command.emptyParamSource[key];
      if (redirectedKey) {
        return getParamValue(redirectedKey, command, actualParams, context, redirectionsLeft - 1);
      }
      return command.params[key].defaultValue;
    } else {
      let expr = actualParams[key];
      if (command.params[key].type !== 'number') {
        return expr;
      }
      let compiledParam = compileCode("return " + expr);
      let result = compiledParam(context);
      console.log(key,'=',expr,result);
      return result;
      // return expr;
    }
  } else {
    throw 'Circular reference in emptyParamSource for command ' + command.title + ' param ' + key
  }
}
