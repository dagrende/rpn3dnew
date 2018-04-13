import THREE from 'three';
import {CSG, CAG} from '@jscad/csg';
import store from './store';

export default {
  addCube: {
    title: 'cube',
    params: {x: {type: 'number', defaultValue: 2}, y: {type: 'number', defaultValue: ''}, z: {type: 'number', defaultValue: ''}},
    emptyParamSource: {y: 'x', z: 'x'},
    execute(stack, params) {
      let cube = CSG.cube({center:[0,0,0],radius:[+params.x / 2, +params.y / 2, +params.z / 2]});
      return stack.add(cube);
    }
  },
  addCylinder: {
    title: 'cylinder',
    params: {
      r1: {type: 'number', defaultValue: 1},
      r2: {type: 'number', defaultValue: ''},
      h: {type: 'number', defaultValue: 2},
      n: {type: 'number', defaultValue: 32}},
    emptyParamSource: {r2: 'r1'},
    execute(stack, params) {
      let cylinder = CSG.cylinder({
          radiusStart: +params.r1,
          radiusEnd: +params.r2,
          start: [0, 0, -+params.h / 2],
          end: [0, 0, +params.h / 2], resolution: +params.n});
      return stack.add(cylinder);
    }
  },
  // addTorus: {
  //   title: 'Torus',
  //   params: {
  //     ri: {type: 'number', defaultValue: 0.5},
  //     ro: {type: 'number', defaultValue: 1},
  //     ni: {type: 'number', defaultValue: 8},
  //     no: {type: 'number', defaultValue: 16}
  //   },
  //   execute(stack, params) {
  //     return stack.add(torus({
  //       ro: +params.ro,
  //       ri: +params.ri,
  //       fno: +params.no,
  //       fni: +params.ni}));
  //   }
  // },
  addSphere: {
    title: 'sphere',
    params: {r: {type: 'number', defaultValue: 1}, n: {type: 'number', defaultValue: 32}},
    execute(stack, params) {
      return stack.add(CSG.sphere({radius: +params.r, resolution:+params.n}));
    }
  },
  union: {
    title: 'union',
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
    title: 'dup',
    execute(stack, params) {
      return stack.add(stack.item);
    }
  },
  subtract: {
    title: 'subtract',
    execute(stack, params) {
      return stack.prev.prev.add(stack.prev.item.subtract(stack.item));
    }
  },
  intersect: {
    title: 'intersect',
    execute(stack, params) {
      return stack.prev.prev.add(stack.prev.item.intersect(stack.item));
    }
  },
  translate: {
    title: 'translate',
    params: {x: {type: 'number', defaultValue: 0}, y: {type: 'number', defaultValue: 0}, z: {type: 'number', defaultValue: 0}},
    execute(stack, params) {
      return stack.prev.add(stack.item.translate([+params.x, +params.y, +params.z]))
    }
  },
  scale: {
    title: 'scale',
    params: {x: {type: 'number', defaultValue: 1}, y: {type: 'number', defaultValue: ''}, z: {type: 'number', defaultValue: ''}},
    emptyParamSource: {y: 'x', z: 'x'},
    execute(stack, params) {
      return stack.prev.add(stack.item.scale([+params.x, +params.y, +params.z]))
    }
  },
  rotate: {
    title: 'rotate',
    params: {x: {type: 'number', defaultValue: 0}, y: {type: 'number', defaultValue: 0}, z: {type: 'number', defaultValue: 0}},
    execute(stack, params) {
      return stack.prev.add(stack.item.rotateX(+params.x).rotateY(+params.y).rotateZ(+params.z))
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
      console.log(stack.item.getBounds(), CAG);
      const topBB = stack.item.getBounds();
      const prevBB = stack.prev.item.getBounds();

      let d = {x: 0, y: 0, z: 0};
      for (let key in d) {  // for each axis
        let aligmentType = params[key]; //
        if (aligmentType == 1) { // before
          d[key] = prevBB[0][key] - topBB[1][key];
        } else if (aligmentType == 2) { // start
          d[key] = prevBB[0][key] - topBB[0][key];
        } else if (aligmentType == 3) { // center
          d[key] = (prevBB[0][key] + prevBB[1][key]) / 2
                  - (topBB[0][key] + topBB[1][key]) / 2;
        } else if (aligmentType == 4) { // end
          d[key] = prevBB[1][key] - topBB[1][key];
        } else if (aligmentType == 5) { // after
          d[key] = prevBB[1][key] - topBB[0][key];
        }
      }
      return stack.prev.add(stack.item.translate([d.x, d.y, d.z]))
    }
  }
}
