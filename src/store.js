import Vue from 'vue'
import Vuex from 'vuex'
import commandExecutor from './commandExecutor'
import THREE from 'three';
import ThreeBSPMaker from 'three-js-csg';
let ThreeBSP = ThreeBSPMaker(THREE);
import mutations from './mutations';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // ordered sequence of commands that manipulates the stack
    commands: ['addCube', 'addCylinder', 'union'],
    // stack of models represented by ThreeBSP objects - stack[0] is displayed in the web page
    stack: [],
    form: {
      x: 0,
      y: 0,
      z: 0
    }
  },
  mutations: mutations
})
