import Vue from 'vue'
import Vuex from 'vuex'
import commandExecutor from './commandExecutor'
import THREE from 'three';
import ThreeBSPMaker from 'three-js-csg';
let ThreeBSP = ThreeBSPMaker(THREE);


Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // ordered sequence of commands that manipulates the stack
    commands: ['addCube', 'addCylinder', 'union'],
    // stack of models represented by ThreeBSP objects - stack[0] is displayed in the web page
    stack: []
  },
  mutations: {
    addCommand(state) {
      // mutate state
      state.commands.push('translate')
    },
    addCube(state) {
      console.log('add cube');
      let box = new THREE.BoxGeometry(4, 4, 4).translate(2, 2, 0);
      state.stack.splice(0, 0, new ThreeBSP(new THREE.Mesh(box)));
    },
    addCylinder(state) {
      state.stack.splice(0, 0, new ThreeBSP(new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 4, 32))));
    },
    union(state) {
      if (state.stack.length < 2) {
        console.error('union with less than two objects on stack');
      } else {
        state.stack.splice(0, 2, state.stack[0].union(state.stack[1]));
      }
    }
  }
})
