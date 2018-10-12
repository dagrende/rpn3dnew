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
    params: {
      width: {type: 'number', defaultValue: 2},
      depth: {type: 'number', defaultValue: ''},
      height: {type: 'number', defaultValue: ''},
      rx: {type: 'number', defaultValue: '0'},
      ry: {type: 'number', defaultValue: ''},
      rz: {type: 'number', defaultValue: ''},
      resolution: {type: 'number', defaultValue: '16'}
    },
    emptyParamSource: {depth: 'width', height: 'width', ry: 'rx', rz: 'rx'},
    inItemCount: 0,
    execute(stack, params) {
      let cube = flexiCube([+params.width, +params.depth, +params.height], [+params.rx, +params.ry, +params.rz], +params.resolution);
      return stack.add(cube);

      function flexiCube(size, edgeRadius = [0, 0, 0], resolution = 16) {
        let axes012 = [0, 1, 2];
        let boxRadius = [size[0] / 2, size[1] / 2, size[2] / 2];
        var cube = CSG.cube({center: [0, 0, 0], radius: boxRadius});
        let cylinderOut = axes012.map(i => boxRadius[i] - edgeRadius[i]);

        // draw all necessary edge radiuses
        axes012.forEach(axis => {
          // axis is 0,1,2 for x,y,z
          if (edgeRadius[axis] > 0) {
            // this is a rounded axis
            let cornerBox = CSG.cube({center: [0, 0, 0], radius: axes012.map(i => i == axis ? boxRadius[axis] : edgeRadius[axis])});
            let edgeCylinder = CSG.cylinder({start: axes012.map(i => i == axis ? -boxRadius[i] : 0),
              end: axes012.map(i => i == axis ? boxRadius[i] : 0), radius: edgeRadius[axis], resolution});
            // iterate over edges
            [0,1,2,3].forEach(edgeNumber => {  // iterate over four rounded edges for an axis: edgeNumber bit 0 is upper/lower, bit 1 is left/right
              // combin(i)
              let combin = i => {let j = i > axis ? i - 1 : i; return (edgeNumber >> j) & 1 ? 1 : -1};
              let edgeBoxTranslated = cornerBox.translate(axes012.map(i => i == axis ? 0 : combin(i) * boxRadius[i]));
              let edgeCylinderTranslated = edgeCylinder.translate(axes012.map(i => i == axis ? 0 : combin(i) * (boxRadius[i] - edgeRadius[axis])));
              cube = cube.subtract(edgeBoxTranslated.subtract(edgeCylinderTranslated))
            });
          }
        });

        // classify edge radiuses
        let sortedNonZeroRadiuses = edgeRadius.filter(r => r > 0).sort().filter((element, index, array) => index == 0 || element !== array[index - 1]);
        // the list of axes for each radius
        let axisByRadius = sortedNonZeroRadiuses.map(r => [0, 1, 2].filter(i => edgeRadius[i] == r));

        // improve corners in two special cases
        if (sortedNonZeroRadiuses.length == 1 && axisByRadius[0].length == 3) {
          // three equal radiuses - form spherical corners
          let r = edgeRadius[0];
          let sphere8th = CAG.rectangle({center: [r / 2, r / 2], radius: [r / 2, r / 2]})
            .subtract(CAG.circle({center: [0, 0], radius: r, resolution: resolution}))
            .rotateExtrude({angle: 90, resolution: resolution / 4}).rotateX(180);
          let sphere8thTranslated = sphere8th.translate(axes012.map(i => -(boxRadius[i] - r)));

          // iterate over corners
          [0, 1, 2, 3, 4, 5, 6, 7].forEach(cornerNumber => {
            let bit = i => (cornerNumber >> i) & 1;
            let mirroredSphere8th = ['mirroredX','mirroredY','mirroredZ']
              .reduce((ack, f, i) => bit(i) ? ack[f]() : ack, sphere8thTranslated)
            cube = cube.subtract(mirroredSphere8th)
          });
        } else if (sortedNonZeroRadiuses.length == 2 && axisByRadius[0].length == 2) {
          // two small and one large radius - form torical corners

          // same as for spherical, but from the axis with large radius
          let largeAxis = axisByRadius[1][0];
          let oneSmallAxis = axisByRadius[0][0];

          let rl = edgeRadius[largeAxis];
          let r = edgeRadius[oneSmallAxis];
          let rlmr = rl - r;
          let sphere8th = CAG.rectangle({center: [r / 2 + rlmr, r / 2], radius: [r / 2, r / 2]})
            .subtract(CAG.circle({center: [rlmr, 0], radius: r, resolution: resolution}))
            .rotateExtrude({angle: 90, resolution: resolution / 4});
            if (largeAxis == 0) {
              sphere8th = sphere8th.rotateY(90);
            } else if (largeAxis == 1) {
              sphere8th = sphere8th.rotateX(90).rotateZ(180);
            } else if (largeAxis == 2) {
              sphere8th = sphere8th.rotateZ(-90);
            }
          let sphere8thTranslated = sphere8th.translate(axes012.map(i => boxRadius[i] - (i == largeAxis ? r : rl)));

          // iterate over corners
          [0, 1, 2, 3, 4, 5, 6, 7].forEach(cornerNumber => {
            let bit = i => (cornerNumber >> i) & 1;
            let mirroredSphere8th = ['mirroredX','mirroredY','mirroredZ']
              .reduce((ack, f, i) => bit(i) ? ack[f]() : ack, sphere8thTranslated)
            cube = cube.subtract(mirroredSphere8th)
          });
        } else {
          // no special corners
        }
        return cube;
      }

    }
  },
  growBlock: {
    title: 'grow block',
    params: {
      left: {type: 'number', defaultValue: 0}, right: {type: 'number', defaultValue: ''},
      front: {type: 'number', defaultValue: ''}, back: {type: 'number', defaultValue: ''},
      down: {type: 'number', defaultValue: ''}, up: {type: 'number', defaultValue: ''}},
    emptyParamSource: {right: 'left', back: 'front', up: 'down', front: 'left', down: 'left'},
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
      sides: {type: 'number', defaultValue: 32},
      roundRadiusTop: {type: 'number', defaultValue: '0'},
      roundRadiusBottom: {type: 'number', defaultValue: '0'},
      roundResolution: {type: 'number', defaultValue: '32'}},
    emptyParamSource: {rtop: 'rbottom'},
    inItemCount: 0,
    execute(stack, params) {
      let cylParams = {
          radiusStart: +params.rbottom,
          radiusEnd: +params.rtop,
          start: [0, 0, -+params.height / 2],
          end: [0, 0, +params.height / 2],
          resolution: +params.sides};
      let roundRadiusBottom = +params.roundRadiusBottom;
      let roundRadiusTop = +params.roundRadiusTop;
      let roundResolution = +params.roundResolution;

      let cylinder = CSG.cylinder(cylParams);

      if (roundRadiusBottom > 0) {
        let edgeRemoval = CAG.rectangle({center: [0, 0], radius: [roundRadiusBottom, roundRadiusBottom]})
          .subtract(CAG.circle({center: [-roundRadiusBottom, roundRadiusBottom], radius: roundRadiusBottom, resolution: roundResolution}))
          .translate([cylParams.radiusStart, cylParams.start[2]])
          .rotateExtrude({resolution: cylParams.resolution});
          cylinder = cylinder.subtract(edgeRemoval);
      }
      if (roundRadiusTop > 0) {
        let edgeRemoval = CAG.rectangle({center: [0, 0], radius: [roundRadiusTop, roundRadiusTop]})
          .subtract(CAG.circle({center: [-roundRadiusTop, -roundRadiusTop], radius: roundRadiusTop, resolution: roundResolution}))
          .translate([cylParams.radiusEnd, cylParams.end[2]])
          .rotateExtrude({resolution: cylParams.resolution});
          cylinder = cylinder.subtract(edgeRemoval);
      }
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
    inItemCount: 1,
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
          {title: 'top', value: 3},
          {title: 'center', value: 2},
          {title: 'bottom', value: 1}
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
        ],
        emptyParamSource: {x1: 'x0'}
        },
      y1: {
        type: 'select',
        defaultValue: 0,
        options: [
          {title: '0', value: 0},
          {title: 'front', value: 1},
          {title: 'center', value: 2},
          {title: 'back', value: 3}
        ],
        emptyParamSource: {y1: 'y0'}
        },
      z1: {
        type: 'select',
        defaultValue: 0,
        options: [
          {title: '0', value: 0},
          {title: 'top', value: 3},
          {title: 'center', value: 2},
          {title: 'bottom', value: 1}
        ],
        emptyParamSource: {z1: 'z0'}
        }
    },
    execute(stack, params) {
      const bb0 = stack.item.getBounds()
      const bb1 = stack.prev.item ? stack.prev.item.getBounds() : [[0, 0, 0], [0, 0, 0]];

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
