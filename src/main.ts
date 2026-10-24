
import * as THREE from "three";
import { Game } from "./engine/game";
import { CHUNK_WIDTH } from "./world/constants";
import { chunkPool } from "./world/chunk-pool/";
class Main extends Game {
  public entities: any[] = []
  public chunksCreator: any;
  public oldPos: any;

  addChunkToScene(geometry: any) {
    console.log(geometry)
    this.graphics.scene.add(geometry)
  }

  constructor() {
    super();
    this.loadBackground();
    // chunkPool.init();
    chunkPool.init(this.addChunkToScene.bind(this));
    // this.chunksCreator = buildWord();

    this.graphics.scene.add(
      new THREE.Mesh(new THREE.SphereGeometry(1),
      new THREE.MeshLambertMaterial({ color: 'red' }))
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
  
      const a = 2;
      for (let x = -a; x < a; x++) {
        for (let z = -a; z < a; z++) {
          const newKey = [key[0] + x * CHUNK_WIDTH, 0, key[2] + z * CHUNK_WIDTH];
          const chunk = chunkPool.getChunk(newKey.join('_'))
          if (!chunk) {
            chunkPool.createChunk([
              key[0] / CHUNK_WIDTH + x,
              0,
              key[2] / CHUNK_WIDTH + z
            ], this.addChunkToScene.bind(this));
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