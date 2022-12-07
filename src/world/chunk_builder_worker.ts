// @ts-check
/// <reference no-default-lib="true"/>
/// <reference lib="ES2022" />
/// <reference lib="webworker" />

// Default type of `self` is `WorkerGlobalScope & typeof globalThis`
// https://github.com/microsoft/TypeScript/issues/14877
declare var self: ServiceWorkerGlobalScope;
import { ChunkBuilder } from "./chunk_builder";
import { chunkPoolThreaded } from "./chunk_pool_threaded";
self.addEventListener('message', ({ data }: any) => {
  const pos = data;
  console.log(chunkPoolThreaded.getId())
  const chunk = ChunkBuilder.create(pos);
  const geometryData = chunk.generateGeometry()
  const rt = {
    key: chunk.generateKey(),
    geometryData: geometryData,
    chunkData: chunk.getBlocks()
  }
  postMessage(rt);
});

export default null;