import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

var mathFormulas = [];

function createMath(aScene, aTeX, aSize, aX, aY, aZ)
{
    var image = window.TeXZilla.toImage(aTeX, false, true);
    image.onload = function() {
        var texture = new THREE.Texture(image);
        texture.needsUpdate = true;
        var math =
            new THREE.Mesh(
                new THREE.PlaneGeometry(aSize, aSize * image.height / image.width),
                new THREE.MeshBasicMaterial({
                    transparent: true,
                    depthTest: false,
                    depthWrite: false,
                    map: texture
                })
            );
        math.position.x = aX;
        math.position.y = aY;
        math.position.z = aZ;
        mathFormulas.push(math);

        aScene.add(math);
    }
}

function updateMath(aCamera)
{
    for (var i in mathFormulas) {
        mathFormulas[i].rotation.x = aCamera.rotation.x;
        mathFormulas[i].rotation.y = aCamera.rotation.y;
        mathFormulas[i].rotation.z = aCamera.rotation.z;
    }
}

function init(aId, aWidth, aHeight)
{
    var scene = new THREE.Scene();

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(aWidth, aHeight);
    renderer.setClearColor(0xffffff, 1);
    var node = document.getElementById(aId);
    node.parentNode.replaceChild(renderer.domElement, node);

    var camera = new THREE.PerspectiveCamera(75,
                                             aWidth / aHeight, 0.1, 1000);
    camera.up.set(0, 0, 1);
    camera.position.x = 70;
    camera.position.y = 50;
    camera.position.z = 30;
    camera.lookAt(scene.position);
    new OrbitControls(camera, renderer.domElement);

    // Add the x-axis
    scene.add(
        new THREE.ArrowHelper(
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(0, 0, 0),
            50, 0x0000ff, 1, 1)
    );
    createMath(scene, "x", 3, 50, 0, 5);

    // Add the y-axis
    scene.add(
        new THREE.ArrowHelper(
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(0, 0, 0),
            50, 0x0000ff, 1, 1)
    );
    createMath(scene, "y", 3, 0, 50, 5);

    // Add the z-axis
    scene.add(
        new THREE.ArrowHelper(
            new THREE.Vector3(0, 0, 1),
            new THREE.Vector3(0, 0, 0),
            50, 0x0000ff, 1, 1)
    );
    createMath(scene, "z", 3, 0, -5, 50);

    // Add the circular loop
    scene.add(
        new THREE.Mesh(
            new THREE.TorusGeometry( 30, 1, 100, 100 ),
            new THREE.MeshBasicMaterial( { color: 0xffff00 } )
        )
    );
    createMath(scene, "R", 5, 15, 5, 0);

    // Add the steady current
    createMath(scene, "\\color{#ffaa00}{I}", 5, 22, 22, 0);
    var currentDirection = new THREE.Vector3(-20, 20, 0);
    scene.add(
        new THREE.ArrowHelper(
            currentDirection.clone().normalize(),
            (new THREE.Vector3(25, 25, 0)).sub(
                currentDirection.clone().divideScalar(2)),
            currentDirection.length(), 0xffaa00, 1, 1
        )
    );

    // Add the magnetic field
    scene.add(
        new THREE.ArrowHelper(
            new THREE.Vector3(0, 0, 1),
            new THREE.Vector3(0, 1, 15),
            30, 0xff0000, 1, 1
        )
    );
    createMath(scene, "\\color{#ff0000}{\\vec{B} = \\frac{\\mu_0 I R^2}{2\\left( R^2 + z^2 \\right)^{3/2}} \\mathbf{k}}", 80, 0, 30, 25);

    function render() {
        updateMath(camera);
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }

    render(renderer);
}

window.addEventListener("load", () => {
  init('webgl', 800, 600);
});
