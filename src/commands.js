import THREE from 'three';
import ThreeBSPMaker from 'three-js-csg';
let ThreeBSP = ThreeBSPMaker(THREE);
import store from './store';

const m4 = new THREE.Matrix4();

export default {
  addCube: {
    title: 'Add Cube',
    params: {x: {type: 'number', defaultValue: 2}, y: {type: 'number', defaultValue: ''}, z: {type: 'number', defaultValue: ''}},
    emptyParamSource: {y: 'x', z: 'x'},
    execute(stack, params) {
      let box = new THREE.BoxGeometry(+params.x, +params.y, +params.z);
      return stack.add(new ThreeBSP(new THREE.Mesh(box)));
    }
  },
  addCylinder: {
    title: 'Cylinder',
    params: {
      r1: {type: 'number', defaultValue: 1},
      r2: {type: 'number', defaultValue: ''},
      h: {type: 'number', defaultValue: 2},
      n: {type: 'number', defaultValue: 32}},
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
    params: {
      ri: {type: 'number', defaultValue: 0.5},
      ro: {type: 'number', defaultValue: 1},
      ni: {type: 'number', defaultValue: 8},
      no: {type: 'number', defaultValue: 16}
    },
    execute(stack, params) {
      return stack.add(new ThreeBSP(new THREE.Mesh(
        new THREE.TorusGeometry(+params.ro, +params.ri, +params.ni, +params.no))));
    }
  },
  addSphere: {
    title: 'Sphere',
    params: {r: {type: 'number', defaultValue: 1}, n1: {type: 'number', defaultValue: 16}, n2: {type: 'number', defaultValue: 8}},
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
    params: {x: {type: 'number', defaultValue: 0}, y: {type: 'number', defaultValue: 0}, z: {type: 'number', defaultValue: 0}},
    execute(stack, params) {
      let mesh = stack.item.toMesh();
      mesh.geometry.applyMatrix(m4.makeTranslation(+params.x, +params.y, +params.z));
      return stack.prev.add(new ThreeBSP(mesh))
    }
  },
  scale: {
    title: 'Scale',
    params: {x: {type: 'number', defaultValue: 1}, y: {type: 'number', defaultValue: ''}, z: {type: 'number', defaultValue: ''}},
    emptyParamSource: {y: 'x', z: 'x'},
    execute(stack, params) {
      let mesh = stack.item.toMesh();
      mesh.geometry.applyMatrix(m4.makeScale(+params.x, +params.y, +params.z));
      return stack.prev.add(new ThreeBSP(mesh))
    }
  },
  rotate: {
    title: 'Rotate',
    params: {x: {type: 'number', defaultValue: 0}, y: {type: 'number', defaultValue: 0}, z: {type: 'number', defaultValue: 0}},
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
    // translate object along each axis to get the same start, center or
    // end coordinate, or be placed before or after the object in stack.prev
    title: 'Align',
    params: {
      x: {
        type: 'select',
        defaultValue: 0,
        options: [
          {title: 'none', value: 0},
          {title: 'left of', value: 1},
          {title: 'left', value: 2},
          {title: 'center', value: 3},
          {title: 'right', value: 4},
          {title: 'right of', value: 5}]
        },
      y: {
        type: 'select',
        defaultValue: 0,
        options: [
          {title: 'none', value: 0},
          {title: 'in front of', value: 1},
          {title: 'front', value: 2},
          {title: 'center', value: 3},
          {title: 'back', value: 4},
          {title: 'behind', value: 5}]
        },
      z: {
        type: 'select',
        defaultValue: 0,
        options: [
          {title: 'none', value: 0},
          {title: 'under', value: 1},
          {title: 'bottom', value: 2},
          {title: 'center', value: 3},
          {title: 'top', value: 4},
          {title: 'on top of', value: 5}]
        }
    },
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
