import { Cache } from './Cache.js';
import { Loader } from './Loader.js';
import { createElementNS } from '../utils.js';

class ImageLoader extends Loader {

	constructor( manager ) {

		super( manager );

	}

	load( url, onLoad, onProgress, onError ) {

		if ( this.path !== undefined ) url = this.path + url;

		url = this.manager.resolveURL( url );

		const scope = this;

		const cached = Cache.get( url );

		if ( cached !== undefined ) {

			scope.manager.itemStart( url );

			setTimeout( function () {

				if ( onLoad ) onLoad( cached );

				scope.manager.itemEnd( url );

			}, 0 );

			return cached;

		}

    const image = my.global.canvas.createImage();
      image.onload = () => {
        image.onload = () => {};
        image.onerror = () => {};
        Cache.add(url, image);
        if (onLoad) onLoad(image);
        this.manager.itemEnd(url);
      };

      image.onerror = event => {
        image.onload = () => {};
        image.onerror = () => {};
        if (onError) onError(event);
        this.manager.itemEnd(url);
        this.manager.itemError(url);
      };

    this.manager.itemStart(url);
    image.src = url;
    return image;

	}

}


export { ImageLoader };
