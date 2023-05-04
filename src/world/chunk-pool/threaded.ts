import { CHUNK_HEIGHT, CHUNK_WIDTH } from "../constants";
import { Chunk } from "../chunk";
import { WorkerPool } from "../../utils/worker-pool";
import { IChunkPool } from "./chunk-pool.interface";

export class ChunkPoolThreaded implements IChunkPool {
  private id: number;
  constructor(
    private chunks: Map<string, Chunk> = new Map(),
    private pool: WorkerPool = new WorkerPool('./src/world/chunk-pool/chunk-builder.worker.ts'),
  ) {
    this.id = Math.floor(Math.random() * 1000);
  }
  getId() { return this.id }

  init(callBack: any) {
    let n = 4;
    for (let x = 0; x < n; x++)
      for (let y = 0; y < n; y++) {
          this.createChunk([x, 0, y], callBack)
      }

  }
  getChunk(key: string): Chunk | undefined {
    return this.chunks.get(key);
  }

  list(): IterableIterator<Chunk> {
    return this.chunks.values();
  }

  createChunk(pos: number[], callback: any) {
    const reservedChunk = new Chunk(CHUNK_WIDTH, pos, true);
    this.chunks.set(reservedChunk.generateKey(), reservedChunk);

    this.pool.pushWork({
      data: pos, 
      callback: (data: any) => {
        const { key, geometryData, chunkData } = data
        this.chunks.set(key, Chunk.fromData(chunkData, CHUNK_WIDTH));
        callback(Chunk.generateMesh(geometryData));
      }
    });
  }
}

