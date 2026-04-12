import React, { Component } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

class ThreeJSAnimation extends Component {
  componentDidMount() {
    const MODEL_PATH =
      "https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/stacy_lightweight.glb";
    const backgroundColor = 0x0a192f;

    let scene, renderer, camera, model, neck, waist, mixer;
    let clock = new THREE.Clock();
    let animationFrameId;

    // ── Scene ──────────────────────────────────────────────────────────────
    scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);

    // ── Renderer ───────────────────────────────────────────────────────────
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(
      Math.round(0.35 * window.innerWidth),
      Math.round(0.35 * window.innerHeight)
    );

    const container = document.getElementById("aakash-model");
    container.appendChild(renderer.domElement);

    // ── Camera ─────────────────────────────────────────────────────────────
    camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, -3, 30);

    // ── Material (no `skinning` — removed in r152) ─────────────────────────
    const stacy_mtl = new THREE.MeshPhongMaterial({ color: 0xccd6f6 });

    // ── Model ──────────────────────────────────────────────────────────────
    const loader = new GLTFLoader();
    loader.load(
      MODEL_PATH,
      (gltf) => {
        model = gltf.scene;
        const fileAnimations = gltf.animations;

        model.traverse((o) => {
          if (o.isMesh) {
            o.castShadow = true;
            o.receiveShadow = true;
            o.material = stacy_mtl;
          }
          if (o.isBone && o.name === "mixamorigNeck") neck = o;
          if (o.isBone && o.name === "mixamorigSpine") waist = o;
        });

        model.scale.set(15, 15, 15);
        model.position.y = -23;
        scene.add(model);

        mixer = new THREE.AnimationMixer(model);
        const idleAnim = THREE.AnimationClip.findByName(fileAnimations, "idle");
        // Remove root-motion tracks that conflict with our manual positioning
        idleAnim.tracks.splice(3, 3);
        idleAnim.tracks.splice(9, 3);
        mixer.clipAction(idleAnim).play();
      },
      undefined,
      (error) => console.error("GLTFLoader error:", error)
    );

    // ── Lights ─────────────────────────────────────────────────────────────
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const d = 8.25;
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
    dirLight.position.set(-8, 12, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 1500;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    scene.add(dirLight);

    // ── Floor ──────────────────────────────────────────────────────────────
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(5000, 5000, 1, 1),
      new THREE.MeshPhongMaterial({ color: 0x0a192f, shininess: 0 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    floor.position.y = -11;
    scene.add(floor);

    // ── Background sphere ──────────────────────────────────────────────────
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(16, 46, 46),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    sphere.position.set(-0.25, -2.5, -30);
    scene.add(sphere);

    // ── Render loop ────────────────────────────────────────────────────────
    function update() {
      animationFrameId = requestAnimationFrame(update);
      if (mixer) mixer.update(clock.getDelta());
      renderer.render(scene, camera);
    }
    update();

    // ── Resize handler ─────────────────────────────────────────────────────
    function onResize() {
      const w = Math.round(0.35 * window.innerWidth);
      const h = Math.round(0.35 * window.innerHeight);
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", onResize);

    // ── Mouse tracking ─────────────────────────────────────────────────────
    function moveJoint(mouse, joint, degreeLimit) {
      const degrees = getMouseDegrees(mouse.x, mouse.y, degreeLimit);
      // THREE.Math was deprecated — use THREE.MathUtils
      joint.rotation.y = THREE.MathUtils.degToRad(degrees.x);
      joint.rotation.x = THREE.MathUtils.degToRad(degrees.y);
    }

    function getMouseDegrees(x, y, degreeLimit) {
      const w = { x: window.innerWidth, y: window.innerHeight };
      let dx = 0, dy = 0;

      if (x <= w.x / 2) {
        dx = (((w.x / 2 - x) / (w.x / 2)) * degreeLimit) * -1;
      } else {
        dx = ((x - w.x / 2) / (w.x / 2)) * degreeLimit;
      }

      if (y <= w.y / 2) {
        dy = ((((w.y / 2 - y) / (w.y / 2)) * degreeLimit * 0.5)) * -1;
      } else {
        dy = ((y - w.y / 2) / (w.y / 2)) * degreeLimit;
      }

      return { x: dx, y: dy };
    }

    function onMouseMove(e) {
      if (neck && waist) {
        moveJoint({ x: e.clientX, y: e.clientY }, neck, 50);
        moveJoint({ x: e.clientX, y: e.clientY }, waist, 30);
      }
    }
    document.addEventListener("mousemove", onMouseMove);

    // ── Cleanup ────────────────────────────────────────────────────────────
    // Store cleanup refs on the instance so componentWillUnmount can use them
    this._cleanup = () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }

  componentWillUnmount() {
    if (this._cleanup) this._cleanup();
  }

  render() {
    return <div id="aakash-model" />;
  }
}

export default ThreeJSAnimation;