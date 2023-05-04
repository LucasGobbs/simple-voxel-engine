// @ts-check
/// <reference no-default-lib="true"/>
/// <reference lib="ES2022" />
/// <reference lib="webworker" />

// Default type of `self` is `WorkerGlobalScope & typeof globalThis`
// https://github.com/microsoft/TypeScript/issues/14877
declare var self: ServiceWorkerGlobalScope;
import { chunkPool } from ".";
import { ChunkBuilder } from "../chunk-builder";

self.addEventListener('message', ({ data: pos }: any) => {
  console.log("A")
  const chunk = ChunkBuilder.create(pos);
  const geometryData = chunk.generateGeometry()
  console.log(pos)
  console.log(chunkPool.getChunk('0_0_0'))
  const rt = {
    key: chunk.generateKey(),
    geometryData: geometryData,
    chunkData: chunk.getBlocks()
  }

  postMessage(rt);
});

export default null;