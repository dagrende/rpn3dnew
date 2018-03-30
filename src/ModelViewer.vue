<template>
  <div id="main_model">
  </div>
</template>

<script>
  import THREE from 'three';
  import ThreeBSPMaker from 'three-js-csg';
  let ThreeBSP = ThreeBSPMaker(THREE);
  const OrbitControls = require('three-orbit-controls')(THREE);

  export default {
    data() {
      return {
      };
    },
    mounted() {
      let canvasContainer = document.getElementById("main_model");
      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
      camera.position.x = 5;
      camera.position.y = 5;
      camera.position.z = 5;
      const controls = new OrbitControls(camera);

      var renderer = new THREE.WebGLRenderer();
      renderer.setClearColor(0xdddddd);

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

      canvasContainer.appendChild(renderer.domElement);

      const box = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 3));
      const sphere = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 5, 32));

      const sBSP = new ThreeBSP(sphere);
      const bBSP = new ThreeBSP(box);

      const sub = bBSP.subtract(sBSP);
      const newMesh = sub.toMesh();
      newMesh.material = new THREE.MeshPhongMaterial({ color: 0xdddddd, specular: 0x1a1a1a, shininess: 30, shading: THREE.FlatShading });

      scene.add(newMesh);
      console.log('hello!');

      // render model initially and on camera movement
      render();
      controls.addEventListener('change', render);
      function render() {
          renderer.render( scene, camera );
      }
    }
  };
</script>

<style>
</style>
