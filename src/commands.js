import THREE from 'three';
import {CSG, CAG} from '@jscad/csg';
import store from './store';
import stlDeSerializer from '@jscad/stl-deserializer';

let namedObjects = {};

export default {
  noop: {
    title: 'noop',
    params: {},
    execute(stack, params) {
      return stack
    }
  },
  center: {
    title: 'center',
    inItemCount: 1,
    execute(stack, params) {
      const topBB = stack.item.getBounds();
      return stack.prev.add(stack.item.translate([
        -(topBB[0].x + topBB[1].x) / 2,
        -(topBB[0].y + topBB[1].y) / 2,
        -(topBB[0].z + topBB[1].z) / 2]))
    }
  },
  nameTop: {
    title: 'name',
    inItemCount: 0,
    params: {name: {type: 'text', defaultValue: ''}},
    execute(stack, params) {
      params.item = stack.item;
      return stack
    }
  },
  addNamedObject: {
    title: 'named',
    inItemCount: 0,
    params: {name: {type: 'text', defaultValue: ''}},
    execute(stack, params, commandLog) {
      let command = commandLog.commandByName(params.name);
      if (command && command.params.item) {
        return stack.add(command.params.item);
      }
      return stack;
    }
  },
  importStl: {
    title: 'stl object',
    inItemCount: 0,
    params: {file: {type: 'stlFile', defaultValue: ''}},
    execute(stack, params) {
// return stack.add(CSG.cube({corner1:[-1, -1, -1],corner2:[1, 1, 1]}));
      // raw stl content to CSG (if needed) and push on stack
      var csgData = CSG.cube();
      if (params.file) {
        csgData = stlDeSerializer.deserialize(atob(params.file.content), undefined, {output: 'csg'})
      }
      return stack.add(csgData);
    }
  },
  addEnclosingBlock: {
    title: 'enclosure',
    inItemCount: 1,
    execute(stack, params) {
      const topBB = stack.item.getBounds();
      return stack.add(CSG.cube({corner1:topBB[0],corner2:topBB[1]}));
    }
  },
  addCube: {
    title: 'cube',
    params: {width: {type: 'number', defaultValue: 2}, depth: {type: 'number', defaultValue: ''}, height: {type: 'number', defaultValue: ''}},
    emptyParamSource: {depth: 'width', height: 'width'},
    inItemCount: 0,
    execute(stack, params) {
      let cube = CSG.cube({center:[0,0,0],radius:[+params.width / 2, +params.depth / 2, +params.height / 2]});
      return stack.add(cube);
    }
  },
  growBlock: {
    title: 'grow block',
    params: {
      left: {type: 'number', defaultValue: 0}, right: {type: 'number', defaultValue: ''},
      front: {type: 'number', defaultValue: 0}, back: {type: 'number', defaultValue: ''},
      down: {type: 'number', defaultValue: 0}, up: {type: 'number', defaultValue: ''}},
    emptyParamSource: {right: 'left', back: 'front', up: 'down'},
    inItemCount: 1,
    execute(stack, params) {
      const topBB = stack.item.getBounds();
      const corners = {
        corner1:[topBB[0].x - +params.left,topBB[0].y - +params.front,topBB[0].z - +params.down],
        corner2:[topBB[1].x + +params.right,topBB[1].y + +params.back,topBB[1].z + +params.up]};
      let cube = CSG.cube(corners);
      return stack.prev.add(cube);
    }
  },
  addCylinder: {
    title: 'cylinder',
    params: {
      rbottom: {type: 'number', defaultValue: 1},
      rtop: {type: 'number', defaultValue: ''},
      height: {type: 'number', defaultValue: 2},
      sides: {type: 'number', defaultValue: 32}},
    emptyParamSource: {rtop: 'rbottom'},
    inItemCount: 0,
    execute(stack, params) {
      let cylinder = CSG.cylinder({
          radiusStart: +params.rbottom,
          radiusEnd: +params.rtop,
          start: [0, 0, -+params.height / 2],
          end: [0, 0, +params.height / 2], resolution: +params.sides});
      return stack.add(cylinder);
    }
  },
  addTorus: {
    title: 'Torus',
    params: {
      ri: {type: 'number', defaultValue: 0.5},
      ro: {type: 'number', defaultValue: 1},
      ni: {type: 'number', defaultValue: 16},
      no: {type: 'number', defaultValue: 32}
    },
    inItemCount: 0,
    execute(stack, params) {
      return stack.add(CAG.circle({radius: +params.ri, resolution: +params.ni})
        .translate([+params.ro, 0])
        .rotateExtrude({resolution: +params.no}));
    }
  },
  addSphere: {
    title: 'sphere',
    params: {r: {type: 'number', defaultValue: 1}, n: {type: 'number', defaultValue: 32}},
    inItemCount: 0,
    execute(stack, params) {
      return stack.add(CSG.sphere({radius: +params.r, resolution:+params.n}));
    }
  },
  popStack: {
    title: 'pop',
    inItemCount: 1,
    execute(stack, params) {
      return stack.prev;
    }
  },
  swapStack: {
    title: 'swap',
    inItemCount: 2,
    execute(stack, params) {
      return stack.prev.prev.add(stack.item).add(stack.prev.item);
    }
  },
  dupStack: {
    title: 'dup',
    inItemCount: 1,
    execute(stack, params) {
      return stack.add(stack.item);
    }
  },
  union: {
    title: 'union',
    inItemCount: 2,
    execute(stack, params) {
      return stack.prev.prev.add(stack.prev.item.union(stack.item));
    }
  },
  subtract: {
    title: 'subtract',
    inItemCount: 2,
    execute(stack, params) {
      return stack.prev.prev.add(stack.prev.item.subtract(stack.item));
    }
  },
  intersect: {
    title: 'intersect',
    inItemCount: 2,
    execute(stack, params) {
      return stack.prev.prev.add(stack.prev.item.intersect(stack.item));
    }
  },
  translate: {
    title: 'translate',
    inItemCount: 1,
    params: {x: {type: 'number', defaultValue: 0}, y: {type: 'number', defaultValue: 0}, z: {type: 'number', defaultValue: 0}},
    execute(stack, params) {
      return stack.prev.add(stack.item.translate([+params.x, +params.y, +params.z]))
    }
  },
  scale: {
    title: 'scale',
    params: {x: {type: 'number', defaultValue: 1}, y: {type: 'number', defaultValue: ''}, z: {type: 'number', defaultValue: ''}},
    emptyParamSource: {y: 'x', z: 'x'},
    inItemCount: 1,
    execute(stack, params) {
      return stack.prev.add(stack.item.scale([+params.x, +params.y, +params.z]))
    }
  },
  rotate: {
    title: 'rotate',
    inItemCount: 1,
    params: {x: {type: 'number', defaultValue: 0}, y: {type: 'number', defaultValue: 0}, z: {type: 'number', defaultValue: 0}},
    execute(stack, params) {
      return stack.prev.add(stack.item.rotateX(+params.x).rotateY(+params.y).rotateZ(+params.z))
    }
  },
  align: {
    // translate object along each axis to get the same start, center or
    // end coordinate, or be placed before or after the object in stack.prev
    title: 'Align',
    inItemCount: 2,
    params: {
      x0: {
        type: 'select',
        defaultValue: 0,
        options: [
          {title: 'none', value: 0},
          {title: 'left', value: 1},
          {title: 'center', value: 2},
          {title: 'right', value: 3}
        ]
        },
      y0: {
        type: 'select',
        defaultValue: 0,
        options: [
          {title: 'none', value: 0},
          {title: 'front', value: 1},
          {title: 'center', value: 2},
          {title: 'back', value: 3}
        ]
        },
      z0: {
        type: 'select',
        defaultValue: 0,
        options: [
          {title: 'none', value: 0},
          {title: 'top', value: 3}
          {title: 'center', value: 2},
          {title: 'bottom', value: 1},
        ]
        },
      x1: {
        type: 'select',
        defaultValue: 0,
        options: [
          {title: '0', value: 0},
          {title: 'left', value: 1},
          {title: 'center', value: 2},
          {title: 'right', value: 3}
        ]
        },
      y1: {
        type: 'select',
        defaultValue: 0,
        options: [
          {title: '0', value: 0},
          {title: 'front', value: 1},
          {title: 'center', value: 2},
          {title: 'back', value: 3}
        ]
        },
      z1: {
        type: 'select',
        defaultValue: 0,
        options: [
          {title: '0', value: 0},
          {title: 'top', value: 3},
          {title: 'center', value: 2},
          {title: 'bottom', value: 1}
        ]
        }
    },
    execute(stack, params) {
      const bb0 = stack.item.getBounds()
      const bb1 = stack.prev.item.getBounds();

      let d = {x: 0, y: 0, z: 0};
      for (let key in d) {  // for each axis
        let aligmentType1 = params[key + '1'];
        if (aligmentType1 == 1) { // start
          d[key] = bb1[0][key];
        } else if (aligmentType1 == 2) { // center
          d[key] = (bb1[0][key] + bb1[1][key]) / 2;
        } else if (aligmentType1 == 3) { // end
          d[key] = bb1[1][key];
        }

        let aligmentType0 = params[key + '0'];
        if (aligmentType0 == 1) { // start
          d[key] -= bb0[0][key];
        } else if (aligmentType0 == 2) { // center
          d[key] -= (bb0[0][key] + bb0[1][key]) / 2;
        } else if (aligmentType0 == 3) { // end
          d[key] -= bb0[1][key];
        }
      }
      return stack.prev.add(stack.item.translate([d.x, d.y, d.z]))
    }
  }
}
