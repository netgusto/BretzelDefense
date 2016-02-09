declare class SystemRenderer {
    view: HTMLCanvasElement;
    width: number;
    height: number;
    constructor(system: string, width: ?number, height: ?number, options: ?Object) : void;

    render(object: DisplayObject) : void
}

declare class DisplayObject {

    x: number;
    y: number;

    position: Point;
    pivot: Point;
    scale: Point;
    rotation: number;
    interactive: boolean;

    worldTransform: Matrix;

    getBounds(matrix: ?Matrix) : Rectangle;

    on(event: string, cbk: Function) : DisplayObject;
}

declare class WebGLRenderer extends SystemRenderer { }
declare class CanvasRenderer extends SystemRenderer { }

declare class Container extends DisplayObject {
    addChild(child: DisplayObject) : DisplayObject;
}

declare class Graphics extends Container { }

declare class Point {
    x: number;
    y: number;
    set(x: number, y: ?number) : void;
}

declare class BaseTexture {
    realWidth: number;
    realHeight: number;
    static fromImage(imageUrl: string, crossorigin: ?boolean, scaleMode: ?number) : BaseTexture;
}

declare class Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

declare class Polygon {
    constructor(points: Array<number>): void;
}

declare class Matrix {
  apply(pos: { x: number, y: number }|Point, newpos: ?Point) : Point;
}

declare class Texture {
    constructor(baseTexture: BaseTexture, frame: ?Rectangle, crop: ?Rectangle, trim: ?Rectangle, rotate: ?boolean) : void;
    static fromImage(imageUrl: string, crossorigin: ?boolean, scaleMode: ?number) : Texture;
}

declare class Sprite extends Container {
    anchor: Point;
    tint: number;

    width: number;
    height: number;
}

declare class Text extends Sprite {
  text: string;
}

declare class TilingSprite extends Sprite {
    tileScale: Point;
    tilePosition: Point;

    constructor(texture: Texture, width: number, height: number) : void;
}

declare class MovieClip extends Sprite {
    animationSpeed: number;
    constructor(textures: Array<Texture>) : void;

    play() : void;
}

declare var extras : {
    TilingSprite: typeof TilingSprite;
    MovieClip: typeof MovieClip;
};

declare function autoDetectRenderer(width: number, height: number, options: ?Object, noWebGL: ?boolean): WebGLRenderer|CanvasRenderer;

declare class ResourceLoader { }

declare class Loader extends ResourceLoader {
    constructor(baseUrl: string, concurency: ?number) : void;

    add(name: string, url: string) : void;
    once(event: string, cbk: Function) : void;
    load() : void;
}

declare var SCALE_MODES:  {
  NEAREST: string
};

declare module 'pixi.js' {
    declare var autoDetectRenderer: typeof autoDetectRenderer;
    declare var Container: typeof Container;
    declare var Graphics: typeof Graphics;
    declare var BaseTexture: typeof BaseTexture;
    declare var Sprite: typeof Sprite;
    declare var Text: typeof Text;
    declare var Polygon: typeof Polygon;
    declare var Texture: typeof Texture;
    declare var extras: typeof extras;
    declare var Rectangle: typeof Rectangle;
    declare var loader: Loader;
    declare var SCALE_MODES: typeof SCALE_MODES;
};
