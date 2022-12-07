import { createNoise2D, createNoise3D, NoiseFunction2D, NoiseFunction3D } from 'simplex-noise';
import { BlockType } from './block';
import { Chunk } from './chunk';
import { CHUNK_WIDTH } from './constants';
import alea from 'alea';
const noise_1: NoiseFunction2D = createNoise2D(alea('1'));
const noise_2: NoiseFunction2D = createNoise2D(alea('2'));
const noise_3: NoiseFunction2D = createNoise2D(alea('3'));
const tree_noise: NoiseFunction2D = createNoise2D(alea('4'));
const noise_3d: NoiseFunction3D = createNoise3D(alea('5'));

export class ChunkBuilder{

  // private fbmParams: any = {

  // }
  // fbm(x: number, y: number): number {

  // }
  static create(pos: number[]) {
    const chunk = new Chunk(
      CHUNK_WIDTH,
      pos
    )
    const offset = pos.map((x) => (x * CHUNK_WIDTH));
    const scale = 100;
    for (let y = 0; y < CHUNK_WIDTH; ++y) {
      for (let z = 0; z < CHUNK_WIDTH; ++z) {
        for (let x = 0; x < CHUNK_WIDTH; ++x) {
          const _x = x + offset[0];
          const _y = y + offset[1];
          const _z = z + offset[2];
          const n = noise_1(_x / scale, _z / scale);
          const height = n * 0.5 + 0.5;
          const random = noise_2(_x / scale, _z / scale) * 0.5 + 0.5;
          // const height = 0.5

          let narrow = 0.25;
          let rscale = 8;
          let river = Math.max(0, (0.5 - Math.abs(n - 0.5)) -
          narrow) * rscale

          // let river = rscale * (0.10 - Math.abs(0.1 - n));
          if (_y < height * 10 - river ) {
            if (_y >= height * 10) {
              chunk.setVoxel(x, y, z, BlockType.rock)
            } else {
              if (_y < 2) {
                chunk.setVoxel(x, y, z, BlockType.sand);
              } else {
                const treeValue = tree_noise(_x, _z);
                if (treeValue > 0.90) {
                  const treeHeight = y + 1;
                  const leaves = random > 0.8 ? BlockType.purpleLeaves : BlockType.leaves;
                  for (let lh = treeHeight; lh <= treeHeight + 4; lh++)
                    chunk.setVoxel(x, lh, z, BlockType.wood)
                  
                  for (let lx = x - 2; lx <= x + 2; lx++)
                    for (let lz = z - 2; lz <= z + 2; lz++)
                     chunk.setVoxel(lx, treeHeight + 5, lz, leaves)
                }
                
                chunk.setVoxel(x, y, z, BlockType.dirt);
              }
            }
              
            
          } 
              
          // const rocks = noise_3d(_x / rockScale, _y / rockScale, _z / rockScale) * 0.5 + 0.5;
          // if (rocks > 0.8) {
          //   if( _y < 1) {
          //     chunk.setVoxel(x, y, z, BlockType.rock);
          //   } else {
          //     chunk.setVoxel(x, y, z, BlockType.air);
          //   }
          // } 
       
          
        }
      }
    }

    // chunk.setVoxel(CHUNK_WIDTH/2, 5, CHUNK_WIDTH/2, 1);
    // chunk.setVoxel(CHUNK_WIDTH/2, 6, CHUNK_WIDTH/2, 1);
    // chunk.setVoxel(0, 5, CHUNK_WIDTH/2, 1);
    // chunk.setVoxel(0, 6, CHUNK_WIDTH/2, 1);
    // chunk.setVoxel(0, 7, CHUNK_WIDTH/2, 1);
    // chunk.setVoxel(0, 8, CHUNK_WIDTH/2, 1);
    // chunk.setVoxel(0, 9, CHUNK_WIDTH/2, 1);
    // chunk.setVoxel(0, 5, CHUNK_WIDTH/2 +1, 1);
    // chunk.setVoxel(1, 5, CHUNK_WIDTH/2 +1, 1);
    // chunk.setVoxel(2, 4, CHUNK_WIDTH/2 +1, 0);
    // chunk.setVoxel(3, 4, CHUNK_WIDTH/2 +1, 0);
    // chunk.setVoxel(4, 4, CHUNK_WIDTH / 2 + 1, 0);
    // chunk.setVoxel(4, 4, CHUNK_WIDTH/2 , 0);
    // chunk.setVoxel(4, 4, CHUNK_WIDTH/2 -1, 0);
    // chunk.setVoxel(3, 4, CHUNK_WIDTH/2 -1, 0);
    return chunk;
  }
}