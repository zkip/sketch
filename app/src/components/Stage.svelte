<script>
  import { onMount, onDestroy } from "svelte";
  import * as three from "three";
  import {
    PerspectiveCamera,
    Scene,
    BoxGeometry,
    MeshNormalMaterial,
    Mesh,
    MeshBasicMaterial,
    WebGLRenderer
  } from "three";

  let camera, scene, renderer;
  let geometry, material, mesh;
  let aspect = 1;
  let cvs = null;

  function onresize() {
    let width = cvs.parentNode.offsetWidth,
      height = cvs.parentNode.offsetHeight;
    renderer.setSize(width, height);
    aspect = width / height;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
  }

  function init() {
    camera = new PerspectiveCamera(70, innerWidth / innerHeight, 0.01, 10);
    camera.position.z = 1;

    scene = new Scene();

    geometry = new BoxGeometry(0.2, 0.2, 0.2);
    material = new three.LineDashedMaterial({
      dashSize: 3,
      gapSize: 7,
      linewidth: 20
    });
    // material.linewidth = 10;

    mesh = new three.Line(geometry, material);
    console.log(mesh, material);

    scene.add(mesh);

    renderer = new WebGLRenderer({ antialias: true, canvas: cvs });
    onresize();
    addEventListener("resize", onresize);
  }

  let t = 0;
  function update() {
    t++;
    requestAnimationFrame(update);

    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.02;
    mesh.material.linewidth = Math.abs(Math.sin(t / 100) * 10) + 1;
    renderer.render(scene, camera);
  }

  onMount(() => {
    init();
    update();
  });

  onDestroy(() => {
    removeEventListener("resize", onresize);
  });
</script>

<style>
  .Stage {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: absolute;
  }
  canvas[resize] {
    width: 100%;
    height: 100%;
  }
</style>

<div class="Stage">
  <canvas bind:this={cvs} resize />
</div>
