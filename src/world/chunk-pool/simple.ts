import { CHUNK_HEIGHT, CHUNK_WIDTH } from "../constants";
import { Chunk } from "../chunk";
import { ChunkBuilder } from "../chunk-builder";
import { IChunkPool, createChunkCallback } from "./chunk-pool.interface";

// t
// function* buildWord() {
//   const noise2D = createNoise2D();
export class ChunkPoolSimple implements IChunkPool {
  constructor(
    private chunks: Map<string, Chunk> = new Map(),
  ) { }
  init(callback: createChunkCallback) {
    // console.time("Creating Chunks Time");
    let n = 4;
    let keys = []
    for (let x = 0; x < n; x++){
      for (let y = 0; y < n; y++) {
        keys.push(this.createChunkData([x,0,y]))
      }
    }

    for (const key of keys) {
      const chunk = this.getChunk(key)!
      this.createChunkGeometry(chunk, callback)
    }
      // for (let y = 0; y < n; y++){
        // for (let h = -3; h < 3; h++)
      // }
    
    // console.timeEnd("Creating Chunks Time");
    
  }
  getChunk(key: string): Chunk | undefined {
    return this.chunks.get(key);
  }

  list(): IterableIterator<Chunk> {
    return this.chunks.values();
  }
  createChunkData(pos: number[]): string {
    const chunk = ChunkBuilder.create(pos);
    this.chunks.set(chunk.generateKey(), chunk);
    return chunk.generateKey()
  }
  createChunkGeometry(chunk: Chunk, callback: createChunkCallback) {
    callback(Chunk.generateMesh(chunk.generateGeometry()))
  }
  createChunk(pos: number[], callback: createChunkCallback) {
    const chunk = ChunkBuilder.create(pos);
    this.chunks.set(chunk.generateKey(), chunk);
    callback(Chunk.generateMesh(chunk.generateGeometry()))
  }
}
