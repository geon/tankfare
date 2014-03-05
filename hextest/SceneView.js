"use strict";


function fromEvent (e) {
	return new THREE.Vector2(e.pageX, e.pageY);
}


function SceneView (options) {

	this.renderer = options.renderer;
	this.scene    = options.scene;

	this.camera = new THREE.PerspectiveCamera(
		45,
		1,
		0.1,
		1000
	);

	this.polarOrientation = new THREE.Vector2(0, 0.4);
	this.setCameraOrientationFromPolarCoords(this.polarOrientation);


	var self = this;
	var el = $(this.renderer.domElement);

	el.mousedown(function(e){

		self.mouseStart = fromEvent(e);

		switch (e.which) {

			// No button
			case 0:

				break;

			// Left
			case 1:

				// Set up camera orbiting.
				self.orientationStart = self.polarOrientation.clone();

				break;

			// Right
			case 3:

				break;
		}

	});
	el.mousemove(function(e){

		switch (e.which) {

			// No button
			case 0:

				break;

			// Left
			case 1:

				// Camera orbiting.

				var mousePosition = fromEvent(e);
				var dragVector = mousePosition.sub(self.mouseStart);

				var orbitRate = 3.5;
				self.polarOrientation.addVectors(self.orientationStart, dragVector.multiplyScalar(orbitRate/el.width()));
				self.setCameraOrientationFromPolarCoords(self.polarOrientation);

				self.render();

				break;

			// Right
			case 3:

				break;
		}

	});
	el.mouseup(function(e){

		switch (e.which) {

			// No button
			case 0:

				break;

			// Left
			case 1:

				break;

			// Right
			case 3:

				// Don't show the context menu.

				// Doesn't work.
				// e.preventDefault();

				break;
		}

		// delete self.mouseStart;
		// delete self.orientationStart;
	});

	this.render();
}




SceneView.prototype.setCameraOrientationFromPolarCoords = function (polarCoords) {

	var orientation = new THREE.Quaternion().multiplyQuaternions(
		new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0 ), -polarCoords.x),
		new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0 ), -polarCoords.y)
	);

	this.camera.position = new THREE.Vector3(0, 0, 30).applyQuaternion(orientation);
	this.camera.lookAt(new THREE.Vector3(0, 0, 0));
}


SceneView.prototype.render = function () {

	var el = $(this.renderer.domElement).parent();	
	this.renderer.setSize(el.width(), el.height());
	this.camera.aspect = el.width() / el.height();

	this.camera.updateProjectionMatrix();

	this.renderer.render(this.scene, this.camera);
};
