import Vue from 'vue'
import Vuex from 'vuex'
import commandExecutor from './commandExecutor'
import THREE from 'three';
import ThreeBSPMaker from 'three-js-csg';
let ThreeBSP = ThreeBSPMaker(THREE);
import store from './store';
import { getField, updateField } from 'vuex-map-fields';
const debounce = require('lodash.debounce');

export default {
  buttonCommand(state, commandId) {
    let command = commands[commandId];
    state.params = Object.assign(state.params, command.params);
    state.formParams = command.params;

    state.lastCommand = {command: command, stackBefore: state.stack};
    if (command.buttonClick) {
      state.stack = command.buttonClick(state.stack, state.params);
    } else {
      state.stack = command.execute(state.stack, state.params)
    }
  },
  updateField(state) {
    updateField(...arguments);
    if (state.lastCommand) {
      let logItem = state.lastCommand;
      let command = logItem.command;
      let f = ()=>{
        console.log('bounce!');
        if (command.execute) {
          let stack = command.execute(logItem.stackBefore, state.params);
          state.stack = stack;
          logItem.stackAfter = stack;
        }
      };
      debounce(f, 1000)();
    }
  }
}

const m4 = new THREE.Matrix4();

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
      let cylinderGeometry = new THREE.CylinderGeometry(+params.r1, +params.r2, +params.h, +params.n);
      cylinderGeometry.applyMatrix(m4.makeRotationX(90 * Math.PI / 180));
      return stack.add(new ThreeBSP(new THREE.Mesh(
        cylinderGeometry)));
    }
  },
  addTorus: {
    title: 'Torus',
    params: {ri: 0.5, ro: 1, ni: 16, no: 32},
    execute(stack, params) {
      return stack.add(new ThreeBSP(new THREE.Mesh(
        new THREE.TorusGeometry(+params.ro, +params.ri, +params.ni, +params.no))));
    }
  },
  addSphere: {
    title: 'Sphere',
    params: {r: 1, n1: 32, n2: 16},
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
      let mesh = stack.item.toMesh();
      mesh.geometry.applyMatrix(m4.makeTranslation(+params.x, +params.y, +params.z));
      return stack.next.add(new ThreeBSP(mesh))
    }
  },
  scale: {
    title: 'Scale',
    params: {x: 1, y: 1, z: 1},
    execute(stack, params) {
      let mesh = stack.item.toMesh();
      mesh.geometry.applyMatrix(m4.makeScale(+params.x, +params.y, +params.z));
      return stack.next.add(new ThreeBSP(mesh))
    }
  },
  rotate: {
    title: 'Rotate',
    params: {x: 0, y: 0, z: 0},
    execute(stack, params) {
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
