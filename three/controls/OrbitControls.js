import { EventDispatcher } from '../core/EventDispatcher';
import { TOUCH } from '../constants';
import { Quaternion } from '../math/Quaternion';
import { Vector2 } from '../math/Vector2';
import { Vector3 } from '../math/Vector3';
import { Spherical } from '../math/Spherical';

const _changeEvent = { type: 'change' };
const _startEvent = { type: 'start' };
const _endEvent = { type: 'end' };

const twoPI = 2 * Math.PI;

const STATE = {
	NONE: - 1,
	ROTATE: 0,
	DOLLY: 1,
	PAN: 2,
	TOUCH_ROTATE: 3,
	TOUCH_PAN: 4,
	TOUCH_DOLLY_PAN: 5,
	TOUCH_DOLLY_ROTATE: 6
};

const EPS = 0.000001;

// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - touch: one-finger move
//    Zoom - touch: two-finger spread or squish
//    Pan - touch: two-finger move

class OrbitControls extends EventDispatcher {
	_state = STATE.NONE;

	// current position in spherical coordinates
	_spherical = new Spherical();
	_sphericalDelta = new Spherical();

	_scale = 1;
	_panOffset = new Vector3();
	_zoomChanged = false;

	_rotateStart = new Vector2();
	_rotateEnd = new Vector2();
	_rotateDelta = new Vector2();

	_panStart = new Vector2();
	_panEnd = new Vector2();
	_panDelta = new Vector2();

	_dollyStart = new Vector2();
	_dollyEnd = new Vector2();
	_dollyDelta = new Vector2();

	_pointers = [];
	_pointerPositions = {};

	// update function
	_offset = new Vector3();
	_quat
	_quatInverse
	// so camera.up is the orbit axis
	_lastPosition = new Vector3();
	_lastQuaternion = new Quaternion();

	_panLeftV = new Vector3();
	_panUpV = new Vector3();
	_tempPanOffset = new Vector3();

	constructor(object, canvas) {
		super();
		if (canvas === undefined) console.warn('THREE.OrbitControls: The second parameter "canvas" is now mandatory.');

		this.object = object;
		this.canvas = canvas;

		this._quat = new Quaternion().setFromUnitVectors(this.object.up, new Vector3(0, 1, 0));
		this._quatInverse = this._quat.clone().invert();

		// Set to false to disable this control
		this.enabled = true;

		// "target" sets the location of focus, where the object orbits around
		this.target = new Vector3();

		// How far you can dolly in and out ( PerspectiveCamera only )
		this.minDistance = 0;
		this.maxDistance = Infinity;

		// How far you can zoom in and out ( OrthographicCamera only )
		this.minZoom = 0;
		this.maxZoom = Infinity;

		// How far you can orbit vertically, upper and lower limits.
		// Range is 0 to Math.PI radians.
		this.minPolarAngle = 0; // radians
		this.maxPolarAngle = Math.PI; // radians

		// How far you can orbit horizontally, upper and lower limits.
		// If set, the interval [ min, max ] must be a sub-interval of [ - 2 PI, 2 PI ], with ( max - min < 2 PI )
		this.minAzimuthAngle = - Infinity; // radians
		this.maxAzimuthAngle = Infinity; // radians

		// Set to true to enable damping (inertia)
		// If damping is enabled, you must call controls.update() in your animation loop
		this.enableDamping = false;
		this.dampingFactor = 0.05;

		// This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
		// Set to false to disable zooming
		this.enableZoom = true;
		this.zoomSpeed = 1.0;

		// Set to false to disable rotating
		this.enableRotate = true;
		this.rotateSpeed = 1.0;

		// Set to false to disable panning
		this.enablePan = true;
		this.panSpeed = 1.0;
		this.screenSpacePanning = true; // if false, pan orthogonal to world-space direction camera.up
		this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

		// Set to true to automatically rotate around the target
		// If auto-rotate is enabled, you must call controls.update() in your animation loop
		this.autoRotate = false;
		this.autoRotateSpeed = 2.0; // 30 seconds per orbit when fps is 60

		// Touch fingers
		this.touches = { ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN };

		// for reset
		this.target0 = this.target.clone();
		this.position0 = this.object.position.clone();
		this.zoom0 = this.object.zoom;

		// force an update at start
		this.update();
	}

	getPolarAngle() { return this._spherical.phi };

	getAzimuthalAngle() { return this._spherical.theta };

	getDistance() { return this.object.position.distanceTo(this.target) };

	saveState() {
		this.target0.copy(this.target);
		this.position0.copy(this.object.position);
		this.zoom0 = this.object.zoom;
	}

	reset() {
		this.target.copy(this.target0);
		this.object.position.copy(this.position0);
		this.object.zoom = this.zoom0;

		this.object.updateProjectionMatrix();
		this.dispatchEvent(_changeEvent);

		this.update();

		this._state = STATE.NONE;
	}

	// this method is exposed, but perhaps it would be better if we can make it private...
	update() {
		const { position } = this.object;
		this._offset.copy(position).sub(this.target);

		// rotate offset to "y-axis-is-up" space
		this._offset.applyQuaternion(this._quat);

		// angle from z-axis around y-axis
		this._spherical.setFromVector3(this._offset);

		if (this.autoRotate && this._state === STATE.NONE) {
			this._rotateLeft(this._getAutoRotationAngle());
		}
		if (this.enableDamping) {
			this._spherical.theta += this._sphericalDelta.theta * this.dampingFactor;
			this._spherical.phi += this._sphericalDelta.phi * this.dampingFactor;
		} else {
			this._spherical.theta += this._sphericalDelta.theta;
			this._spherical.phi += this._sphericalDelta.phi;
		}

		// restrict theta to be between desired limits

		let min = this.minAzimuthAngle;
		let max = this.maxAzimuthAngle;

		if (isFinite(min) && isFinite(max)) {

			if (min < - Math.PI) min += twoPI; else if (min > Math.PI) min -= twoPI;
			if (max < - Math.PI) max += twoPI; else if (max > Math.PI) max -= twoPI;

			if (min <= max) {
				this._spherical.theta = Math.max(min, Math.min(max, this._spherical.theta));
			} else {
				this._spherical.theta = (this._spherical.theta > (min + max) / 2) ?
					Math.max(min, this._spherical.theta) :
					Math.min(max, this._spherical.theta);
			}
		}

		// restrict phi to be between desired limits
		this._spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this._spherical.phi));

		this._spherical.makeSafe();
		this._spherical.radius *= this._scale;

		// restrict radius to be between desired limits
		this._spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this._spherical.radius));

		// move target to panned location

		if (this.enableDamping === true) {
			this.target.addScaledVector(this._panOffset, this.dampingFactor);
		} else {
			this.target.add(this._panOffset);
		}

		this._offset.setFromSpherical(this._spherical);

		// rotate offset back to "camera-up-vector-is-up" space
		this._offset.applyQuaternion(this._quatInverse);

		position.copy(this.target).add(this._offset);

		this.object.lookAt(this.target);

		if (this.enableDamping === true) {
			this._sphericalDelta.theta *= (1 - this.dampingFactor);
			this._sphericalDelta.phi *= (1 - this.dampingFactor);
			this._panOffset.multiplyScalar(1 - this.dampingFactor);
		} else {
			this._sphericalDelta.set(0, 0, 0);
			this._panOffset.set(0, 0, 0);
		}

		this._scale = 1;

		// update condition is:
		// min(camera displacement, camera rotation in radians)^2 > EPS
		// using small-angle approximation cos(x/2) = 1 - x^2 / 8

		if (this._zoomChanged ||
			this._lastPosition.distanceToSquared(this.object.position) > EPS ||
			8 * (1 - this._lastQuaternion.dot(this.object.quaternion)) > EPS) {
			this.dispatchEvent(_changeEvent);

			this._lastPosition.copy(this.object.position);
			this._lastQuaternion.copy(this.object.quaternion);
			this._zoomChanged = false;
			return true;
		}
		return false;
	}

	onTouchStart(event) {
		if (!this.enabled) return
		this._trackPointer(event);

		switch (this._pointers.length) {
			case 1:
				switch (this.touches.ONE) {
					case TOUCH.ROTATE:
						if (this.enableRotate === false) return;
						this._handleTouchStartRotate();
						this._state = STATE.TOUCH_ROTATE;
						break;

					case TOUCH.PAN:
						if (this.enablePan === false) return;
						this._handleTouchStartPan();
						this._state = STATE.TOUCH_PAN;
						break;

					default:
						this._state = STATE.NONE;
				}
				break;

			case 2:
				switch (this.touches.TWO) {
					case TOUCH.DOLLY_PAN:
						if (this.enableZoom === false && this.enablePan === false) return;
						this._handleTouchStartDollyPan();
						this._state = STATE.TOUCH_DOLLY_PAN;
						break;

					case TOUCH.DOLLY_ROTATE:
						if (this.enableZoom === false && this.enableRotate === false) return;
						this._handleTouchStartDollyRotate();
						this._state = STATE.TOUCH_DOLLY_ROTATE;
						break;

					default:
						this._state = STATE.NONE;
				}
				break;

			default:
				this._state = STATE.NONE;
		}

		if (this._state !== STATE.NONE) {
			this.dispatchEvent(_startEvent);
		}
	}

	onTouchMove(event) {
		if (!this.enabled) return
		this._trackPointer(event);
		switch (this._state) {
			case STATE.TOUCH_ROTATE:
				if (this.enableRotate === false) return;
				this._handleTouchMoveRotate(event);
				this.update();
				break;

			case STATE.TOUCH_PAN:
				if (this.enablePan === false) return;
				this._handleTouchMovePan(event);
				this.update();
				break;

			case STATE.TOUCH_DOLLY_PAN:
				if (this.enableZoom === false && this.enablePan === false) return;
				this._handleTouchMoveDollyPan(event);
				this.update();
				break;

			case STATE.TOUCH_DOLLY_ROTATE:
				if (this.enableZoom === false && this.enableRotate === false) return;
				this._handleTouchMoveDollyRotate(event);
				this.update();
				break;

			default:
				this._state = STATE.NONE;
		}
	}

	onTouchEnd(event) {
		if (!this.enabled) return
		this._trackPointer(event);
		this._handleTouchEnd(event);
		this.dispatchEvent(_endEvent);
		this._state = STATE.NONE;
	}

	_getAutoRotationAngle() {
		return 2 * Math.PI / 60 / 60 * this.autoRotateSpeed;
	}

	_rotateLeft(angle) {
		this._sphericalDelta.theta -= angle;
	}

	_rotateUp(angle) {
		this._sphericalDelta.phi -= angle;
	}

	_panLeft(distance, objectMatrix) {
		this._panLeftV.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
		this._panLeftV.multiplyScalar(-distance);

		this._panOffset.add(this._panLeftV);
	}

	_panUp(distance, objectMatrix) {
		if (this.screenSpacePanning === true) {
			this._panUpV.setFromMatrixColumn(objectMatrix, 1);
		} else {
			this._panUpV.setFromMatrixColumn(objectMatrix, 0);
			this._panUpV.crossVectors(this.object.up, v);
		}
		this._panUpV.multiplyScalar(distance);
		this._panOffset.add(this._panUpV);
	}

	// deltaX and deltaY are in pixels; right and down are positive
	_pan(deltaX, deltaY) {
		const { object, target, canvas } = this;
		if (object.isPerspectiveCamera) {
			// perspective
			const { position } = object;
			this._tempPanOffset.copy(position).sub(target);
			let targetDistance = this._tempPanOffset.length();
			// half of the fov is center to top of screen
			targetDistance *= Math.tan((object.fov / 2) * Math.PI / 180.0);

			// we use only clientHeight here so aspect ratio does not distort speed
			this._panLeft(2 * deltaX * targetDistance / canvas._height, object.matrix);
			this._panUp(2 * deltaY * targetDistance / canvas._height, object.matrix);

		} else if (object.isOrthographicCamera) {

			// orthographic
			this._panLeft(deltaX * (object.right - object.left) / object.zoom / canvas._width, object.matrix);
			this._panUp(deltaY * (object.top - object.bottom) / object.zoom / canvas._height, object.matrix);

		} else {
			// camera neither orthographic nor perspective
			console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');
			this.enablePan = false;
		}
	}

	_dollyOut(dollyScale) {
		const { object, minZoom, maxZoom } = this;
		if (object.isPerspectiveCamera) {
			this._scale /= dollyScale;
		} else if (object.isOrthographicCamera) {
			object.zoom = Math.max(minZoom, Math.min(maxZoom, object.zoom * dollyScale));
			object.updateProjectionMatrix();
			this._zoomChanged = true;
		} else {
			console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
			this.enableZoom = false;
		}
	}

	_handleTouchStartRotate() {
		if (this._pointers.length === 1) {
			this._rotateStart.set(this._pointers[0].pageX, this._pointers[0].pageY);
		} else {
			const x = 0.5 * (this._pointers[0].pageX + this._pointers[1].pageX);
			const y = 0.5 * (this._pointers[0].pageY + this._pointers[1].pageY);
			this._rotateStart.set(x, y);
		}
	}

	_handleTouchStartPan() {
		if (this._pointers.length === 1) {
			this._panStart.set(this._pointers[0].pageX, this._pointers[0].pageY);
		} else {
			const x = 0.5 * (this._pointers[0].pageX + this._pointers[1].pageX);
			const y = 0.5 * (this._pointers[0].pageY + this._pointers[1].pageY);
			this._panStart.set(x, y);
		}
	}

	_handleTouchStartDolly() {
		const dx = this._pointers[0].pageX - this._pointers[1].pageX;
		const dy = this._pointers[0].pageY - this._pointers[1].pageY;
		const distance = Math.sqrt(dx * dx + dy * dy);
		this._dollyStart.set(0, distance);
	}

	_handleTouchStartDollyPan() {
		if (this.enableZoom) this._handleTouchStartDolly();
		if (this.enablePan) this._handleTouchStartPan();
	}

	_handleTouchStartDollyRotate() {
		if (this.enableZoom) this._handleTouchStartDolly();
		if (this.enableRotate) this._handleTouchStartRotate();
	}

	_handleTouchMoveRotate(event) {
    const { pageX, pageY } = event.changedTouches[0];
		if (this._pointers.length === 1) {
			this._rotateEnd.set(pageX, pageY);
		} else {
			const position = this._getSecondPointerPosition(event.changedTouches[0].identifier);
			const x = 0.5 * (pageX + position.x);
			const y = 0.5 * (pageY + position.y);
			this._rotateEnd.set(x, y);
		}
		this._rotateDelta.subVectors(this._rotateEnd, this._rotateStart).multiplyScalar(this.rotateSpeed);

		const { canvas } = this;

		this._rotateLeft(2 * Math.PI * this._rotateDelta.x / canvas._height); // yes, height
		this._rotateUp(2 * Math.PI * this._rotateDelta.y / canvas._height);
    this._rotateStart.copy(this._rotateEnd);
	}

	_handleTouchMovePan(event) {
		const { pageX, pageY } = event.changedTouches[0];

		if (this._pointers.length === 1) {
			this._panEnd.set(pageX, pageY);
		} else {
			const position = this._getSecondPointerPosition(event.changedTouches[0].identifier);
			const x = 0.5 * (pageX + position.x);
			const y = 0.5 * (pageY + position.y);
			this._panEnd.set(x, y);
		}
		this._panDelta.subVectors(this._panEnd, this._panStart).multiplyScalar(this.panSpeed);
		this._pan(this._panDelta.x, this._panDelta.y);

		this._panStart.copy(this._panEnd);
	}

	_handleTouchMoveDolly(event) {
		const { pageX, pageY } = event.changedTouches[0];

		const position = this._getSecondPointerPosition(event.changedTouches[0].identifier);
		const dx = pageX - position.x;
		const dy = pageY - position.y;
		const distance = Math.sqrt(dx * dx + dy * dy);

		this._dollyEnd.set(0, distance);
		this._dollyDelta.set(0, Math.pow(this._dollyEnd.y / this._dollyStart.y, this.zoomSpeed));
		this._dollyOut(this._dollyDelta.y);
		this._dollyStart.copy(this._dollyEnd);
	}

	_handleTouchMoveDollyPan(event) {
		if (this.enableZoom) this._handleTouchMoveDolly(event);
		if (this.enablePan) this._handleTouchMovePan(event);
	}

	_handleTouchMoveDollyRotate(event) {
		if (this.enableZoom) this._handleTouchMoveDolly(event);
		if (this.enableRotate) this._handleTouchMoveRotate(event);
	}

	_handleTouchEnd() {

	}

	//
	// event handlers - FSM: listen for events and reset state
	//

	_trackPointer({ touches, type }) {
		this._pointers = touches.map(item => ({ ...item, pointerId: item.identifier }));

		for (const touch of touches) {
			const { identifier, pageX, pageY } = touch;
			if (type === 'touchEnd') {
				if (touches.length === 0) this._pointerPositions = {};
				else delete this._pointerPositions[identifier]
			} else {
				let position = this._pointerPositions[identifier];
				if (position === undefined) {
					position = new Vector2();
					this._pointerPositions[identifier] = position;
				}
				position.set(pageX, pageY);
			}
		}
	}

	_getSecondPointerPosition(pointerId) {
		const pointer = (pointerId === this._pointers[0].pointerId) ? this._pointers[1] : this._pointers[0];
		return this._pointerPositions[pointer.pointerId];
	}

}

// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
// This is very similar to OrbitControls, another set of touch behavior
//
//    Orbit - touch: two-finger rotate
//    Zoom - touch: two-finger spread or squish
//    Pan - touch: one-finger move

class MapControls extends OrbitControls {

	constructor(object, domElement) {

		super(object, domElement);

		this.screenSpacePanning = false; // pan orthogonal to world-space direction camera.up

		this.touches.ONE = TOUCH.PAN;
		this.touches.TWO = TOUCH.DOLLY_ROTATE;

	}
}

export { OrbitControls, MapControls };
