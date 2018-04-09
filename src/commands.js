import THREE from 'three';
import ThreeBSPMaker from 'three-js-csg';
let ThreeBSP = ThreeBSPMaker(THREE);
import store from './store';

const m4 = new THREE.Matrix4();

export default {
  addCube: {
    title: 'Add Cube',
    params: {x: 2, y: '', z: ''},
    emptyParamSource: {y: 'x', z: 'x'},
    execute(stack, params) {
      let box = new THREE.BoxGeometry(+params.x, +params.y, +params.z);
      return stack.add(new ThreeBSP(new THREE.Mesh(box)));
    }
  },
  addCylinder: {
    title: 'Cylinder',
    params: {r1: 1, r2: '', h: 2, n: 32},
    emptyParamSource: {r2: 'r1'},
    execute(stack, params) {
      let cylinderGeometry = new THREE.CylinderGeometry(+params.r2, +params.r1, +params.h, +params.n);
      cylinderGeometry.applyMatrix(m4.makeRotationX(90 * Math.PI / 180));
      return stack.add(new ThreeBSP(new THREE.Mesh(
        cylinderGeometry)));
    }
  },
  addTorus: {
    title: 'Torus',
    params: {ri: 0.5, ro: 1, ni: 8, no: 16},
    execute(stack, params) {
      return stack.add(new ThreeBSP(new THREE.Mesh(
        new THREE.TorusGeometry(+params.ro, +params.ri, +params.ni, +params.no))));
    }
  },
  addSphere: {
    title: 'Sphere',
    params: {r: 1, n1: 16, n2: 8},
    execute(stack, params) {
      return stack.add(new ThreeBSP(new THREE.Mesh(
        new THREE.SphereGeometry(+params.r, +params.n1, +params.n2).rotateX(Math.PI / 2))));
    }
  },
  union: {
    title: 'Union',
    execute(stack, params) {
      return stack.prev.prev.add(stack.prev.item.union(stack.item));
    }
  },
  popStack: {
    title: 'pop',
    execute(stack, params) {
      return stack.prev;
    }
  },
  swapStack: {
    title: 'swap',
    execute(stack, params) {
      return stack.prev.prev.add(stack.item).add(stack.prev.item);
    }
  },
  dupStack: {
    title: 'swap',
    execute(stack, params) {
      return stack.add(stack.item);
    }
  },
  subtract: {
    title: 'Subtract',
    execute(stack, params) {
      return stack.prev.prev.add(stack.prev.item.subtract(stack.item));
    }
  },
  intersect: {
    title: 'Intersect',
    execute(stack, params) {
      return stack.prev.prev.add(stack.prev.item.intersect(stack.item));
    }
  },
  translate: {
    title: 'Translate',
    params: {x: 0, y: 0, z: 0},
    execute(stack, params) {
      let mesh = stack.item.toMesh();
      mesh.geometry.applyMatrix(m4.makeTranslation(+params.x, +params.y, +params.z));
      return stack.prev.add(new ThreeBSP(mesh))
    }
  },
  scale: {
    title: 'Scale',
    params: {x: 1, y: '', z: ''},
    emptyParamSource: {y: 'x', z: 'x'},
    execute(stack, params) {
      let mesh = stack.item.toMesh();
      mesh.geometry.applyMatrix(m4.makeScale(+params.x, +params.y, +params.z));
      return stack.prev.add(new ThreeBSP(mesh))
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
      return stack.prev.add(new ThreeBSP(mesh))
    }
  },
  align: {
    title: 'Align',
    params: {x: 0, y: 0, z: 0},   // number is 0=none, 1=before, 2=left, 3=center, 4=right, 5=after
    execute(stack, params) {
      let topMesh = stack.item.toMesh();
      topMesh.geometry.computeBoundingBox();
      let topBB = topMesh.geometry.boundingBox;

      let prevMesh = stack.prev.item.toMesh();
      prevMesh.geometry.computeBoundingBox();
      let prevBB = prevMesh.geometry.boundingBox;

      let d = {x: 0, y: 0, z: 0};
      for (let key in d) {  // for each axis
        let aligmentType = params[key]; //
        if (aligmentType == 1) { // before
          d[key] = prevBB.min[key] - topBB.max[key];
        } else if (aligmentType == 2) { // start
          d[key] = prevBB.min[key] - topBB.min[key];
        } else if (aligmentType == 3) { // center
          d[key] = (prevBB.min[key] + prevBB.max[key]) / 2
                  - (topBB.min[key] + topBB.max[key]) / 2;
        } else if (aligmentType == 4) { // end
          d[key] = prevBB.max[key] - topBB.max[key];
        } else if (aligmentType == 5) { // after
          d[key] = prevBB.max[key] - topBB.min[key];
        }
      }
      topMesh.geometry.applyMatrix(m4.makeTranslation(d.x, d.y, d.z));

      return stack.prev.add(new ThreeBSP(topMesh))
    }
  }
}
