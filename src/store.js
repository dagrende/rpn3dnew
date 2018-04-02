import Vue from 'vue'
import Vuex from 'vuex'
import { getField, updateField } from 'vuex-map-fields';
import commandExecutor from './commandExecutor'
import THREE from 'three';
let ThreeBSP = require('three-js-csg')(THREE);
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
  getters: {
      getField,
    },
  mutations: mutations
})
