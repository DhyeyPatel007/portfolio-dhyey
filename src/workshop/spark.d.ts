// Types for @sparkjsdev/spark (the package ships no TS declarations).
declare module '@sparkjsdev/spark' {
  import * as THREE from 'three';
  export class SplatMesh extends THREE.Mesh {
    constructor(options: { url: string });
  }
}
