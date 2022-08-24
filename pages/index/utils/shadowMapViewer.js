const { OrthographicCamera } = require("../../../three/cameras/OrthographicCamera");
const { DoubleSide, LinearFilter } = require("../../../three/constants");
const { PlaneGeometry } = require("../../../three/geometries/Geometries");
const { ShaderMaterial } = require("../../../three/materials/Materials");
const { Mesh } = require("../../../three/objects/Mesh");
const { UniformsUtils } = require("../../../three/renderers/shaders/UniformsUtils");
const { Scene } = require("../../../three/scenes/Scene");
const { Texture } = require("../../../three/textures/Texture");

const UnpackDepthRGBAShader = {
		uniforms: {
			'tDiffuse': {
				value: null
			},
			'opacity': {
				value: 1.0
			}
		},
		vertexShader:
  /* glsl */
  `
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,
		fragmentShader:
  /* glsl */
  `
		uniform float opacity;
		uniform sampler2D tDiffuse;
		varying vec2 vUv;
		#include <packing>
		void main() {
			float depth = 1.0 - unpackRGBAToDepth( texture2D( tDiffuse, vUv ) );
			gl_FragColor = vec4( vec3( depth ), opacity );
		}`
	};

export default class ShadowMapViewer {

		constructor( light ) {

			//- Internals
			const scope = this;
			let userAutoClearSetting; //Holds the initial position and dimension of the HUD

			const frame = {
				x: 10,
				y: 10,
				width: 256,
				height: 256
      };
      const {windowWidth, windowHeight} = my.getSystemInfoSync();
			const camera = new OrthographicCamera( windowWidth / - 2, windowWidth / 2, windowHeight / 2, windowHeight / - 2, 1, 10 );
			camera.position.set( 0, 0, 2 );
			const scene = new Scene(); //HUD for shadow map

			const shader = UnpackDepthRGBAShader;
			const uniforms = UniformsUtils.clone( shader.uniforms );
			const material = new ShaderMaterial( {
				uniforms: uniforms,
				vertexShader: shader.vertexShader,
				fragmentShader: shader.fragmentShader
			} );
			const plane = new PlaneGeometry( frame.width, frame.height );
			const mesh = new Mesh( plane, material );
			scene.add( mesh ); //Label for light's name


			function resetPosition() {
				scope.position.set( scope.position.x, scope.position.y );
			} //- API
			// Set to false to disable displaying this shadow map


			this.enabled = true; // Set the size of the displayed shadow map on the HUD

			this.size = {
				width: frame.width,
				height: frame.height,
				set: function ( width, height ) {

					this.width = width;
					this.height = height;
					mesh.scale.set( this.width / frame.width, this.height / frame.height, 1 ); //Reset the position as it is off when we scale stuff

					resetPosition();

				}
			}; // Set the position of the displayed shadow map on the HUD

			this.position = {
				x: frame.x,
				y: frame.y,
				set: function ( x, y ) {

					this.x = x;
					this.y = y;
					const width = scope.size.width;
					const height = scope.size.height;
					mesh.position.set( - windowWidth / 2 + width / 2 + this.x, windowHeight / 2 - height / 2 - this.y, 0 );
				}
			};

			this.render = function ( renderer ) {

				if ( this.enabled ) {

					//Because a light's .shadowMap is only initialised after the first render pass
					//we have to make sure the correct map is sent into the shader, otherwise we
					//always end up with the scene's first added shadow casting light's shadowMap
					//in the shader
          //See: https://github.com/mrdoob/three.js/issues/5932
          uniforms.tDiffuse.value = light.shadow.map.texture;
					userAutoClearSetting = renderer.autoClear;
					renderer.autoClear = false; // To allow render overlay

					renderer.clearDepth();
					renderer.render( scene, camera );
					renderer.autoClear = userAutoClearSetting; //Restore user's setting

				}

			};

			this.updateForWindowResize = function () {

				if ( this.enabled ) {

					camera.left = windowWidth / - 2;
					camera.right = windowWidth / 2;
					camera.top = windowHeight / 2;
					camera.bottom = windowHeight / - 2;
					camera.updateProjectionMatrix();
					this.update();

				}

			};

			this.update = function () {

				this.position.set( this.position.x, this.position.y );
				this.size.set( this.size.width, this.size.height );

			}; //Force an update to set position/size


			this.update();

		}

	}
