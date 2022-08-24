// import { registerCanvas, dispatchTouchStart, dispatchTouchMove, dispatchTouchEnd } from "@oasis-engine/miniprogram-adapter";
// import { OrbitControl } from '@oasis-engine/controls/dist/miniprogram';
// import * as o3 from "oasis-engine/dist/miniprogram";
// import { AssetType } from "oasis-engine";
import { WebGLRenderer } from "../../three/renderers/WebGLRenderer";
import { CineonToneMapping, ACESFilmicToneMapping, sRGBEncoding, NearestFilter, UnsignedByteType, RGBEFormat, RGBEEncoding, CubeUVReflectionMapping, EquirectangularReflectionMapping, VSMShadowMap, PCFShadowMap, PCFSoftShadowMap } from "../../three/constants";
import { PerspectiveCamera } from "../../three/cameras/PerspectiveCamera";
import { Scene } from "../../three/scenes/Scene";
import { GLTFLoader } from "../../three/loaders/GLTFLoader";
import { TextureLoader } from "../../three/loaders/TextureLoader"
import { TaobaoPlatform } from "../../adapter/adapter"
import { OrbitControls } from "../../three/controls/OrbitControls"
import { MeshoptDecoder } from "../../three/loaders/meshopt_decoder.asm.module.js"
import { AnimationMixer } from "../../three/animation/AnimationMixer" 
import { Clock } from '../../three/core/Clock';
import { Box3 } from '../../three/math/Box3';
import { AmbientLight } from '../../three/lights/AmbientLight';
import { DirectionalLight } from '../../three/lights/DirectionalLight';
import { Vector3 } from '../../three/math/Vector3';
import { KTX2Loader } from '../../three/loaders/KTX2Loader';
import { PlaneGeometry } from "../../three/geometries/PlaneGeometry";
import { MeshBasicMaterial } from "../../three/materials/MeshBasicMaterial";
import { Mesh } from "../../three/objects/Mesh";
import { ShadowMaterial } from "../../three/materials/ShadowMaterial";
import { Vector2 } from "../../three/math/Vector2";
import { Color } from "../../three/math/Color";
import { MeshMatcapMaterial } from "../../three/materials/MeshMatcapMaterial";
import { MeshStandardMaterial } from "../../three/materials/MeshStandardMaterial";
import { MeshPhysicalMaterial } from "../../three/materials/MeshPhysicalMaterial";
import { MeshLambertMaterial } from "../../three/materials/MeshLambertMaterial";
import { MeshPhongMaterial } from "../../three/materials/MeshPhongMaterial";
import { ShaderChunk } from "../../three/renderers/shaders/ShaderChunk";
import shadowmap_pars_pcss_fragmentGlsl from "../../three/renderers/shaders/ShaderChunk/shadowmap_pars_pcss_fragment.glsl";
import { WebGLRenderTarget } from "../../three/renderers/WebGLRenderTarget";
import { ShaderMaterial } from "../../three/materials/ShaderMaterial";
import { HorizontalBlurShader } from "../../three/renderers/shaders/ShaderChunk/HorizontalBlurShader";
import { VerticalBlurShader } from "../../three/renderers/shaders/ShaderChunk/VerticalBlurShader";
import { MeshDepthMaterial } from "../../three/materials/MeshDepthMaterial";
import { Group } from "../../three/objects/Group";
import { EffectComposer } from "../../three/postprocessing/EffectComposer";
import { RenderPass } from "../../three/postprocessing/RenderPass";
import { SMAAPass } from "../../three/postprocessing/SMAAPass";
import { CopyShader } from "../../three/postprocessing/shaders/CopyShader";
import { ShaderPass } from "../../three/postprocessing/ShaderPass";
import { SSAARenderPass } from "../../three/postprocessing/SSAARenderPass";

// ShaderChunk.shadowmap_pars_fragment = shadowmap_pars_pcss_fragmentGlsl;

const horizontalBlurMaterial = new ShaderMaterial( HorizontalBlurShader );
horizontalBlurMaterial.depthTest = false;

const verticalBlurMaterial = new ShaderMaterial( VerticalBlurShader );
verticalBlurMaterial.depthTest = false;

class Viewer {
  constructor({ containerWidth, containerHeight, ctx, canvas }) {
    this.lights = [];
    this.canvas = canvas;
    this.ctx = ctx;

    this.state = {
      showWireframe: false,
      useNormalmap: true,
      useRoughmap: true,
      useAmbient: true,
      useDirectional: true
    };

    this.prevTime = 0;

    this.scene = new Scene();

    const fov = 60;

    this.defaultCamera = new PerspectiveCamera(
      fov,
      containerWidth / containerHeight,
      0.01,
      1000
    );
    this.activeCamera = this.defaultCamera;
    this.scene.add(this.defaultCamera);

    this.renderer = new WebGLRenderer({
      antialias:true,
      alpha:true,
      canvas,
      context: ctx
    });

    // the render target that will show the shadows in the plane texture
    // this.renderTarget = new WebGLRenderTarget( 512, 512 );

    // the render target that we will use to blur the first render target
    // this.renderTargetBlur = new WebGLRenderTarget( 512, 512 );

    // this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = sRGBEncoding;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFShadowMap;
        
    // this.renderer.setClearColor(0xeceade);
    const pixelRatio = my.getSystemInfoSync().pixelRatio;
    this.renderer.setClearColor(0xf1ebdd);
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(containerWidth, containerHeight);
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.8;

    this.controls = new OrbitControls(this.defaultCamera, this.canvas);
    this.controls.screenSpacePanning = true;
    this.controls.enabled = true;

    this.composer = new EffectComposer( this.renderer );
		this.composer.addPass( new RenderPass( this.scene, this.activeCamera ) );
    const pass = new SMAAPass( containerWidth * pixelRatio, containerHeight * pixelRatio );
		this.composer.addPass( pass );
    // this.composer.setPixelRatio( pixelRatio ); // ensure pixel ratio is always 1 for performance reasons
    // const ssaaRenderPassP = new SSAARenderPass( this.scene, this.activeCamera );
    // ssaaRenderPassP.clearAlpha = 1;
    // ssaaRenderPassP.clearColor = 0xffffff;
    // ssaaRenderPassP.sampleLevel = 3;
    // ssaaRenderPassP.unbiased = true;
    // this.composer.addPass( ssaaRenderPassP );
    // const copyPass = new ShaderPass( CopyShader );
    // this.composer.addPass( copyPass );
    
    this.clock = new Clock();
    this.animate = this.animate.bind(this);
    this.canvas.requestAnimationFrame(this.animate);
  }

  animate() {
    // this.initialClearAlpha = this.renderer.getClearAlpha();
    // if (this.light4) {
    //   this.scene.overrideMaterial = this.depthMaterial;
    //   this.renderer.setClearAlpha( 0 );
    // //   // render to the render target to get the depths
    //   this.renderer.render(this.scene, this.light4.shadow.camera, this.renderTarget);
      
    // //   // console.log(this.renderTarget.texture)
    // //   // // // and reset the override material
    //   this.scene.overrideMaterial = null;
    //   // this.blurShadowFn( 1 );
    // //   // // // a second pass to reduce the artifacts
    // //   // // // (0.4 is the minimum blur amout so that the artifacts are gone)
    // //   // this.blurShadowFn( 4 * 0.4 );
    // }

    if (this.mixer) this.mixer.update(this.clock.getDelta());
    this.controls.update();
    this.render();
    this.canvas.requestAnimationFrame(this.animate);

  }

  render() {
		// this.renderer.setRenderTarget( null );
		// this.renderer.setClearAlpha( this.initialClearAlpha );
    // this.renderer.render(this.scene,this.activeCamera);
    this.composer.render();
  }

  load(url) {
    return new Promise(resolve => {

      const shadowGroup = new Group();

      const gltfLoader = new GLTFLoader();
      gltfLoader.setMeshoptDecoder(MeshoptDecoder);
      const ktx2Loader = new KTX2Loader();
      ktx2Loader.detectSupport(this.renderer);
      gltfLoader.setKTX2Loader(ktx2Loader);

      gltfLoader.load(url, gltf => {
        // const hands = gltf.scene.children[0].children[11];
        // const temp = [hands, ...gltf.scene.children[0].children.filter(item=>item.name!=='Hands_1')];
        // gltf.scene.children[0].children = temp;
        this.model = gltf.scene;

        this.mixer = new AnimationMixer(gltf.scene);
        if (gltf.animations.length > 0) this.mixer.clipAction(gltf.animations[0]).reset().play();
        console.log(gltf.scene.children[0].children)
        console.log(gltf.animations[0].tracks)
        resolve();

        try {
        // this.model.children[0].children.filter(item=>item.type==="Object3D" && item.name!=='Hands_1' && item.name!=='Male_Head_1').map(item=>item.visible=false);
        // this.model.children[1].visible=false;
        this.model.traverse(item=>{
          if (item.material && item.material.type!=='ShadowMaterial')  {
            // const stdMaterial = new MeshPhysicalMaterial();
            // stdMaterial.map = item.material.map;
            // stdMaterial.roughness=1;
            // stdMaterial.metalness=0;
            // item.material = stdMaterial;
            item.castShadow = true;
          }
          if (item.material && item.material.map) item.material.map.anisotropy = 16;
          item.receiveShadow = true;
          // if (item.material) this.csm.setupMaterial( item.material );
        });

        // cloth
        gltf.scene.children[0].children[1].children[0].material.roughness = 0.8;
        gltf.scene.children[0].children[1].children[0].material.metalness = 0;
        gltf.scene.children[0].children[1].children[0].material.normalMap = gltf.scene.children[0].children[5].material.normalMap;
        gltf.scene.children[0].children[1].children[0].material.normalScale = new Vector2(4, 4);

        gltf.scene.children[0].children[1].children[1].material.roughness = 0.9;
        gltf.scene.children[0].children[1].children[1].material.metalness = 0.2;

        // PANTS
        gltf.scene.children[0].children[5].material.roughness = 0.75;
        gltf.scene.children[0].children[5].material.metalness = 0;
        gltf.scene.children[0].children[5].material.normalScale = new Vector2(3, 3);

         // SHOES
        gltf.scene.children[0].children[8].material.roughness = 0.9;
        gltf.scene.children[0].children[8].material.metalness = 0.3;
        gltf.scene.children[0].children[10].material.roughness = 0.9;

        // const clothMaterial = new MeshLambertMaterial();
        // clothMaterial.map = gltf.scene.children[0].children[1].children[0].material.map;
        // gltf.scene.children[0].children[1].children[0].material = clothMaterial;
        // gltf.scene.children[0].children[1].children[1].material = clothMaterial;

        gltf.scene.children[0].children[3].children[0].material.color.setHex('0x000000')
        gltf.scene.children[0].children[3].children[0].material.roughness= 0.3;
        
        // skin
        this.skin = gltf.scene.children[0].children[4].clone();
        // gltf.scene.children[0].children[4].visible = false;
        gltf.scene.children[0].children[4].material.color.setHex('0xef7952');
        gltf.scene.children[0].children[4].material.roughness = 1;
        gltf.scene.children[0].children[4].material.metalness = 0;
        // gltf.scene.children[0].children[4].receiveShadow = false;

        this.skin.receiveShadow = true;
        this.skin.material = new ShadowMaterial({ opacity: 1 });
        shadowGroup.add(this.skin)

        const hairMaterial = new MeshStandardMaterial();
        // hairMaterial.map = gltf.scene.children[0].children[4].material.map;
        // hairMaterial.lightMapIntensity = 0;
        hairMaterial.color.setHex('0x010101');
        // hairMaterial.emissive.setHex('0x222222');
        // hairMaterial.emissiveIntensity = 0.1;
        hairMaterial.roughness = 0.8;
        // hairMaterial.metalness=0.2;
        // hairMaterial.emissive.setHex('0xffffff');
        gltf.scene.children[0].children[6].receiveShadow = false;
        gltf.scene.children[0].children[6].material = hairMaterial; // hair

        gltf.scene.children[0].children[9].receiveShadow = false;
        gltf.scene.children[0].children[9].material = hairMaterial; // eyebrow
      } catch(err) {
        console.error(err);
      }

        // ********  blur shadow  ********  //

        // this.depthMaterial = new MeshDepthMaterial();
				// this.depthMaterial.onBeforeCompile = ( shader ) => {
				// 	shader.uniforms.darkness ={ value: 3 };
				// 	shader.fragmentShader = /* glsl */`
				// 		uniform float darkness;
				// 		${shader.fragmentShader.replace(
				// 	'gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );',
				// 	'gl_FragColor = vec4( vec3( 0.0 ), ( 1.0 - fragCoordZ ) * darkness );'
				// )}
				// 	`;
        // };
        
				// this.depthMaterial.depthTest = false;
        // this.depthMaterial.depthWrite = false;

        // const skinShadowMaterial = new MeshBasicMaterial({
				// 	map: this.renderTarget.texture,
				// 	opacity: 1,
				// 	// transparent: true,
				// 	depthWrite: false,
        // });
        // this.skin = gltf.scene.children[0].children[4].clone();
        // this.skin.material.color.setHex('0xbe5d44');
        // this.skin.material = new ShadowMaterial();
        // console.log(this.skin)
        // this.skin.receiveShadow = true;
        // this.skin.name = 'skinShadow';
				// the plane onto which to blur the texture
				// this.blurShadow = new Mesh(gltf.scene.children[0].children[3].geometry);
        // this.blurShadow.visible = false;
        
        // gltf.scene.children[0].add(shadowGroup);
        // gltf.scene.children[0].add(this.blurShadow);

        this.setContent(gltf.scene);

        const material = new ShadowMaterial({ opacity : 0.3 });
        const plane = new Mesh(new PlaneGeometry(50, 50), material);
        plane.rotation.set(-0.5*Math.PI, 0, 0);
        plane.receiveShadow = true;
        plane.depthWrite = false;
        this.model.add(plane);
        
        this.model.traverse(function (child) {
            if (child.isMesh) {
                child.frustumCulled = false;
            }
        });
      });
    });
  }

  setShoe(index){
    const shoeList = ['Hoodie_1','MALE_CNY_JACKET_1'];
    this.model.traverse(item=>{
      if (shoeList.includes(item.name)) {
        item.visible=item.name===shoeList[index];
      }
    });
  }

  /**
   * @param {THREE.Object3D} object
   * @param {Array<THREE.AnimationClip} clips
   */
  setContent(object) {
    const box = new Box3().setFromObject(object);
    const size = box.getSize(new Vector3()).length();
    const center = box.getCenter(new Vector3());
    this.controls.reset();

    object.position.x += object.position.x - center.x;
    object.position.y += object.position.y - center.y;
    object.position.z += object.position.z - center.z;
    this.controls.maxDistance = size * 2;
    this.controls.minDistance = size / 3;
    this.defaultCamera.near = size / 10;
    this.defaultCamera.far = size * 10;
    this.defaultCamera.updateProjectionMatrix();
    this.defaultCamera.position.copy(center);
    this.defaultCamera.position.x += size / 2.0;
    this.defaultCamera.position.y += size / 5.0;
    this.defaultCamera.position.z += size / 2.0;
    this.defaultCamera.lookAt(center);

    this.controls.saveState();
    this.content = object;

    this.scene.add(object);
    this.refreshLights();
  }

  refreshLights() {
    this.lights.forEach(light => light.parent.remove(light));
    this.lights.length = 0;

    const light1 = new AmbientLight(0xffffff, 0.1);
    this.scene.add(light1);
    this.lights.push(light1);

    const light2 = new DirectionalLight(0xded7d7, 0.5);
    light2.position.set(1.708, 0.058, 0.176); 
    // light2.castShadow = true;
    // light2.shadow.mapSize.width = 1024;
    // light2.shadow.mapSize.height = 1024;
    // light2.shadow.bias = -0.3;
    // light2.shadow.camera.near = -0.01;
    // light2.shadow.camera.far = 70000;
    this.scene.add(light2);
    this.lights.push(light2);

    const light3 = new DirectionalLight( 0xffffff, 0.6);
    light3.position.set(-0.675, 0.302, -2.743); 
    this.scene.add(light3);
    this.lights.push(light3);

    const light4 = new DirectionalLight( 0xffffff, 1.1);
    light4.position.set(-0.995, 3.142, 2.861); 
    light4.castShadow = true;
    light4.shadow.mapSize.width = 2048 * 2;
    light4.shadow.mapSize.height = 2048 * 2;
    light4.shadow.bias = -0.00000016;
    light4.shadow.radius = 3;
    light4.shadow.camera.near = -0.01;
    light4.shadow.camera.far = 70000;
    this.scene.add(light4);
    this.lights.push(light4);

    this.light4 = light4;

  }
}

Page({
  data: {
  },
  onCanvasReady() {
    my.showLoading();
    my._createCanvas({
      id: "canvas",
      success: async (canvas) => {
        if (canvas) {
            const {windowWidth, windowHeight} = my.getSystemInfoSync();
            canvas._width = windowWidth;
            canvas._height = windowHeight;
            canvas.width = canvas._width;
            canvas.height = canvas._height;

            this.canvas = canvas;
            // for Three GLTFParser ImageLoader loading
            const taobaoPlatform = new TaobaoPlatform(canvas);
            my.global = taobaoPlatform.getGlobals();
            my.global.canvas = canvas;

            const ctx = canvas.getContext('webgl', { alpha: true });
            this.ctx = ctx;

            this.viewer = new Viewer({
              containerWidth: windowWidth,
              containerHeight: windowHeight,
              canvas,
              ctx
            });
            await this.viewer.load(
              'https://test-blender.oss-cn-shanghai.aliyuncs.com/3d/xiezi_comp.gltf'
              // 'https://test-blender.oss-cn-shanghai.aliyuncs.com/duiba0413/0413_comp.gltf'
            );
            my.hideLoading();
            console.log('load finish')
        } else {
          throw "success but no canvas";
        }
      },
    });
  },
  onTapAJ(){
    this.viewer.setShoe(1);
  },
  onTapDunk(){
    this.viewer.setShoe(0);
  },
  onTouchStart(e) {
    this.viewer.controls.onTouchStart(e);
  },
  onTouchMove(e) {
    this.viewer.controls.onTouchMove(e);
  },
  onTouchEnd(e) {
    this.viewer.controls.onTouchEnd(e);
  },
});
