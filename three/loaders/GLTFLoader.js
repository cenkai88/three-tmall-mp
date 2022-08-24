import { FileLoader } from './FileLoader';
import { Loader } from './Loader';
import { LoaderUtils } from './LoaderUtils';

import { BINARY_EXTENSION_HEADER_MAGIC, EXTENSIONS } from './gltf/utils';

import { GLTFMaterialsClearcoatExtension } from './gltf/GLTFMaterialsClearcoatExtension';
import { GLTFTextureBasisUExtension } from './gltf/GLTFTextureBasisUExtension';
import { GLTFTextureWebPExtension } from './gltf/GLTFTextureWebPExtension';
import { GLTFMaterialsSheenExtension } from './gltf/GLTFMaterialsSheenExtension';
import { GLTFMaterialsTransmissionExtension } from './gltf/GLTFMaterialsTransmissionExtension';
import { GLTFMaterialsVolumeExtension } from './gltf/GLTFMaterialsVolumeExtension';
import { GLTFMaterialsIorExtension } from './gltf/GLTFMaterialsIorExtension';
import { GLTFMaterialsSpecularExtension } from './gltf/GLTFMaterialsSpecularExtension';
import { GLTFLightsExtension } from './gltf/GLTFLightsExtension';
import { GLTFMeshoptCompression } from './gltf/GLTFMeshoptCompression';

import { GLTFBinaryExtension } from './gltf/GLTFBinaryExtension';

import { GLTFParser } from './gltf/GLTFParser';
import { GLTFMaterialsPbrSpecularGlossinessExtension } from './gltf/GLTFMaterialsPbrSpecularGlossinessExtension';
import { GLTFMaterialsUnlitExtension } from './gltf/GLTFMaterialsUnlitExtension';
import { GLTFDracoMeshCompressionExtension } from './gltf/GLTFDracoMeshCompressionExtension';
import { GLTFTextureTransformExtension } from './gltf/GLTFTextureTransformExtension';
import { GLTFMeshQuantizationExtension } from './gltf/GLTFMeshQuantizationExtension';

class GLTFLoader extends Loader {
  constructor(manager) {
    super(manager);

    this.dracoLoader = null;
    this.ktx2Loader = null;
    this.meshoptDecoder = null;

    this.pluginCallbacks = [];

    this.register(parser => new GLTFMaterialsClearcoatExtension(parser));

    this.register(parser => new GLTFTextureBasisUExtension(parser));

    this.register(parser => new GLTFTextureWebPExtension(parser));

    this.register(parser => new GLTFMaterialsSheenExtension(parser));

    this.register(parser => new GLTFMaterialsTransmissionExtension(parser));

    this.register(parser => new GLTFMaterialsVolumeExtension(parser));

    this.register(parser => new GLTFMaterialsIorExtension(parser));

    this.register(parser => new GLTFMaterialsSpecularExtension(parser));

    this.register(parser => new GLTFLightsExtension(parser));

    this.register(parser => new GLTFMeshoptCompression(parser));
  }

  load(url, onLoad, onProgress, onError) {
    const scope = this;

    let resourcePath;

    if (this.resourcePath !== '') {
      ({ resourcePath } = this.resourcePath);
    } else if (this.path !== '') {
      resourcePath = this.path;
    } else {
      resourcePath = LoaderUtils.extractUrlBase(url);
    }

    // Tells the LoadingManager to track an extra item, which resolves after
    // the model is fully loaded. This means the count of items loaded will
    // be incorrect, but ensures manager.onLoad() does not fire early.
    this.manager.itemStart(url);

    const _onError = e => {
      if (onError) {
        onError(e);
      } else {
        console.error(e);
      }
      scope.manager.itemError(url);
      scope.manager.itemEnd(url);
    };

    const loader = new FileLoader(this.manager);

    loader.setPath(this.path);

    loader.load(
      url,
      data => {
        try {
          this.parse(
            data,
            resourcePath,
            gltf => {
              onLoad(gltf);
              this.manager.itemEnd(url);
            },
            _onError
          );
        } catch (e) {
          _onError(e);
        }
      },
      onProgress,
      _onError
    );
  }

  setDRACOLoader(dracoLoader) {
    this.dracoLoader = dracoLoader;
    return this;
  }

  setDDSLoader() {
    throw new Error(
      'THREE.GLTFLoader: "MSFT_texture_dds" no longer supported. Please update to "KHR_texture_basisu".'
    );
  }

  setKTX2Loader(ktx2Loader) {
    this.ktx2Loader = ktx2Loader;
    return this;
  }

  setMeshoptDecoder(meshoptDecoder) {
    this.meshoptDecoder = meshoptDecoder;
    return this;
  }

  register(callback) {
    if (this.pluginCallbacks.indexOf(callback) === -1) {
      this.pluginCallbacks.push(callback);
    }
    return this;
  }

  unregister(callback) {
    if (this.pluginCallbacks.indexOf(callback) !== -1) {
      this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(callback), 1);
    }
    return this;
  }

  parse(data, path, onLoad, onError) {
    let content;
    const extensions = {};
    const plugins = {};
    if (typeof data === 'string') {
      content = data;
    } else {
      const magic = LoaderUtils.decodeText(new Uint8Array(data, 0, 4));
      if (magic === BINARY_EXTENSION_HEADER_MAGIC) {
        try {
          extensions[EXTENSIONS.KHR_BINARY_GLTF] = new GLTFBinaryExtension(
            data
          );
        } catch (error) {
          if (onError) onError(error);
          return;
        }

        ({ content } = extensions[EXTENSIONS.KHR_BINARY_GLTF]);
      } else {
        content = LoaderUtils.decodeText(new Uint8Array(data));
      }
    }
    const json = JSON.parse(content);

    if (json.asset === undefined || json.asset.version[0] < 2) {
      if (onError)
        onError(
          new Error(
            'THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported.'
          )
        );
      return;
    }

    const parser = new GLTFParser(json, {
      path: path || this.resourcePath || '',
      requestHeader: this.requestHeader,
      manager: this.manager,
      ktx2Loader: this.ktx2Loader,
      meshoptDecoder: this.meshoptDecoder
    });

    parser.fileLoader.setRequestHeader(this.requestHeader);

    for (let i = 0; i < this.pluginCallbacks.length; i++) {
      const plugin = this.pluginCallbacks[i](parser);
      plugins[plugin.name] = plugin;
      // Workaround to avoid determining as unknown extension
      // in addUnknownExtensionsToUserData().
      // Remove this workaround if we move all the existing
      // extension handlers to plugin system
      extensions[plugin.name] = true;
    }

    if (json.extensionsUsed) {
      for (let i = 0; i < json.extensionsUsed.length; ++i) {
        const extensionName = json.extensionsUsed[i];
        const extensionsRequired = json.extensionsRequired || [];

        switch (extensionName) {
          case EXTENSIONS.KHR_MATERIALS_UNLIT:
            extensions[extensionName] = new GLTFMaterialsUnlitExtension();
            break;

          case EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS:
            extensions[
              extensionName
            ] = new GLTFMaterialsPbrSpecularGlossinessExtension();
            break;

          case EXTENSIONS.KHR_DRACO_MESH_COMPRESSION:
            extensions[extensionName] = new GLTFDracoMeshCompressionExtension(
              json,
              this.dracoLoader
            );
            break;

          case EXTENSIONS.KHR_TEXTURE_TRANSFORM:
            extensions[extensionName] = new GLTFTextureTransformExtension();
            break;

          case EXTENSIONS.KHR_MESH_QUANTIZATION:
            extensions[extensionName] = new GLTFMeshQuantizationExtension();
            break;

          default:
            if (
              extensionsRequired.indexOf(extensionName) >= 0 &&
              plugins[extensionName] === undefined
            ) {
              console.warn(
                `THREE.GLTFLoader: Unknown extension ${extensionName}.`
              );
            }
        }
      }
    }

    parser.setExtensions(extensions);
    parser.setPlugins(plugins);
    parser.parse(onLoad, onError);
  }
}

export { GLTFLoader };
