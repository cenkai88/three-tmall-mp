/**
 * AABBox = {
 *  min: [-1,-1,-1],
 *  max: [1,1,1]
 * };
 *
 * Sphere = {
 *  center: [0,0,0],
 *  radius: 1
 * };
 */
/**
 * Check whether the boxes intersect.
 * @param boxA - The first box to check
 * @param boxB - The second box to check
 * @returns True if the boxes intersect, false otherwise
 */
export declare function intersectBox2Box(boxA: any, boxB: any): boolean;
/**
 * Check whether the spheres intersect.
 * @param sphereA - The first sphere to check
 * @param sphereB - The second sphere to check
 * @returns True if the spheres intersect, false otherwise
 */
export declare function intersectSphere2Sphere(sphereA: any, sphereB: any): boolean;
/**
 * Check whether the sphere and the box intersect.
 * @param sphere - The sphere to check
 * @param box - The box to check
 * @returns True if the sphere and the box intersect, false otherwise
 */
export declare function intersectSphere2Box(sphere: any, box: any): boolean;
