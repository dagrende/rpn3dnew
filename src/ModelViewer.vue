<template>
  <canvas ref="canvas" @click=""></canvas>
</template>

<script>
  import THREE from 'three';
  const OrbitControls = require('./three-orbit-controls')(THREE);
  import { toCSG, fromCSG } from 'three-2-csg';
  import store from './store';

  export default {
    props: {
      stackIndex: String
    },
    data() {
      return {
        setObject: null
      };
    },
    mounted() {
      let canvas = this.$refs.canvas;
      let canvasContainer = canvas.parentNode;
      const scene = new THREE.Scene();
      scene.rotateX(-Math.PI / 2);
      scene.rotateY(-Math.PI);
      scene.rotateX(-Math.PI);

      var camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
      camera.position.set(2, 2, -5);

      var renderer = new THREE.WebGLRenderer({antialias: true, canvas: canvas});
      renderer.setClearColor(0xdddddd);
      const controls = new OrbitControls(camera, canvasContainer);
      controls.enablePan = false;

      const ambientLight = new THREE.AmbientLight( 0x555555 );
      scene.add( ambientLight );

      const light = new THREE.PointLight(0xffffff);
      light.position.set(0, -5, 0);
      scene.add(light);

      scene.add(new THREE.AxisHelper( 500 ));

      const material = new THREE.MeshPhongMaterial({ color: 0xdddddd, specular: 0x080808, shininess: 60, shading: THREE.FlatShading });

      // see https://stackoverflow.com/questions/30229536/how-to-make-a-html5-canvas-fit-dynamic-parent-flex-box-container
      function adjustForCanvasContainerSize(){
        renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
        camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
        camera.updateProjectionMatrix();
        render();
      }
      adjustForCanvasContainerSize();
      window.onresize = adjustForCanvasContainerSize;

      let prevObj = null;
      let stackIndex = this.stackIndex;

      canvasContainer.addEventListener( 'dblclick', onMouseDown, false );

      function onMouseDown(e) {
        if (prevObj) {
          ScaleIntoView(prevObj.geometry)
          render();
        }
      }

      function ScaleIntoView(geom) {
        geom.computeBoundingSphere();
        let bs = geom.boundingSphere;
        let pos = camera.position;
        let dist = pos.distanceTo(bs.center);
        let d = dist * Math.sin(50/2 / 180 * Math.PI);
        let factor = bs.radius * 3 + bs.center.length();
        let cp = camera.position;
        let cplen = cp.length();
        cp.set(factor * cp.x / cplen, factor * cp.y / cplen, factor * cp.z / cplen);
        camera.updateProjectionMatrix();
      }


      this.setObject = function(obj) {
        if (prevObj) {
          scene.remove(prevObj);
        }
        if (obj) {
          const newMesh = new THREE.Mesh(fromCSG(obj), material);
          newMesh.geometry.computeVertexNormals();
          scene.add(newMesh);
          prevObj = newMesh;

          // ScaleIntoView(newMesh.geometry);
        }
        render();
      }

      // render model initially and on camera movement
      function render() {
        light.position.set(-camera.position.x, camera.position.z, camera.position.y + 1);
        renderer.render( scene, camera );
      }
      controls.addEventListener('change', render);
      render();

      // store.commit('buttonCommand', 'addCube')
    },
    computed: {
      currentLogItem () {
        return this.$store.state.commandLog.current()
      }
    },
    watch: {
      currentLogItem (newLogItem, oldLogItem) {
        if (newLogItem && newLogItem.stack) {
          let i = +this.stackIndex;
          let stack = newLogItem.stack;
          while (stack.item && i-- > 0) {
            stack = stack.prev;
          }
          this.setObject && this.setObject(stack.item);
        } else {
          this.setObject(null);
        }
      }
    }
  };
</script>

<style>
canvas {
  position: absolute;
  z-index: -100;
}

</style>
