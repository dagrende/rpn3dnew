import commands from './commands';
import {compileCode} from './compilecode';
import specialFunctions from './specialFunctions';
import {CSG, CAG} from '@jscad/csg';

export function Stack(item, prev, depth = 0) {
  this.item = item;
  this.prev = prev;
  this.add = (item) => new Stack(item, this, depth + 1);
  this.empty = !prev;
  this.depth = depth;
  return this;
}

const emptyStack = new Stack();
const noopCommand = {id: 'noop', params: {}, stack: emptyStack};

// list contains command descriptors {id, params, stack}
// currentIndex is the command whos stack is displayed in the viewer
// dirtyIndex says that this command has to be executed, for its stack to be valid
// errorIndex if !== null says that this command was missing stack items to be executable
export function CommandLog(list = [], currentIndex = -1, dirtyIndex = 0, errorIndex = null) {
  if (errorIndex !== null && errorIndex >=  dirtyIndex) {
    errorIndex = null;
  }
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
          try {
            const stack = command.execute(prevStack, prepareParams(command, listItem.params, prevStack, newList), newList);
            prevStack = stack;
            listItem = {id: listItem.id, params: listItem.params, stack}
          } catch(err) {
            console.error(i,command.id,err);
          }
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
  this.setCurrentParam = (keyValue) => {
    let cmd  = list[currentIndex];
    let newParams = Object.assign({}, cmd.params, keyValue);
    return this.replaceIndex(Object.assign({}, cmd, {params: newParams}), currentIndex)
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
  this.deleteFromTo = (from, to) => // delete indexes from to to (and inluding)
    new CommandLog([...list.slice(0, from), ...list.slice(to + 1)], from - 1, from)
      .setCurrentIndex(to >= list.length - 1 ? from - 1 : from);
  this.addAfterCurrent = (commands) => new CommandLog([...list.slice(0, currentIndex + 1), ...commands, ...list.slice(currentIndex + 1)], currentIndex + commands.length, currentIndex + 1, errorIndex);
  this.commandByName = name => list.find(item => item.id == 'nameTop' && item.params.name === name);
}

// returns an object with all effective param values, after handling any redirect for empty params
export function prepareParams(command, actualParams, prevStack, commandList) {
  let s1Bounds = prevStack.item ? prevStack.item.getBounds(): [{x:0,y:0,z:0},{x:0,y:0,z:0}];
  let toRadians = degrees => degrees * Math.PI / 180;
  let toDegrees = radians => radians / Math.PI * 180;

  let context = {
    // standard functions and constants
    sqrt: Math.sqrt,
    PI: Math.PI,
    sqr: x => x * x,
    abs: x => Math.abs(x),
    sin: degrees => Math.sin(toRadians(degrees)),
    cos: degrees => Math.cos(toRadians(degrees)),
    tan: degrees => Math.tan(toRadians(degrees)),
    asin: x => toDegrees(Math.asin(x)),
    acos: x => toDegrees(Math.acos(x)),
    atan: x => toDegrees(Math.atan(x)),
    atan2: (y, x) => toDegrees(Math.atan2(y, x)),
    CSG,
    Math,
    Vertex: (x, y, z) => new CSG.Vector3D(x, y, z),

    ...specialFunctions,

    // bounds of object on stack below current object
    s1: {w: s1Bounds[1].x - s1Bounds[0].x, d: s1Bounds[1].y - s1Bounds[0].y, h: s1Bounds[1].z - s1Bounds[0].z},

    // user defined constants
    ...commands.constants
  };
  defineNamedObjectProps();
  console.log('s1 size w:', context.s1.w, 'd:',context.s1.d, 'h:',context.s1.h);
  let p = {};
  if (command.params) {
    for (let key in command.params) {
      p[key] = getParamValue(key, command, actualParams, context);
    }
  }
  return p;

  // define context properties for all STOred objects w, d, h, min, max
  function defineNamedObjectProps() {
    console.log('commands', commandList);
    for (let command of commandList) {
      if (command.id === 'nameTop' && command.params.name && command.stack) {
        console.log('define context.', command.params.name);
        Object.defineProperty(context, command.params.name, {
          get: function() {
            let bounds = command.stack.item.getBounds();
            return {w: bounds[1].x - bounds[0].x, d: bounds[1].y - bounds[0].y, h: bounds[1].z - bounds[0].z};
          }
        });
      }
    }
  }
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
      if (key === 'f') {
        console.log('f', result);
      }
      return result;
    }
  } else {
    throw 'Circular reference in emptyParamSource for command ' + command.title + ' param ' + key
  }
}
