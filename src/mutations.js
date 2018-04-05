import Vue from 'vue'
import Vuex from 'vuex'
import commandExecutor from './commandExecutor'
import THREE from 'three';
import ThreeBSPMaker from 'three-js-csg';
let ThreeBSP = ThreeBSPMaker(THREE);
import store from './store';
import { getField, updateField } from 'vuex-map-fields';

export default {
  buttonCommand(state, commandId) {
    let command = commands[commandId];
    state.params = Object.assign(state.params, command.params);
    state.commandLog.push({command: command, stackBefore: state.stack});
    if (command.buttonClick) {
      state.stack = command.buttonClick(state.stack, state.params);
    } else {
      state.stack = command.execute(state.stack, state.params)
    }
  },
  updateField(state) {
    updateField(...arguments);
    if (state.commandLog.length > 0) {
      let logItem = state.commandLog[state.commandLog.length - 1];
      let command = logItem.command;
      if (command.execute) {
        let stack = command.execute(logItem.stackBefore, state.params);
        state.stack = stack;
        logItem.stackAfter = stack;
      }
    }
  }
}

const commands = {
  addCube: {
    title: 'Add Cube',
    params: {x: 2, y: 2, z: 2},
    execute(stack, params) {
      let box = new THREE.BoxGeometry(+params.x, +params.y, +params.z);
      return stack.add(new ThreeBSP(new THREE.Mesh(box)));
    }
  },
  addCylinder: {
    title: 'Cylinder',
    params: {r1: 1, r2: 1, h: 2, n: 32},
    execute(stack, params) {
      return stack.add(new ThreeBSP(new THREE.Mesh(
        new THREE.CylinderGeometry(+params.r1, +params.r2, +params.h, +params.n)).rotateX(Math.PI / 2)));
    }
  },
  addTorus: {
    title: 'Torus',
    params: {r1: 1, r2: 2, n1: 16, n2: 32},
    execute(stack, params) {
      return stack.add(new ThreeBSP(new THREE.Mesh(
        new THREE.TorusGeometry(+params.ro, +params.ri, +params.ni, +params.no))));
    }
  },
  addSphere: {
    title: 'Sphere',
    params: {r: 1, n1: 32, n2: 32},
    execute(stack, params) {
      return stack.add(new ThreeBSP(new THREE.Mesh(
        new THREE.SphereGeometry(+params.r, +params.n1, +params.n2).rotateX(Math.PI / 2))));
    }
  },
  union: {
    title: 'Union',
    execute(stack, params) {
      return stack.next.next.add(stack.next.item.union(stack.item));
    }
  },
  subtract: {
    title: 'Subtract',
    execute(stack, params) {
      return stack.next.next.add(stack.next.item.subtract(stack.item));
    }
  },
  intersect: {
    title: 'Intersect',
    execute(stack, params) {
      return stack.next.next.add(stack.next.item.intersect(stack.item));
    }
  },
  translate: {
    title: 'Move',
    params: {x: 0, y: 0, z: 0},
    execute(stack, params) {
      var m4 = new THREE.Matrix4();
      let mesh = stack.item.toMesh();
      mesh.geometry.applyMatrix(m4.makeTranslation(+params.x, +params.y, +params.z));
      return stack.next.add(new ThreeBSP(mesh))
    }
  },
  scale: {
    title: 'Scale',
    params: {x: 1, y: 1, z: 1},
    execute(stack, params) {
      var m4 = new THREE.Matrix4();
      let mesh = stack.item.toMesh();
      mesh.geometry.applyMatrix(m4.makeScale(+params.x, +params.y, +params.z));
      return stack.next.add(new ThreeBSP(mesh))
    }
  },
  rotate: {
    title: 'Rotate',
    params: {x: 0, y: 0, z: 0},
    execute(stack, params) {
      var m4 = new THREE.Matrix4();
      let mesh = stack.item.toMesh();
      mesh.geometry.applyMatrix(m4.makeRotationFromEuler(
        new THREE.Euler(
          +params.x * Math.PI / 180,
          +params.y * Math.PI / 180,
          +params.z * Math.PI / 180, 'XYZ')));
      return stack.next.add(new ThreeBSP(mesh))
    }
  }
}

function ensure2Items(f) {
  if (store.state.stack.length < 2) {
    console.error('error: operation requires two stack items');
  } else {
    return f();
  }
}
