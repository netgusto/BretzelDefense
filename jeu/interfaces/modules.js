declare function keyboardjs(): void;

declare module 'gl-matrix' {
    declare var vec2: {
        normalize(): { x: number, y: number }
    };
};

declare var performance: {
    now(): number;
};

declare module 'perfnow' { }

declare class Vector { }

declare class Box {
    toPolygon(): Polygon;
}

declare class Polygon { }

declare module 'sat' {
    declare var Vector: typeof Vector;
    declare var Box: typeof Box;
    declare var Polygon: typeof Polygon;

    declare function testPolygonPolygon(a: Polygon, b: Polygon) : boolean;
}
