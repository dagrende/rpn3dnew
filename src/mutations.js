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
    state.params = command.params;
    state.commandLog.push({command: command, stackBefore: state.stack});
    state.stack = command.buttonClick(state.stack, state.params);
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
    buttonClick(stack, params) {
      return this.execute(stack, params);
    },
    execute(stack, params) { // returns new stack
      let box = new THREE.BoxGeometry(params.x, params.y, params.z);
      return stack.add(new ThreeBSP(new THREE.Mesh(box)));
    }
  },
  translate: {
    title: 'Move',
    params: {x: 0, y: 0, z: 0},
    buttonClick(stack, params) {
      return this.execute(stack, params);
    },
    execute(stack, params) {
      var m4 = new THREE.Matrix4();
      let mesh = stack.item.toMesh();
      mesh.geometry.applyMatrix(m4.makeTranslation(params.x, params.y, params.z));
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
  //     mesh.scale.x = +state.params.x;
  //     state.stack.splice(0, 1, new ThreeBSP(mesh))
  //     }
  // },
  // rotate: {
  //   title: '',
  //   mutate(state) {
  //     let mesh = state.stack[0].toMesh()
  //       .rotateX(+state.params.x * Math.PI / 180)
  //       .rotateY(+state.params.y * Math.PI / 180)
  //       .rotateZ(+state.params.z * Math.PI / 180);
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
