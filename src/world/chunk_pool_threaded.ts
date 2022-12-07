import { CHUNK_HEIGHT, CHUNK_WIDTH } from "./constants";
import { Chunk } from "./chunk";
import { ChunkBuilder } from "./chunk_builder";
import { WorkerPool } from "../utils/worker";

// t
// function* buildWord() {
//   const noise2D = createNoise2D();
class ChunkPoolThreaded {
  private id: number;
  constructor(
    private chunks: Map<string, Chunk> = new Map(),
    // private chunkBuilder: ChunkBuilder = new ChunkBuilder(),
    private pool: WorkerPool = new WorkerPool(
      './src/world/chunk_builder_worker.ts', 5),
  ) {
    this.id = Math.floor(Math.random() * 1000);
  }
  getId(){ return this.id}
  init(callBack: any) {
    // console.time("Creating Chunks Time");
    let n = 2;
    for (let x = 0; x < n; x++)
      for (let y = 0; y < n; y++){
        for (let h = -3; h < 3; h++)
          this.createChunk([x,h,y], callBack)
      }
    
    // console.timeEnd("Creating Chunks Time");
    
  }
  get(key: string): Chunk | undefined {
    return this.chunks.get(key);
  }

  list(): IterableIterator<Chunk> {
    return this.chunks.values();
  }

  createChunk(pos: number[], callback: any) {
    const reservedChunk = new Chunk(CHUNK_WIDTH, pos, true);
    this.chunks.set(reservedChunk.generateKey(), reservedChunk);

    this.pool.enqueue(pos, (data: any) => {
      const { key, geometryData, chunkData } = data
      this.chunks.set(key, Chunk.fromData(chunkData, CHUNK_WIDTH));
      callback(Chunk.generateMesh(geometryData));
    });
  }
}

export const chunkPoolThreaded = new ChunkPoolThreaded()
