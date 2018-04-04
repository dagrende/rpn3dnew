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
    state.commandLog.push({command: command, stackBefore: state.stack});
    command.buttonClick(state);
  },
  updateField(state) {
    updateField(...arguments);
    if (state.commandLog.length > 0) {
      let logItem = state.commandLog[state.commandLog.length - 1];
      let command = logItem.command;
      console.log('updateField', command);
      if (command.execute) {
        console.log('execute');
        let stack = command.execute(state, state.form, logItem.stackBefore);
        state.stack = stack;
        logItem.stackAfter = stack;
      }
    }
  }
}

const commands = {
  addCube: {
    title: 'Add Cube',
    buttonClick(state) {
      state.form = {x: 2, y: 2, z: 2};
      state.stack = this.execute(state, state.form, state.stack);
    },
    execute(state, params, stack) { // returns new stack
      let box = new THREE.BoxGeometry(params.x, params.y, params.z);
      return state.stack.add(new ThreeBSP(new THREE.Mesh(box)));
    }
  },
  translate: {
    title: 'Move',
    buttonClick(state) {
      state.form = {x: 0, y: 0, z: 0};
      state.stack = this.execute(state, state.form, state.stack);
    },
    execute(state, params, stack) {
      var m1 = new THREE.Matrix4();
      let traMat = m1.makeTranslation(params.x, params.y, params.z);
      let mesh = stack.item.toMesh();
      mesh.geometry.applyMatrix(traMat);
      return stack.next.add(new ThreeBSP(mesh))
    }
  },

  // addCylinder: {
  //   title: '',
  //   mutate(state) {
  //     state.stack.splice(0, 0, new ThreeBSP(new THREE.Mesh(
  //       new THREE.CylinderGeometry(1, 1, 2, 32)).rotateX(Math.PI / 2)));
  //     }
  // },
  // addTorus: {
  //   title: '',
  //   mutate(state) {
  //     const torus = new THREE.TorusGeometry(2, 1, 16, 32);
  //     state.stack.splice(0, 0, new ThreeBSP(new THREE.Mesh(torus)));
  //     }
  // },
  // addSphere: {
  //   title: '',
  //   mutate(state) {
  //     state.stack.splice(0, 0, new ThreeBSP(new THREE.Mesh(new THREE.SphereGeometry(2, 32, 32))));
  //     }
  // },
  // union: {
  //   title: '',
  //   mutate(state) {
  //     ensure2Items(()=>state.stack.splice(0, 2, state.stack[1].union(state.stack[0])));
  //     }
  // },
  // subtract: {
  //   title: '',
  //   mutate(state) {
  //     ensure2Items(()=>state.stack.splice(0, 2, state.stack[1].subtract(state.stack[0])));
  //     }
  // },
  // intersect: {
  //   title: '',
  //   mutate(state) {
  //     ensure2Items(()=>state.stack.splice(0, 2, state.stack[0].intersect(state.stack[1])));
  //     }
  // },
  // scale: {
  //   title: '',
  //   mutate(state) {
  //     let mesh = state.stack[0].toMesh();
  //     mesh.scale.x = +state.form.x;
  //     state.stack.splice(0, 1, new ThreeBSP(mesh))
  //     }
  // },
  // rotate: {
  //   title: '',
  //   mutate(state) {
  //     let mesh = state.stack[0].toMesh()
  //       .rotateX(+state.form.x * Math.PI / 180)
  //       .rotateY(+state.form.y * Math.PI / 180)
  //       .rotateZ(+state.form.z * Math.PI / 180);
  //     state.stack.splice(0, 1, new ThreeBSP(mesh))
  //   }
  // }
}

function ensure2Items(f) {
  if (store.state.stack.length < 2) {
    console.error('error: operation requires two stack items');
  } else {
    return f();
  }
}
