import THREE from 'three';
import {CSG, CAG} from '@jscad/csg';
import stlDeSerializer from '@jscad/stl-deserializer';

let constants = {};

export default {
  constants,
  const: {
    title: 'const',
    inItemCount: 0,
    params: {
      name: {type: 'text', defaultValue: ''},
      value: {type: 'number', defaultValue: ''},
    },
    execute(stack, params) {
      if (params.name !== '' && params.value !== undefined) {
        constants[params.name] = params.value;
      }
      return stack;
    }
  },
  // duplicate top ov stack n times along a circle or line
  repeat: {
    title: 'repeat',
    inItemCount: 1,
    params: {
      n: {type: 'number', defaultValue: 5},
      path: {
        type: 'select',
        defaultValue: 0,
        options: [
          {title: 'circle', value: 0},
          {title: 'line', value: 1}
        ]
      },
      plane: {
        type: 'select',
        defaultValue: 2,
        options: [
          {title: 'x', value: 0},
          {title: 'y', value: 1},
          {title: 'z', value: 2}
        ]
      },
      length: {type: 'number', defaultValue: 360}
    },
    execute(stack, params) {
      let n = +params.n;
      let length = +params.length;
      if (n > 0 && length > 0) {
        console.log('n',n,'length',length);
        let result = stack.item;
        for (let i = 1; i < n; i++) {
          let d = i * length / n;
          if (params.path === 0) {
            result = result.union(stack.item['rotate' + ['X', 'Y', 'Z'][+params.plane]](d))
          } else {
            let movement = [0, 0, 0];
            movement[params.plane] = d;
            result = result.union(stack.item.translate(movement))
          }
        }
      //   return stack.add(stack.item.union(dups[0]));
        return stack.prev.add(result);
      } else {
        return stack;
      }
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
    title: 'named',
    inItemCount: 0,
    params: {name: {type: 'text', defaultValue: ''}},
    execute(stack, params, commandList) {
      let command = commandList.find(command => command.id === 'nameTop' && params.name === command.params.name);
      if (command) {
        return stack.add(command.stack.item);
      }
      return stack;
    }
  },
  comment: {
    title: '#',
    inItemCount: 0,
    params: {
      text: {type: 'text', defaultValue: ''}
    },
    execute(stack, params) {
      return stack;
    }
  },
  mirror: {
    title: 'mirror',
    inItemCount: 1,
    params: {
      x: {
        type: 'select',
        defaultValue: 0,
        options: [
          {title: 'none', value: 0},
          {title: '0', value: 1},
          {title: 'left', value: 2},
          {title: 'center', value: 3},
          {title: 'right', value: 4},
        ],
      },
      y: {
        type: 'select',
        defaultValue: 0,
        options: [
          {title: 'none', value: 0},
          {title: '0', value: 1},
          {title: 'front', value: 2},
          {title: 'center', value: 3},
          {title: 'back', value: 4},
        ],
      },
      z: {
        type: 'select',
        defaultValue: 0,
        options: [
          {title: 'none', value: 0},
          {title: '0', value: 1},
          {title: 'top', value: 4},
          {title: 'center', value: 3},
          {title: 'bottom', value: 2},
        ],
      }
    },
    execute(stack, params) {
      const bb = stack.item.getBounds()
      let mirroredItem = stack.item;
      let d = {x: 0, y: 0, z: 0};
      for (let key in d) {  // for each axis
        let aligmentType = params[key];
        if (aligmentType == 1) { // start
          d[key] = 0;
        } else if (aligmentType == 2) { // end
          d[key] = bb[0][key];
        } else if (aligmentType == 3) { // center
          d[key] = (bb[0][key] + bb[1][key]) / 2;
        } else if (aligmentType == 4) { // end
          d[key] = bb[1][key];
        }
        if (aligmentType > 0) {
          mirroredItem = mirroredItem.translate([-d.x, -d.y, -d.z])['mirrored' + key.toUpperCase()]().translate([d.x, d.y, d.z])
        }
      }
      return stack.prev.add(mirroredItem)
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
      width: {type: 'number', defaultValue: 2, label: 'w'},
      depth: {type: 'number', defaultValue: '', label: 'd'},
      height: {type: 'number', defaultValue: '', label: 'h'},
      rx: {type: 'number', defaultValue: '0'},
      ry: {type: 'number', defaultValue: ''},
      rz: {type: 'number', defaultValue: ''},
      resolution: {type: 'number', defaultValue: '16', label: 'rres'}
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
      left: {type: 'number', defaultValue: 0}, right: {type: 'number', defaultValue: '0'},
      front: {type: 'number', defaultValue: '0'}, back: {type: 'number', defaultValue: '0'},
      down: {type: 'number', defaultValue: '0', label: 'bottom'}, up: {type: 'number', defaultValue: '0', label: 'top'}},
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
      rtop: {type: 'number', defaultValue: '1'},
      rbottom: {type: 'number', defaultValue: '', label: 'rbot'},
      height: {type: 'number', defaultValue: 2, label: 'h'},
      sides: {type: 'number', defaultValue: 32, label: 'res'},
      angle: {type: 'number', defaultValue: 360, label: 'v'},
      roundRadiusTop: {type: 'number', defaultValue: '0', label: 'rrtop'},
      roundRadiusBottom: {type: 'number', defaultValue: '0', label: 'rrbot'},
      roundResolution: {type: 'number', defaultValue: '32', label: 'rres'}},
    emptyParamSource: {rbottom: 'rtop'},
    inItemCount: 0,
    execute(stack, params) {
      // http://www.rasmus.is/uk/t/F/Su55k02.htm
      let rbot = +params.rbottom,
        rtop = +params.rtop,
        height = +params.height,
        resolution = +params.sides,
        sectorAngle = +params.angle,
        roundRadiusBottom = +params.roundRadiusBottom,
        roundRadiusTop = +params.roundRadiusTop,
        roundResolution = +params.roundResolution;

      let v = Math.atan2(height, rtop - rbot);

      let path = new CSG.Path2D();
      if (rbot + roundRadiusBottom) {
        path = path.appendPoint([0, -height / 2])
      }
      if (roundRadiusBottom > 0) {
        // add circle segment for bottom rounding
        let vh = (Math.PI - v) / 2;
        let arc = CSG.Path2D.arc({
          center: [rbot - roundRadiusBottom / Math.tan(vh), -height / 2 + roundRadiusBottom, 0],
          radius: roundRadiusBottom,
          startangle: -90,
          endangle: v / Math.PI * 180 - 90,
          resolution: roundResolution,
        });
        path = path.concat(arc);
      } else {
        path = path.appendPoint([rbot, -height / 2]);
      }
      if (roundRadiusTop > 0) {
        // add circle segment for the top rounding
        let vh = v / 2;
        let arc = CSG.Path2D.arc({
          center: [rtop - roundRadiusTop / Math.tan(vh), height / 2 - roundRadiusTop, 0],
          radius: roundRadiusTop,
          startangle: v / Math.PI * 180 - 90,
          endangle: 90,
          resolution: roundResolution,
        });
        path = path.concat(arc);
      } else {
        path = path.appendPoint([rtop, height / 2]);
      }
      if (rtop + roundRadiusTop) {
        path = path.appendPoint([0, height / 2])
      }
      path = path.appendPoint([0, height / 2]);

      let polygons = [];
      function pushTriangle(p1, p2, p3) {
        polygons.push(new CSG.Polygon([
          new CSG.Vertex(new CSG.Vector3D(p1[0], p1[1], p1[2])),
          new CSG.Vertex(new CSG.Vector3D(p2[0], p2[1], p2[2])),
          new CSG.Vertex(new CSG.Vector3D(p3[0], p3[1], p3[2]))
        ]));
      }

      let prevPoints = path.points.map(p => [p.x, 0, p.y]);
      let angleStep = 2 * Math.PI / resolution;
      if (sectorAngle != 360) {
        angleStep = sectorAngle * Math.PI / 180 / resolution;

        // add sector sides
        let origin = [0, 0, 0]
        let axisV = CSG.Vector3D.Create(0, 1, 0)
        let normalV = [0, 0, 1]
        let connS = new CSG.Connector(origin, axisV.rotateZ(180), normalV)
        polygons = polygons.concat(
                  path.close().innerToCAG()._toPlanePolygons({toConnector: connS, flipped: true}))
        let connE = new CSG.Connector(origin, axisV.rotateZ(180 - sectorAngle), normalV)
        polygons = polygons.concat(
                  path.close().innerToCAG()._toPlanePolygons({toConnector: connE, flipped: false}))
      }
      for (let i = 1; i <= resolution; i++) {
        let v = -i * angleStep;
        let cosv = Math.cos(v);
        let sinv = Math.sin(v);
        let points = path.points.map(p => [p.x * cosv, p.x * sinv, p.y]);

        pushTriangle(prevPoints[0], prevPoints[1], points[1]);
        for (let j = 1; j < points.length - 2; j++) {
          pushTriangle(prevPoints[j], prevPoints[j + 1], points[j + 1]);
          pushTriangle(prevPoints[j], points[j + 1], points[j]);
        }
        pushTriangle(prevPoints[points.length - 2], points[points.length - 1], points[points.length - 2]);

        prevPoints = points;
      }

      return stack.add(CSG.fromPolygons(polygons));
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
    params: {r: {type: 'number', defaultValue: 1}, n: {type: 'number', defaultValue: 32, label: 'res'}},
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
    params: {x: {type: 'number', defaultValue: 1},
      y: {type: 'number', defaultValue: ''},
      z: {type: 'number', defaultValue: ''}},
    emptyParamSource: {y: 'x', z: 'x'},
    inItemCount: 1,
    execute(stack, params) {
      return stack.prev.add(stack.item.scale([+params.x, +params.y, +params.z]))
    }
  },
  rotate: {
    title: 'rotate',
    inItemCount: 1,
    params: {x: {type: 'number', defaultValue: 0},
      y: {type: 'number', defaultValue: 0},
      z: {type: 'number', defaultValue: 0}},
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
  },
  noop: {
    title: 'noop',
    params: {},
    execute(stack, params) {
      return stack
    }
  }
}
