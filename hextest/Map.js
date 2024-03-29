
var Map;

Map = function () {

	this.cells = [];

	this.generateMap();
	// this.loadTestLevel();
};


Map.prototype.generateMap = function () {

	this.width = 20;
	this.height = 20;



	for (var i = 0; i < this.width*this.width; ++i) {

		var coord = this.indexToCoordinate(i);
		coord = new THREE.Vector2(coord.x, coord.y);

		var centrish = 1 - Math.min(1, coord.distanceTo(new THREE.Vector2(this.width/2, this.height/2)) / Math.min(this.width/2, this.height/2));

		var baseHeight = 15 * Math.pow(centrish, 2);


		this.cells[i] = {
			height: baseHeight + Math.random() * 8 * Math.pow(centrish, 1/1.8)
		};
	}


	// Blur
	for (var i = 0; i < this.cells.length; ++i) {
		for (var direction=0; direction<6; ++direction) {

			this.cells[i].height += this.cells[this.movePosition(i, direction)].height/6;
		}

		this.cells[i].height /= 2;
	}


	for (var i = 0; i < this.cells.length; ++i) {
		this.cells[i].height = Math.round(this.cells[i].height);
	}
};

Map.prototype.loadTestLevel = function () {

	this.width = 10;
	this.height = 10;

	var self = this;

	$.each([
		0,0,0,0,0,0,0,0,0,0,
		 0,0,0,0,0,0,0,0,0,0,
		0,0,1,2,0,0,0,0,0,0,
		 0,0,0,0,0,0,1,2,0,0,
		0,0,0,0,0,0,2,0,1,0,
		 0,0,0,0,0,0,0,0,0,0,
		0,0,0,1,2,3,0,0,2,0,
		 0,0,1,2,3,0,0,3,0,0,
		0,0,0,0,0,0,1,0,2,0,
		 0,0,0,1,0,0,0,0,0,0
	], function(i){

		self.cells[i] = {height: this};
	})
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

	for (var i = 0; i < this.cells.length; ++i) {

		this.cells[i].corners = [];
		this.cells[i].centerCoord = this.indexToWorldCoordinate(i);
	}

	for (var i = 0; i < this.cells.length; ++i) {

		var currentCell = this.cells[i];

		for (var direction=0; direction<6; ++direction) {

			var currentCorner = currentCell.corners[direction];

			var surroundingCells = [
				currentCell,
				this.cells[this.movePosition(i, direction)],
				this.cells[this.movePosition(i, Map.offsetDirectionByRelativeDirection(direction, 1))],
			];

			surroundingCells[0].activeCornerIndex = direction;
			surroundingCells[1].activeCornerIndex = Map.offsetDirectionByRelativeDirection(direction, 2);
			surroundingCells[2].activeCornerIndex = Map.offsetDirectionByRelativeDirection(direction, 4);


			// Sort by height.
			surroundingCells.sort(function(a, b){return a.height - b.height;});


			var vertex = new THREE.Vector3()
				.add(surroundingCells[0].centerCoord)
				.add(surroundingCells[1].centerCoord)
				.add(surroundingCells[2].centerCoord)
				.divideScalar(3)
			;

			// Check for cells sharing a vertex.
			if ((Math.abs(surroundingCells[0].height - surroundingCells[1].height) <= 1) && (Math.abs(surroundingCells[1].height - surroundingCells[2].height) <= 1)) {

				//share 012

				surroundingCells[0].corners[surroundingCells[0].activeCornerIndex] =
				surroundingCells[1].corners[surroundingCells[1].activeCornerIndex] =
				surroundingCells[2].corners[surroundingCells[2].activeCornerIndex] = vertex;

			} else if (Math.abs(surroundingCells[0].height - surroundingCells[1].height) <= 1) {

				// Share 01

				vertex.setZ((surroundingCells[0].centerCoord.z + surroundingCells[1].centerCoord.z) / 2);

				surroundingCells[0].corners[surroundingCells[0].activeCornerIndex] =
				surroundingCells[1].corners[surroundingCells[1].activeCornerIndex] = vertex;

				surroundingCells[2].corners[surroundingCells[2].activeCornerIndex] = vertex.clone().setZ(surroundingCells[2].centerCoord.z);

			} else if (Math.abs(surroundingCells[1].height - surroundingCells[2].height) <= 1) {
			
				// Share 12

				vertex.setZ((surroundingCells[1].centerCoord.z + surroundingCells[2].centerCoord.z) / 2);

				surroundingCells[1].corners[surroundingCells[1].activeCornerIndex] =
				surroundingCells[2].corners[surroundingCells[2].activeCornerIndex] = vertex;

				surroundingCells[0].corners[surroundingCells[0].activeCornerIndex] = vertex.clone().setZ(surroundingCells[0].centerCoord.z);

			} else {

				// No sharing

				surroundingCells[0].corners[surroundingCells[0].activeCornerIndex] = vertex.clone().setZ(surroundingCells[0].centerCoord.z);
				surroundingCells[1].corners[surroundingCells[1].activeCornerIndex] = vertex.clone().setZ(surroundingCells[1].centerCoord.z);
				surroundingCells[2].corners[surroundingCells[2].activeCornerIndex] = vertex.clone().setZ(surroundingCells[2].centerCoord.z);
			}
		}
	}

	var terrain = new THREE.Geometry();

	// For all map cells.
	for (var x = 1; x < this.width-1; x++) {
		for (var y = 1; y < this.height-1; y++) {

			this.makeHexagon(this.coordinateToIndex(x, y), terrain);
		}
	};

	for (var i = 0; i < this.cells.length; ++i) {

		delete this.cells[i].activeCornerIndex;
		delete this.cells[i].corners;
	}

	return terrain;
};


Map.prototype.makeHexagon = function (position, terrain) {

	var bevelDepth = 0.075;

	var cell = this.cells[position];
	var centerCoord = cell.centerCoord;
	for (var direction=0; direction<6; ++direction) {

		var a = cell.corners[direction];
		var b = cell.corners[Map.offsetDirectionByRelativeDirection(direction, 1)];

		var vertexIndexStart = terrain.vertices.length;


		// Top

		terrain.vertices.push(centerCoord.clone().applyMatrix4(Map.blenderStyleToRightHanded));
		terrain.vertices.push(          b.clone().lerp(centerCoord, 2 * bevelDepth).applyMatrix4(Map.blenderStyleToRightHanded));
		terrain.vertices.push(          a.clone().lerp(centerCoord, 2 * bevelDepth).applyMatrix4(Map.blenderStyleToRightHanded));

		terrain.faces.push(new THREE.Face3(
			vertexIndexStart + 0,
			vertexIndexStart + 1,
			vertexIndexStart + 2
		));


		// Bevel

		var bevelDown = new THREE.Vector3(0, 0, -bevelDepth);
		terrain.vertices.push(          b.clone().add(bevelDown).applyMatrix4(Map.blenderStyleToRightHanded));
		terrain.vertices.push(          a.clone().add(bevelDown).applyMatrix4(Map.blenderStyleToRightHanded));

		terrain.faces.push(new THREE.Face3(
			vertexIndexStart + 1,
			vertexIndexStart + 3,
			vertexIndexStart + 2
		));
		terrain.faces.push(new THREE.Face3(
			vertexIndexStart + 3,
			vertexIndexStart + 4,
			vertexIndexStart + 2
		));


		// Sides

		terrain.vertices.push(          b.clone().setZ(-bevelDepth).applyMatrix4(Map.blenderStyleToRightHanded));
		terrain.vertices.push(          a.clone().setZ(-bevelDepth).applyMatrix4(Map.blenderStyleToRightHanded));

		terrain.faces.push(new THREE.Face3(
			vertexIndexStart + 3,
			vertexIndexStart + 5,
			vertexIndexStart + 4
		));
		terrain.faces.push(new THREE.Face3(
			vertexIndexStart + 5,
			vertexIndexStart + 6,
			vertexIndexStart + 4
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

	coord.z = this.cells[position].height * 0.2;

	coord.x -= this.width/2;
	coord.y -= this.height/2;

	return new THREE.Vector3(coord.x, coord.y, coord.z);
}


