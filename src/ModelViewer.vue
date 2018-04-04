<template>
  <div ref="canvasContainer" class="canvas-container">
  </div>
</template>

<script>
  import THREE from 'three';
  const ThreeBSP = require('three-js-csg')(THREE);
  const OrbitControls = require('three-orbit-controls')(THREE);
  let setObject;

  export default {
    data() {
      return {
      };
    },
    mounted() {
      let canvasContainer = this.$refs.canvasContainer;
      const scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
      camera.position.x = 2;
      camera.position.y = 2;
      camera.position.z = -5;
      scene.rotateX(-Math.PI / 2);
      scene.rotateY(-Math.PI);
      scene.rotateX(-Math.PI);

      var renderer = new THREE.WebGLRenderer();
      renderer.setClearColor(0xdddddd);
      const controls = new OrbitControls(camera, canvasContainer);

      const light = new THREE.PointLight(0xffffff);
      light.position.set(30, -20, -10);
      scene.add(light);

      const material = new THREE.MeshPhongMaterial({ color: 0xdddddd, specular: 0x1a1a1a, shininess: 30, shading: THREE.FlatShading });

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
      setObject = function(obj) {
        if (prevObj) {
          scene.remove(prevObj);
        }
        if (obj) {
          const newMesh = obj.toMesh();
          newMesh.material = material;
          scene.add(newMesh);
          prevObj = newMesh;
          render();
        }
      }

      // render model initially and on camera movement
      function render() {
        renderer.render( scene, camera );
      }
      controls.addEventListener('change', render);
      render();
    },
    computed: {
      stackTop () {
        return this.$store.state.stack.item
      }
    },
    watch: {
      stackTop (newStackTop, oldStackTop) {
        setObject && setObject(newStackTop);
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
