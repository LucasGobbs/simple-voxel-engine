import { IChunkPool } from "./chunk-pool.interface";
import { ChunkPoolSimple } from "./simple";
import { ChunkPoolThreaded } from "./threaded";

export const chunkPool: IChunkPool = new ChunkPoolSimple();