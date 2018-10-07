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
// selection is the selected command indices in increasing order - the last is executed and result put on stack
// dirtyIndex says that this command has to be executed, for its stack to be valid
// errorIndex if !== null says that this command was missing stack items to be executable
export function CommandLog(list = [], selection = [], dirtyIndex = 0, errorIndex = null) {
  if (errorIndex !== null && errorIndex >=  dirtyIndex) {
    errorIndex = null;
  }
  const emptyStack = new Stack();
  const stackAt = i => i < 0 || i >=list.length ? emptyStack : list[i].stack;
  // returns a copy of list where item start up to end is replaced by executed items
  const executeSlice = (start, end)=>{
    let prevStack = stackAt(start - 1);
    return list.map((listItem, i)=>{
      if (start <= i && i < end && (errorIndex == null || i < errorIndex)) {
        const command = commands[listItem.id];
        if (prevStack.depth >= command.inItemCount) {
          const stack = command.execute(prevStack, prepareParams(command, listItem.params), this);
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
  function getLastSelected(s = selection) {
    return s.length > 0 ? selection[s.length - 1] : -1;
  }
  this.last = ()=>list[list.length - 1];
  this.add = (command)=>new CommandLog([...list, command], [list.length], dirtyIndex + 1, errorIndex);
  this.replaceIndex = (command, i)=>new CommandLog([...list.slice(0, i), command, ...list.slice(i + 1)], [i], i + 1, errorIndex);
  this.isEmpty = ()=>list.length == 0;
  this.list = ()=>list;
  this.prev = ()=>selection.length > 0 && selection[0] > 0 ? list[selection[0] - 1] : {id: 'noop', params: {}, stack: new Stack()};
  this.current = ()=>selection.length == 1 ? list[selection[0]] : {id: 'noop', params: {}, stack: new Stack()};
  this.selection = ()=>{console.log('selection',selection);return selection};
  this.errorIndex = ()=>errorIndex;
  this.setSelection = (s)=>{
    let i = getLastSelected(s);
    return new CommandLog(executeSlice(dirtyIndex, i + 1), s, i + 1, errorIndex)
  };
  this.dirtyIndex = ()=>dirtyIndex
  this.executeCurrent = () => {
    let i = getLastSelected();
    return new CommandLog(executeSlice(i, i + 1), [i], i + 1, errorIndex)
  };
  // returns an object suitable for storing
  this.saveFormat = ()=>list.map(item=>({id: item.id, params: item.params}));
  // returns a new CommandLog set from content that is loaded from a file storage
  this.load = content=>new CommandLog(content, [], 0, null).setSelection([content.length - 1]);
  this.deleteSelected = ()=>{
    if (selection.length > 0) {
      return new CommandLog([...list.slice(0, selection[0]), ...list.slice(selection[selection.length - 1] + 1)], [selection[0]], selection[0])
      .setSelection(list.length > 0 ? [selection[0]] : []);
    } else {
      return this;
    }
  };
  this.addAfterSelected = (command) => {
    let i = getLastSelected();
    return new CommandLog([...list.slice(0, i + 1), command, ...list.slice(i + 1)], [i + 1], i + 2, errorIndex)};
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
