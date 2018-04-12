<template>
  <div ref="canvasContainer" class="canvas-container">
  </div>
</template>

<script>
  import THREE from 'three';
  const OrbitControls = require('three-orbit-controls')(THREE);
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

      let canvasContainer = this.$refs.canvasContainer;
      const scene = new THREE.Scene();
      scene.rotateX(-Math.PI / 2);
      scene.rotateY(-Math.PI);
      scene.rotateX(-Math.PI);

      var camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
      camera.position.set(2, 2, -5);

      var renderer = new THREE.WebGLRenderer({antialias: true});
      renderer.setClearColor(0xdddddd);
      const controls = new OrbitControls(camera, canvasContainer);

      const ambientLight = new THREE.AmbientLight( 0x555555 );
      scene.add( ambientLight );

      const light = new THREE.PointLight(0xffffff);
      light.position.set(0, -5, 0);
      scene.add(light);

      const material = new THREE.MeshPhongMaterial({ color: 0xdddddd, specular: 0x080808, shininess: 60, shading: THREE.FlatShading });

      function adjustForCanvasContainerSize(){
        renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
        camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
        camera.updateProjectionMatrix();
        render();
      }
      adjustForCanvasContainerSize();
      window.onresize = adjustForCanvasContainerSize;

      canvasContainer.appendChild(renderer.domElement);

      let prevObj = null;
      let stackIndex = this.stackIndex;
      this.setObject = function(obj) {
        if (prevObj) {
          scene.remove(prevObj);
        }
        if (obj) {
          const newMesh = new THREE.Mesh(fromCSG(obj), material);
          newMesh.geometry.computeVertexNormals();
          scene.add(newMesh);
          prevObj = newMesh;
        }
        render();

      }

      const cameraLightOffset = new THREE.Vector3(0, 0, 0);
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
      stackTop () {
        return this.$store.state.stack
      }
    },
    watch: {
      stackTop (newStackTop, oldStackTop) {
        let i = +this.stackIndex;
        let stack = newStackTop;
        while (stack.item && i-- > 0) {
          stack = stack.prev;
        }
        this.setObject && this.setObject(stack.item);
      }
    }
  };
</script>

<style>
.canvas-container {
  overflow: hidden;
}
.canvas-container canvas {
  width: 100%;
}

</style>
