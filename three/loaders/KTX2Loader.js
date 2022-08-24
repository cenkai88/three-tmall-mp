/**
 * Loader for KTX 2.0 GPU Texture containers.
 *
 * KTX 2.0 is a container format for various GPU texture formats. The loader
 * supports Basis Universal GPU textures, which can be quickly transcoded to
 * a wide variety of GPU texture compression formats. While KTX 2.0 also allows
 * other hardware-specific formats, this loader does not yet parse them.
 *
 * References:
 * - KTX: http://github.khronos.org/KTX-Specification/
 * - DFD: https://www.khronos.org/registry/DataFormat/specs/1.3/dataformat.1.3.html#basicdescriptor
 */
import { CompressedTexture } from '../textures/CompressedTexture';
import { FileLoader } from './FileLoader';
import { Loader } from './Loader';
import {
  sRGBEncoding,
  LinearFilter,
  LinearMipmapLinearFilter,
  UnsignedByteType,
  LinearEncoding
} from '../constants.js';

const KTX2TransferSRGB = 2;
const KTX2_ALPHA_PREMULTIPLIED = 1;
const _taskCache = new WeakMap();

class KTX2Loader extends Loader {
  constructor(manager) {
    super(manager);

    this.transcoderBinary = null;
    this.transcoderPending = null;

    this.workerLimit = 1;
    this.workerPool = [];
    this.workerNextTaskID = 1;
    this.workerConfig = null;
  }

  detectSupport(renderer) {
    this.workerConfig = {
      astcSupported: renderer.extensions.has('WEBGL_compressed_texture_astc'),
      etc1Supported: renderer.extensions.has('WEBGL_compressed_texture_etc1'),
      etc2Supported: renderer.extensions.has('WEBGL_compressed_texture_etc'),
      dxtSupported: renderer.extensions.has('WEBGL_compressed_texture_s3tc'),
      bptcSupported: renderer.extensions.has('EXT_texture_compression_bptc'),
      pvrtcSupported:
        renderer.extensions.has('WEBGL_compressed_texture_pvrtc') ||
        renderer.extensions.has('WEBKIT_WEBGL_compressed_texture_pvrtc')
    };

    return this;
  }

  load(url, onLoad, onProgress, onError) {
    if (this.workerConfig === null) {
      throw new Error(
        'THREE.KTX2Loader: Missing initialization with `.detectSupport( renderer )`.'
      );
    }

    const loader = new FileLoader(this.manager);
    const texture = new CompressedTexture();

    const processBuffer = buffer => {
      // Check for an existing task using this buffer. A transferred buffer cannot be transferred
      // again from this thread.
      if (_taskCache.has(buffer)) {
        const cachedTask = _taskCache.get(buffer);
        return cachedTask.promise.then(onLoad).catch(onError);
      }

      this._createTexture(buffer)
        .then(function(_texture) {
          texture.copy(_texture);
          texture.needsUpdate = true;

          if (onLoad) onLoad(texture);
        })
        .catch(onError);
    };

    if (typeof url === 'string')
      loader.load(url, processBuffer, onProgress, onError);
    else processBuffer(url);

    return texture;
  }

  _createTextureFrom(transcodeResult) {
    const {
      mipmaps,
      width,
      height,
      format,
      type,
      error,
      dfdTransferFn,
      dfdFlags
    } = transcodeResult;
    if (type === 'error') return Promise.reject(error);
    mipmaps.forEach(item => (item.data = new Uint8Array(item.data)));

    const texture = new CompressedTexture(
      mipmaps,
      width,
      height,
      format,
      UnsignedByteType
    );
    texture.minFilter =
      mipmaps.length === 1 ? LinearFilter : LinearMipmapLinearFilter;
    texture.magFilter = LinearFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
    texture.encoding =
      dfdTransferFn === KTX2TransferSRGB ? sRGBEncoding : LinearEncoding;
    texture.premultiplyAlpha = !!(dfdFlags & KTX2_ALPHA_PREMULTIPLIED);

    return texture;
  }

  /**
   * @param {ArrayBuffer} buffer
   * @param {object?} config
   * @return {Promise<CompressedTexture>}
   */
  _createTexture(buffer, config = {}) {
    let worker;
    let taskID;

    const taskConfig = config;
    let taskCost = 0;

    const texturePending = this._allocateWorker(taskCost)
      .then(_worker => {
        worker = _worker;
        taskID = this.workerNextTaskID++;

        return new Promise((resolve, reject) => {
          worker._callbacks[taskID] = { resolve, reject };
          worker.postMessage({
            type: 'transcode',
            id: taskID,
            buffers: [buffer],
            taskConfig
          });
        });
      })
      .then(message => this._createTextureFrom(message));

    // Cache the task result.
    // console.log(buffer);
    // _taskCache.set(buffer, { promise: texturePending });
    return texturePending;
  }

  async _allocateWorker(taskCost) {
    if (this.workerPool.length < this.workerLimit) {
      const worker = my.createWorker('three/worker/index.js');
      console.log(my.createWorker, worker, worker.postMessage);
      worker._callbacks = {};
      worker._taskLoad = 0;
      worker.postMessage({
        type: 'init',
        config: this.workerConfig,
        transcoderBinary: this.transcoderBinary
      });

      worker.onMessage(function(message) {
        console.log(message);
        switch (message.type) {
          case 'transcode':
            worker._callbacks[message.id].resolve(message);
            break;

          case 'error':
            worker._callbacks[message.id].reject(message);
            break;

          default:
            console.error(
              'THREE.BasisTextureLoader: Unexpected message, "' +
                message.type +
                '"'
            );
        }
      });
      this.workerPool.push(worker);
    } else {
      this.workerPool.sort(function(a, b) {
        return a._taskLoad > b._taskLoad ? -1 : 1;
      });
    }

    const worker = this.workerPool[this.workerPool.length - 1];
    worker._taskLoad += taskCost;
    return worker;
  }

  dispose() {
    this.workerPool.forEach(item => item.dispose && item.dispose());
    this.workerPool = [];
    return this;
  }
}

export { KTX2Loader };
