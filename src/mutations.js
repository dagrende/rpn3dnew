import Vue from 'vue'
import Vuex from 'vuex'
import commandExecutor from './commandExecutor'
import THREE from 'three';
import ThreeBSPMaker from 'three-js-csg';
let ThreeBSP = ThreeBSPMaker(THREE);
import store from './store';
import { getField, updateField } from 'vuex-map-fields';

export default {
  updateField(state) {
    updateField(...arguments);
    if (state.commandLog.length > 0) {
      let command = state.commandLog[state.commandLog.length - 1];
      if (command.adjust) {
        command.adjust(state);
      }
    }
  },
  buttonCommand(state, commandId) {
    let command = commands[commandId];
    state.commandLog.push(command);
    command.mutate(state);
  }
}

const commands = {
  addCube: {
    title: 'Add Cube',
    mutate(state) {
      state.form.x = 2;
      state.form.y = 2;
      state.form.z = 2;
      let box = new THREE.BoxGeometry(2, 2, 2);
      state.stack.splice(0, 0, new ThreeBSP(new THREE.Mesh(box)));
    },
    adjust(state) {
      let box = new THREE.BoxGeometry(state.form.x, state.form.y, state.form.z);
      state.stack.splice(0, 1, new ThreeBSP(new THREE.Mesh(box)));
    }
  },
  addCylinder: {
    title: '',
    mutate(state) {
      state.stack.splice(0, 0, new ThreeBSP(new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1, 2, 32)).rotateX(Math.PI / 2)));
      }
  },
  addTorus: {
    title: '',
    mutate(state) {
      const torus = new THREE.TorusGeometry(2, 1, 16, 32);
      state.stack.splice(0, 0, new ThreeBSP(new THREE.Mesh(torus)));
      }
  },
  addSphere: {
    title: '',
    mutate(state) {
      state.stack.splice(0, 0, new ThreeBSP(new THREE.Mesh(new THREE.SphereGeometry(2, 32, 32))));
      }
  },
  union: {
    title: '',
    mutate(state) {
      ensure2Items(()=>state.stack.splice(0, 2, state.stack[1].union(state.stack[0])));
      }
  },
  subtract: {
    title: '',
    mutate(state) {
      ensure2Items(()=>state.stack.splice(0, 2, state.stack[1].subtract(state.stack[0])));
      }
  },
  intersect: {
    title: '',
    mutate(state) {
      ensure2Items(()=>state.stack.splice(0, 2, state.stack[0].intersect(state.stack[1])));
      }
  },
  translate: {
    title: 'Move',
    mutate(state) {
      state.form = {x: 0, y: 0, z: 0};
    },
    adjust(state) {
      console.log('adjust');
      var m1 = new THREE.Matrix4();
      let traMat = m1.makeTranslation(state.form.x, state.form.y, state.form.z);
      let mesh = state.stack[0].toMesh();
      mesh.geometry.applyMatrix(traMat);
      state.stack.splice(0, 1, new ThreeBSP(mesh))
    }
  },
  scale: {
    title: '',
    mutate(state) {
      let mesh = state.stack[0].toMesh();
      mesh.scale.x = +state.form.x;
      state.stack.splice(0, 1, new ThreeBSP(mesh))
      }
  },
  rotate: {
    title: '',
    mutate(state) {
      let mesh = state.stack[0].toMesh()
        .rotateX(+state.form.x * Math.PI / 180)
        .rotateY(+state.form.y * Math.PI / 180)
        .rotateZ(+state.form.z * Math.PI / 180);
      state.stack.splice(0, 1, new ThreeBSP(mesh))
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
