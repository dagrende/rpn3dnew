<template>
  <div id="main_model">
  </div>
</template>

<script>
  import THREE from 'three';
  import ThreeBSPMaker from 'three-js-csg';
  let ThreeBSP = ThreeBSPMaker(THREE);
  const OrbitControls = require('three-orbit-controls')(THREE);
  let setObject;

  export default {
    data() {
      return {
      };
    },
    mounted() {
      let canvasContainer = document.getElementById("main_model");
      const scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
      camera.position.x = 5;
      camera.position.y = 5;
      camera.position.z = 5;

      var renderer = new THREE.WebGLRenderer();
      renderer.setClearColor(0xdddddd);
      const controls = new OrbitControls(camera, canvasContainer);

      function adjustForCanvasContainerSize(){
        let ccBounds = canvasContainer.getBoundingClientRect();
        console.log('ccBounds', ccBounds);
        renderer.setSize(ccBounds.width, ccBounds.height);
        camera.aspect = ccBounds.width / ccBounds.height;
        camera.updateProjectionMatrix();
      }
      adjustForCanvasContainerSize();

      const light = new THREE.PointLight(0xffffff);
      light.position.set(-40, 50, 90);
      scene.add(light);

      const material = new THREE.MeshPhongMaterial({ color: 0xdddddd, specular: 0x1a1a1a, shininess: 30, shading: THREE.FlatShading });

      canvasContainer.appendChild(renderer.domElement);

      let prevObj = null;
      setObject = function(obj) {
        // Our fancy notification (2).
        console.log('stackTop change!', scene.children.length)
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
        return this.$store.state.stack[0]
      }
    },
    watch: {
      stackTop (newStackTop, oldStackTop) {
        setObject(newStackTop);
      }
    }
  };
</script>

<style>
</style>
