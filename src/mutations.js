import Vue from 'vue'
import Vuex from 'vuex'
import commandExecutor from './commandExecutor'
import THREE from 'three';
import ThreeBSPMaker from 'three-js-csg';
let ThreeBSP = ThreeBSPMaker(THREE);
import store from './store';


export default {
  addCube(state) {
    console.log('add cube');
    let box = new THREE.BoxGeometry(4, 4, 4).translate(2, 0, 2);
    state.stack.splice(0, 0, new ThreeBSP(new THREE.Mesh(box)));
  },
  addCylinder(state) {
    state.stack.splice(0, 0, new ThreeBSP(new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 4, 32))));
  },
  addTorus(state) {
    const torus = new THREE.TorusGeometry(4, 2, 16, 32).rotateX(3.1416 / 2);
    state.stack.splice(0, 0, new ThreeBSP(new THREE.Mesh(torus)));
  },
  addSphere(state) {
    state.stack.splice(0, 0, new ThreeBSP(new THREE.Mesh(new THREE.SphereGeometry(4, 32, 32))));
  },
  union(state) {
    ensure2Items(()=>state.stack.splice(0, 2, state.stack[1].union(state.stack[0])));
  },
  subtract(state) {
    ensure2Items(()=>state.stack.splice(0, 2, state.stack[1].subtract(state.stack[0])));
  },
  intersect(state) {
    ensure2Items(()=>state.stack.splice(0, 2, state.stack[0].intersect(state.stack[1])));
  }
}

function ensure2Items(f) {
  if (store.state.stack.length < 2) {
    console.error('error: operation requires two stack items');
  } else {
    return f();
  }
}
