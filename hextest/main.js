
var scene = new THREE.Scene();














	var grassMaterial = new THREE.MeshNormalMaterial({wireframe:false, color:0xffffff});

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
		 0,0,0,0,10,5,5,4,2,0,
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

		coord.z = heights[position] * 0.2;

		coord.x -= width/2;
		coord.y -= height/2;

		return new THREE.Vector3(coord.x, coord.y, coord.z);
	}


	var blenderStyleToRightHanded = new THREE.Matrix4().makeRotationX(Math.PI/2).multiply(new THREE.Matrix4().makeScale(1, 1, -1));



	function makeHexagon (position) {

		var centerCoord = indexToWorldCoordinate(position);

		for (var direction=0; direction<6; ++direction) {

			var centerCoord = indexToWorldCoordinate(position);

			var neighbour = movePosition(position, direction);
			var neighborCCW  = movePosition(position, offsetDirectionByRelativeDirection(direction, -1));
			var neighborCW   = movePosition(position, offsetDirectionByRelativeDirection(direction, +1));

			var neighborCoord = indexToWorldCoordinate(neighbour);
			var vertexIndexStart = terrain.vertices.length;
			var a, b;

			// Just connect to the neighbor with a smooth slope.
			a = new THREE.Vector3().add(centerCoord).add(neighborCoord).add(indexToWorldCoordinate(neighborCCW)).divideScalar(3);
			b = new THREE.Vector3().add(centerCoord).add(neighborCoord).add(indexToWorldCoordinate(neighborCW )).divideScalar(3);
		
			// // Make a sharp step where the slope is too steep.
			// var heightAboveNeighbor = heights[neighbour] - heights[position]
			// if (Math.abs(heightAboveNeighbor) > 1) {

			// 	a.setZ(centerCoord.z);
			// 	b.setZ(centerCoord.z);

			// 	if (heightAboveNeighbor < 0) {

			// 		// The higher side adds the vertical filler.
			// 	}
			// }

			terrain.vertices.push(centerCoord.clone().applyMatrix4(blenderStyleToRightHanded));
			terrain.vertices.push(                  b.applyMatrix4(blenderStyleToRightHanded));
			terrain.vertices.push(                  a.applyMatrix4(blenderStyleToRightHanded));

			terrain.faces.push(new THREE.Face3(
				vertexIndexStart + 0,
				vertexIndexStart + 1,
				vertexIndexStart + 2
			));
		}
	}

	var terrain = new THREE.Geometry();

	// For all map cells.
	for (var x = 1; x < width-1; x++) {
		for (var y = 1; y < height-1; y++) {

			makeHexagon(coordinateToIndex(x, y));
		}
	};



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
