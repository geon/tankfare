
var scene = new THREE.Scene();














	var grassMaterial = new THREE.MeshNormalMaterial({wireframe:true, color:0xffffff});

	var width = 10;
	var height = 12;

	var heights = [
		0,0,0,0,0,0,0,0,0,0,
		 0,0,0,0,0,0,0,0,0,0,
		0,0,0,0,0,0,0,0,0,0,
		 0,0,0,0,0,0,0,0,0,0,
		0,0,0,0,2,2,0,0,0,0,
		 0,0,0,1,2,2,0,0,0,0,
		0,0,0,2,5,4,2,0,0,0,
		 0,0,0,3,3,3,0,0,0,0,
		0,0,0,0,0,0,0,5,4,0,
		 0,0,0,0,0,5,5,4,2,0,
		0,0,0,0,0,1,2,3,3,0,
		 0,0,0,0,0,0,0,0,0,0
	];

	function coordinateToIndex(x, y) {
		return y*width + x;
	}


	function indexToCoordinate(position) {
		
		return {
			x: position % width,
			y: Math.floor(position / width)
		};
	}

	Directions = [
		"left",
		"upLeft",
		"upRight",
		"right",
		"downRight",
		"downLeft"
	]

	function movePosition(position, direction) {
		
		var coord = indexToCoordinate(position, x, y);
		var x = coord.x;
		var y = coord.y;
		
		// Odd rows are indented half a hexagon.
		switch (Directions[direction]) {
				
			case "left":
				--x;
				break;
			case "downLeft":
				if (! (y % 2))
					--x;
				++y;
				break;
			case "upLeft":
				if (! (y % 2))
					--x;
				--y;
				break;
			case "right":
				++x;
				break;
			case "upRight":
				if (y % 2)
					++x;
				--y;
				break;
			case "downRight":
				if (y % 2)
					++x;
				++y;
				break;
				
			default:
				console.log("invalid direction");
				break;
		}
		
		// Make the wold tiling.
		x = (x + width) % width;
		y = (y + height) % height;
		
		return coordinateToIndex(x, y);
	}

	function offsetDirectionByRelativeDirection(direction, relativeDirection) {
		
		return (direction + relativeDirection + Directions.length) % Directions.length;
	}


	function relativeDirectionBetweenDirections(direction, comparedToDirection) {
		
		return (direction - comparedToDirection + Directions.length) % Directions.length;
	}


	var triangleHalfWidth = Math.tan(30/360*2*Math.PI);

	function indexToWorldCoordinate (position) {
		var coord = indexToCoordinate(position);

		// Offset odd rows.
		if (coord.y % 2) {
			coord.x += 0.5;
		};

		coord.x *= 2*triangleHalfWidth;

		coord.x -= width/2;
		coord.y -= height/2;

		return coord;
	}


	var blenderStyleToRightHanded = new THREE.Matrix4().makeRotationX(Math.PI/2).multiply(new THREE.Matrix4().makeScale(1, 1, -1));

	function makeWingedEdge (position, direction) {

		var forward       = movePosition(position, direction);
		var neighborLeft  = movePosition(position, offsetDirectionByRelativeDirection(direction, -1));
		var neighborRight = movePosition(position, offsetDirectionByRelativeDirection(direction, +1));

		var positionCoord      = new THREE.Vector3().copy(indexToWorldCoordinate(position     )).setZ(heights[position     ] *.2);
		var forwardCoord       = new THREE.Vector3().copy(indexToWorldCoordinate(forward      )).setZ(heights[forward      ] *.2);
		var neighborLeftCoord  = new THREE.Vector3().copy(indexToWorldCoordinate(neighborLeft )).setZ(heights[neighborLeft ] *.2);
		var neighborRightCoord = new THREE.Vector3().copy(indexToWorldCoordinate(neighborRight)).setZ(heights[neighborRight] *.2);

		var a = new THREE.Vector3().add(positionCoord).add(forwardCoord).add(neighborLeftCoord ).divideScalar(3);
		var b = new THREE.Vector3().add(positionCoord).add(forwardCoord).add(neighborRightCoord).divideScalar(3);

		positionCoord.applyMatrix4(blenderStyleToRightHanded);
		 forwardCoord.applyMatrix4(blenderStyleToRightHanded);
		            a.applyMatrix4(blenderStyleToRightHanded);
		            b.applyMatrix4(blenderStyleToRightHanded);

		var vertexIndexStart;

		vertexIndexStart = terrain.vertices.length;

		terrain.vertices.push(positionCoord);
		terrain.vertices.push(            b);
		terrain.vertices.push(            a);

		terrain.faces.push(new THREE.Face3(
			vertexIndexStart + 0,
			vertexIndexStart + 1,
			vertexIndexStart + 2
		));


//		vertexIndexStart = terrain.vertices.length;

		// terrain.vertices.push(            a);
		// terrain.vertices.push(            b);
		terrain.vertices.push( forwardCoord);

		terrain.faces.push(new THREE.Face3(
			vertexIndexStart + 2,
			vertexIndexStart + 1,
			vertexIndexStart + 3
			// vertexIndexStart + 0,
			// vertexIndexStart + 1,
			// vertexIndexStart + 2
		));
	}


	var terrain = new THREE.Geometry();

	// for (var i = 0; i < heights.length; i++) {
	// for (var i = 0; i < 1; i++) {

	for (var x = 1; x < width-1; x++) {
		// for (var y = 1; y < 2; y++) {
		for (var y = 1; y < height-1; y++) {

			var i = coordinateToIndex(x, y);

			makeWingedEdge(i, Directions.indexOf("right"));
			makeWingedEdge(i, Directions.indexOf("downRight"));
			makeWingedEdge(i, Directions.indexOf("downLeft"));

			// if (coord.x == 0) {
			// 	makeWingedEdge(i, "left");
			// };
			// if (coord.y == 0) {
			// 	makeWingedEdge(i, "upLeft");
			// 	makeWingedEdge(i, "up");
			// };
		}
	};



	// terrain.vertices = [
	// 	new THREE.Vector3(-triangleHalfWidth, 0, -1),
	// 	new THREE.Vector3(0, 0, 0),
	// 	new THREE.Vector3(triangleHalfWidth, 0, -1)
	// ];
	// terrain.normals = [
	// 	new THREE.Vector3(0, 1, 0),
	// 	new THREE.Vector3(0, 1, 0),
	// 	new THREE.Vector3(0, 1, 0)
	// ];
	// terrain.faces = [
	// 	new THREE.Face3(0, 1, 2)
	// ];
	terrain.computeBoundingSphere();
	terrain.computeFaceNormals();







	scene.add(new THREE.Mesh(
	   terrain,
	   grassMaterial
	));








 // Add a light source.
var pointLight = new THREE.PointLight(0xFFFFFF);
pointLight.position.set(10, 50, 130);
scene.add(pointLight);



var sceneViews = [];
var containers = $('.scene-view');
for (var i = 0; i < 2; ++i){//containers.length; i++) {

	var renderer = new THREE.WebGLRenderer();
	renderer.setClearColorHex(0x000000, 1);

	containers.eq(i).append(renderer.domElement);

	var sceneView = new SceneView({
		renderer: renderer,
		scene: scene
	});

	sceneViews.push(sceneView);
};





$(window).bind("contextmenu", function(event) {
    event.preventDefault();
});
