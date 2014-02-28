function Map () {


	this.width = 10;
	this.height = 12;

	this.heights = [
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


};


Map.blenderStyleToRightHanded = new THREE.Matrix4().makeRotationX(Math.PI/2).multiply(new THREE.Matrix4().makeScale(1, 1, -1));
Map.triangleHalfWidth = Math.tan(30/360*2*Math.PI);
Map.Directions = [
	"left",
	"upLeft",
	"upRight",
	"right",
	"downRight",
	"downLeft"
];


Map.prototype.makeGeometry = function () {

	var terrain = new THREE.Geometry();

	// For all map cells.
	for (var x = 1; x < this.width-1; x++) {
		for (var y = 1; y < this.height-1; y++) {

			this.makeHexagon(this.coordinateToIndex(x, y), terrain);
		}
	};

	return terrain;
};


Map.prototype.makeHexagon = function (position, terrain) {

	var centerCoord = this.indexToWorldCoordinate(position);

	for (var direction=0; direction<6; ++direction) {

		var centerCoord = this.indexToWorldCoordinate(position);

		var neighbour = this.movePosition(position, direction);
		var neighborCCW  = this.movePosition(position, Map.offsetDirectionByRelativeDirection(direction, -1));
		var neighborCW   = this.movePosition(position, Map.offsetDirectionByRelativeDirection(direction, +1));

		var neighborCoord = this.indexToWorldCoordinate(neighbour);
		var vertexIndexStart = terrain.vertices.length;
		var a, b;

		// Just connect to the neighbor with a smooth slope.
		a = new THREE.Vector3().add(centerCoord).add(neighborCoord).add(this.indexToWorldCoordinate(neighborCCW)).divideScalar(3);
		b = new THREE.Vector3().add(centerCoord).add(neighborCoord).add(this.indexToWorldCoordinate(neighborCW )).divideScalar(3);
	
		// // Make a sharp step where the slope is too steep.
		// var heightAboveNeighbor = heights[neighbour] - heights[position]
		// if (Math.abs(heightAboveNeighbor) > 1) {

		// 	a.setZ(centerCoord.z);
		// 	b.setZ(centerCoord.z);

		// 	if (heightAboveNeighbor < 0) {

		// 		// The higher side adds the vertical filler.
		// 	}
		// }

		terrain.vertices.push(centerCoord.clone().applyMatrix4(Map.blenderStyleToRightHanded));
		terrain.vertices.push(                  b.applyMatrix4(Map.blenderStyleToRightHanded));
		terrain.vertices.push(                  a.applyMatrix4(Map.blenderStyleToRightHanded));

		terrain.faces.push(new THREE.Face3(
			vertexIndexStart + 0,
			vertexIndexStart + 1,
			vertexIndexStart + 2
		));
	}
}


Map.prototype.coordinateToIndex = function (x, y) {

	return y*this.width + x;
}


Map.prototype.indexToCoordinate = function (position) {
	
	return {
		x: position % this.width,
		y: Math.floor(position / this.width)
	};
}


Map.prototype.movePosition = function (position, direction) {
	
	var coord = this.indexToCoordinate(position);
	var x = coord.x;
	var y = coord.y;
	
	// Odd rows are indented half a hexagon.
	switch (Map.Directions[direction]) {
			
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
	x = (x + this.width) % this.width;
	y = (y + this.height) % this.height;
	
	return this.coordinateToIndex(x, y);
}


Map.offsetDirectionByRelativeDirection = function (direction, relativeDirection) {
	
	return (direction + relativeDirection + Map.Directions.length) % Map.Directions.length;
}


Map.relativeDirectionBetweenDirections = function (direction, comparedToDirection) {
	
	return (direction - comparedToDirection + Map.Directions.length) % Map.Directions.length;
}


Map.prototype.indexToWorldCoordinate = function  (position) {

	var coord = this.indexToCoordinate(position);

	// Offset odd rows.
	if (coord.y % 2) {
		coord.x += 0.5;
	};

	coord.x *= 2*Map.triangleHalfWidth;

	coord.z = this.heights[position] * 0.2;

	coord.x -= this.width/2;
	coord.y -= this.height/2;

	return new THREE.Vector3(coord.x, coord.y, coord.z);
}


