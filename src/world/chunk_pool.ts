import { CHUNK_HEIGHT, CHUNK_WIDTH } from "./constants";
import { Chunk } from "./chunk";
import { ChunkBuilder } from "./chunk_builder";

// t
// function* buildWord() {
//   const noise2D = createNoise2D();
class ChunkPool {
  constructor(
    private chunks: Map<string, Chunk> = new Map(),
    private chunkBuilder: ChunkBuilder = new ChunkBuilder()
  ) { }
  init() {
    // console.time("Creating Chunks Time");
    // let n = 9;
    // for (let x = 0; x < n; x++)
    //   for (let y = 0; y < n; y++){
    //     for (let h = -3; h < 3; h++)
    //       this.createChunk([x,h,y])
    //   }
    
    // console.timeEnd("Creating Chunks Time");
    
  }
  get(key: string): Chunk | undefined {
    return this.chunks.get(key);
  }

  list(): IterableIterator<Chunk> {
    return this.chunks.values();
  }

  createChunk(pos: number[]): Chunk {
    const chunk = ChunkBuilder.create(pos);
    this.chunks.set(chunk.generateKey(), chunk);
    return chunk
  }
}

export const chunkPool = new ChunkPool()