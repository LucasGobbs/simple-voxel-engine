
import * as THREE from "three";
import { Game } from "./engine/game";
// import { VoxelWorld } from "./world/voxel";
import { createNoise2D } from 'simplex-noise';
import {chunkPool} from './world/chunk_pool'
import { WorkerPool } from "./utils/worker";
import { CHUNK_WIDTH } from "./world/constants";
// import { ChunkBuilder } from "./world/chunk_builder";
import { chunkPoolThreaded } from "./world/chunk_pool_threaded";
// function* buildWord() {
//   const noise2D = createNoise2D();

//   const buildChunk = (cellSize: number, offset: number[]) => {
//     const scale = 520;
//     const scaleHeight = 50;
//     const world = new VoxelWorld(cellSize, offset.map((x) => x * cellSize));
//     for (let y = 0; y < cellSize; ++y) {
//       for (let z = 0; z < cellSize; ++z) {
//         for (let x = 0; x < cellSize; ++x) {
//           const _x = x + (offset[0] * cellSize);
//           const _z = z + (offset[2] * cellSize);
//           // const height = 5;
//           const height = noise2D(_x/scale, _z/scale) * scaleHeight
//           // const height = (Math.sin(x / cellSize * Math.PI * 2) + Math.sin(z / cellSize * Math.PI * 3)) * (cellSize / 10) + (cellSize / 2);
//           if (y + (offset[1] * cellSize) < height) {
//             world.setVoxel(x, y, z, 1);
//           }

//         }
//       }
//     }
    // world.setVoxel(cellSize/2, 5, cellSize/2, 1);
    // world.setVoxel(cellSize/2, 6, cellSize/2, 1);
    // world.setVoxel(0, 5, cellSize/2, 1);
    // world.setVoxel(0, 6, cellSize/2, 1);
    // world.setVoxel(0, 5, cellSize/2 +1, 1);
    // world.setVoxel(1, 5, cellSize/2 +1, 1);
    // world.setVoxel(7, 4, cellSize/2 +1, 0);

  //   return world;
  // }
//   const world = 5;
//   const worldHeight = 3;
//   // yield buildChunk(10, [0,0,0]).generateGeometry()

//     for (let z = -world; z < world; ++z) {
//       for (let x = -world; x < world; ++x) {
//         for (let y = 0 ; y > -worldHeight; --y) {

//         yield buildChunk(50, [x, y, z]).generateGeometry()
//       }
//     }
//   }
// }

// let workerPool = new WorkerPool('src/utils/worker_test.ts');
// console.log("Teste")
// workerPool.enqueue([1], (result: any) => console.log('1: ', result));
// workerPool.enqueue([1], (result: any) => console.log('2: ', result));
// workerPool.enqueue([1], (result: any) => console.log('3: ', result));
// workerPool.enqueue([1], (result: any) => console.log('4: ', result));
// workerPool.enqueue([1], (result: any) => console.log('5: ', result));
class Main extends Game {
  public entities: any[] = []
  public chunksCreator: any;
  public oldPos: any;

  cb(geometry: any) {
    this.graphics.scene.add(geometry)
  }

  constructor() {
    super();
    this.loadBackground();
    chunkPool.init();
    chunkPoolThreaded.init(this.cb.bind(this));
    // this.chunksCreator = buildWord();

    this.graphics.scene.add(
      new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshLambertMaterial({color: 'red'}))
    )
    const axesHelper = new THREE.AxesHelper( 5 );
    this.graphics.scene.add(axesHelper);
    this.oldPos = this.graphics.camera.position.clone();

    // chunkPool.init();

    // console.time("Generating Geometry for chunks")
    // for (const chunk of chunkPool.list()) {
    //   const geometry = chunk.generateGeometry()
    //   this.graphics.scene.add(geometry)
    // }
    // console.timeEnd("Generating Geometry for chunks")

  }

  loadBackground() {
    // const loader = new THREE.CubeTextureLoader();
    // const image = '../resources/posx.jpg'
    // const texture = loader.load([image, image, image, image, image ,image]);
    // this.graphics.Scene.background = texture;
  }

  onStep(timeInSeconds: number) {
    
    timeInSeconds = Math.min(timeInSeconds, 1 / 10.0);
    const pos = this.graphics.camera.position;
   
    if (!pos.equals(this.oldPos)) {
      this.oldPos = pos.clone();
      const key = [
        Math.round(pos.x / CHUNK_WIDTH) * CHUNK_WIDTH,
        0,
        Math.round(pos.z / CHUNK_WIDTH) * CHUNK_WIDTH
      ];
  
      let a = 3;
      for (let x = -a; x < a; x++) {
        for (let z = -a; z < a; z++) {
          const newKey = [key[0] + x * CHUNK_WIDTH, 0, key[2] + z * CHUNK_WIDTH];
          const chunk = chunkPoolThreaded.get(newKey.join('_'))
          if (!chunk) {
            chunkPoolThreaded.createChunk([
              key[0] / CHUNK_WIDTH + x,
              0,
              key[2] / CHUNK_WIDTH + z
            ], this.cb.bind(this));
            // const createdChunk = chunkPool.createChunk([
              // key[0] / CHUNK_WIDTH + x,
              // 0,
              // key[2] / CHUNK_WIDTH + z
            // ]);
            // const geometry = createdChunk.generateGeometry()
            // this.graphics.scene.add(geometry)
          }
        }
        
      }
    }
    
   
    // console.log(chunk);
    // const chunk = this.chunksCreator.next();
    // if (!chunk.done) 
    //   this.graphics.scene.add(chunk.value)
      
    // if(this.entities[0]){}
    // this._StepEntities(timeInSeconds);
  }
}

const app = new Main();