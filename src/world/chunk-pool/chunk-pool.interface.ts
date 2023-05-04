import { Chunk } from "../chunk"

export type createChunkCallback = (geometryData: any) => any
export interface IChunkPool{ 
  init: (callback: createChunkCallback) => void
  createChunk: (pos: number[], callback: createChunkCallback) => void
  getChunk: (key: string) => Chunk | undefined
}