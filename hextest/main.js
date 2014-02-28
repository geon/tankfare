

var map = new Map();

var terrain = map.makeGeometry();
terrain.computeBoundingSphere();
terrain.computeFaceNormals();

var grassMaterial = new THREE.MeshNormalMaterial({wireframe:false, color:0xffffff});

var scene = new THREE.Scene();
scene.add(new THREE.Mesh(
   terrain,
   grassMaterial
));

// Add a light source.
var pointLight = new THREE.PointLight(0xFFFFFF);
pointLight.position.set(10, 50, 130);
scene.add(pointLight);

var renderer = new THREE.WebGLRenderer();
renderer.setClearColorHex(0x000000, 1);

$('.scene-view').append(renderer.domElement);

var sceneView = new SceneView({
	renderer: renderer,
	scene: scene
});

$(window).bind("contextmenu", function(event) {
    event.preventDefault();
});
