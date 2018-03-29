<template>
  <div id="app">
    <div id="main_model">
    </div>
    <div id="commands">
      <div v-for="command in commands">{{command}}</div>
    </div>
  </div>
</template>

<script>
import THREE from 'three';
// import ThreeBSPMaker from "three-js-csg";
// let ThreeBSP = ThreeBSPMaker(THREE);

console.log('THREE', THREE);
const OrbitControls = require('three-orbit-controls')(THREE);
// import THREE from 'three';

export default {
  name: "app",
  data() {
    return {
      commands: ["cube", "cylinder", "union"],
      modelStack: []
    };
  },
  mounted() {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, 500.0 / 200, 0.1, 1000);
    camera.position.x = 5;
    camera.position.y = 5;
    camera.position.z = 5;
    const controls = new OrbitControls(camera);

    var renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xdddddd);
    renderer.setSize(500, 200);

    const light = new THREE.PointLight(0xffffff);
    light.position.set(-40, 50, 90);
    scene.add(light);

    document.getElementById("main_model").appendChild(renderer.domElement);

    var box = new THREE.BoxGeometry(3, 3, 3);
    var material = new THREE.MeshPhongMaterial({ color: 0xdddddd, specular: 0x1a1a1a, shininess: 30, shading: THREE.FlatShading });
    var boxMesh = new THREE.Mesh(box, material);

    scene.add(boxMesh);


    render();
    controls.addEventListener( 'change', render );
    function render() {
        renderer.render( scene, camera );
    }
}
};
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
}
#app {
  /* position: relative; */
  display: flex;
  flex-direction: column;
  height: calc(100vh - 4px);
  background-color: #eee;
}

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: flex;
  flex-direction: column;
}

#main_model,
#commands {
  flex: 1;
}
</style>
