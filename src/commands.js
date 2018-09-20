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
      return stack
    }
  },
  addNamedObject: {
    title: 'name',
    inItemCount: 0,
    params: {name: {type: 'text', defaultValue: ''}},
    execute(stack, params) {
      console.log('addNameObject params.name', params.name);
      let command = store.state.commandLog.itemByName(params.name);
      if (command) {
        console.log('item',command.stack.item);
        return stack.add(command.stack.item);
      }
      // let object = stack.add(namedObjects[params.name]);
      // console.log('addNameObject object', object);
      // if (object) {
      //   return stack.add(object);
      // };
      return stack;
    }
  },
  importStl: {
    title: 'stl object',
    inItemCount: 0,
    params: {file: {type: 'stlFile', defaultValue: ''}},
    execute(stack, params) {
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
