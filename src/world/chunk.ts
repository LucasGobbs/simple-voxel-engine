import * as THREE from 'three'
import { createNoise2D } from 'simplex-noise';
import alea from 'alea';
import { Arr } from '../utils/array';
import { BlockType } from './block';
import { Float16BufferAttribute } from 'three';
import { CHUNK_WIDTH } from './constants';
import { chunkPool } from './chunk-pool'

let aoIntensity = 0.9;
let aoTable = [0.7, 0.4, 0.2, 0.0].map((x) => x * aoIntensity);

const clamp = (value: number, a = 0, b = 1) =>
  value > b 
    ? b
    : (value < a) ? a : value
const aos = [
  { // H
    n: 0,
    _pos: [0, 1, 1],
    _side1: [-1, 1, 0],
    _side2: [0, 1, 1],
    _corner: [-1, 1, 1]
  },
  { // E
    n: 1,
    _pos: [0, 1, 0],
    _side1: [-1, 1, 0],
    _side2: [0, 1, -1],
    _corner: [-1, 1, -1]
  },
  { // G
    n: 2,
    _pos: [1, 1, 1],
    _side1: [1, 1, 0],
    _side2: [0, 1, 1],
    _corner: [1, 1, 1]
  },
  { // F
    n: 3,
    _pos: [1, 1, 0],
    _side1: [1, 1, 0],
    _side2: [0, 1, -1],
    _corner: [1, 1, -1]
  },
  { // D
    n: 4,
    _pos: [0, 0, 1],
    _side1: [0,0, 1],
    _side2: [-1, 0, 1],
    _corner: [0, 0, 0]
  },
  { // A
    n: 5,
    _pos: [0, 0, 0],
    _side1: [0, 0, -1],
    _side2: [-1, 0, -1],
    _corner: [0, 0, 0]
  },
  { // B
    n: 6,
    _pos: [1, 0, 0],
    _side1: [0, 0, -1],
    _side2: [1, 0, -1],
    _corner: [0, 0, 0]
  },
  { // C
    n: 7,
    _pos: [1, 0, 1],
    _side1: [0, 0, 1],
    _side2: [1, 0, 1],
    _corner: [0, 0, 0]
  },
]

const aoDirs: any = {
  //! +Y
  '010': { 
    '010': [2, [0, 1, -1], [-1, 1, 0], [-1, 1, -1]],
    '110': [4, [0, 1, -1], [1, 1, 0], [1, 1, -1]],
    '011': [1, [0, 1, 1], [-1, 1, 0], [-1, 1, 1]],
    '111': [3, [0, 1, 1], [1, 1, 0], [1, 1, 1]]
  },
  //! -Y
  '0-10': { 
    '101': [1, [0, -1, 1], [-1, -1, 0], [-1, -1, 1]],
    '001': [2, [0, -1, 1], [1, -1, 0], [1, -1, 1]],
    '100': [3, [0, -1, -1], [-1, -1, 0], [-1, -1, -1]],
    '000': [4, [0, -1, -1], [1, -1, 0], [1, -1, -1]]
  },
  //! +X
  '100': { 
    '111': [1, [1, 0, 1], [1, 1, 0], [1, 1, 1]],
    '101': [2, [1, 0, 1], [1, -1, 0], [1, -1, 1]],
    '110': [3, [1, 0, -1], [1, 1, 0], [1, 1, -1]],
    '100': [4, [1, 0, -1], [1, -1, 0], [1, -1, -1]]
  },
  //! -X
  '-100': { 
    '010': [1, [-1, 0, -1], [-1, 1, 0], [-1, 1, -1]],
    '000': [2, [-1, 0, -1], [-1, -1, 0], [-1, -1, -1]],
    '011': [3, [-1, 0, 1], [-1, 1, 0], [-1, 1, 1]],
    '001': [4, [-1, 0, 1], [-1, -1, 0], [-1, -1, 1]]
  },
  //! +Z
  '001': {
    '001': [1, [-1, 0, 1], [0, -1, 1], [-1, -1, 1]],
    '101': [2, [1, 0, 1], [0, -1, 1], [1, -1, 1]],
    '011': [3, [-1, 0, 1], [0, 1, 1], [-1, 1, 1]],
    '111': [4, [1, 0, 1], [0, 1, 1], [1, 1, 1]]
  },
  //! -Z
  '00-1': {
    '100': [1, [1, 0, -1], [0, -1, -1], [1, -1, -1]],
    '000': [2, [-1, 0, -1], [0, -1, -1], [-1, -1, -1]],
    '110': [3, [1, 0, -1], [0, 1, -1], [1, 1, -1]],
    '010': [4, [-1, 0, -1], [0, 1, -1], [-1, 1, -1]]
  }
}
const material = new THREE.ShaderMaterial({
  fog: true,
  uniforms: {
    // ...THREE.UniformsLib[ 'fog' ],
    aoIntensity: { value: 0.2 },
    aoTable: {
      value: [0.4, 0.2, 0.1, 0.0]
    },
    fogColor: {
      value: new THREE.Color(0xFF0000)
    },
    fogFar: {
      value: 600
    },
    fogDensity: {
      value: 0.5
    },
    fogNear: {
      value: 0.015
    },
  },
  vertexShader: `
  ${THREE.ShaderChunk[ "fog_pars_vertex" ]}
  attribute float color;
  attribute float aos;
  varying vec3 vPos; 
  varying vec3 vNormal; 
  varying float vColor; 
  varying float vAos; 
  varying vec2 vUvs; 

  void main() {
    vPos = position; 
    vNormal = normal;
    vColor = color;
    vAos = aos;
    vUvs = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition; 
    ${THREE.ShaderChunk[ "fog_vertex" ]}
  }
`,
  fragmentShader:`
  ${THREE.ShaderChunk[ "common" ]}
  ${THREE.ShaderChunk[ "fog_pars_fragment" ]}
  uniform float aoIntensity; 
  uniform vec4 aoTable; 
  varying vec3 vPos;
  varying vec3 vNormal;
  varying float vColor; 
  varying float vAos;
  varying vec2 vUvs; 

  vec3 lerp(vec3 a, vec3 b, float w){
    return a + w*(b-a);
  }
  float lerpN(float a, float b, float w){
    return a + w*(b-a);
  }

  vec3 unpackColor(float colorBits){
    vec3 color;
    color.b = float(int(colorBits)          & 255) / 255.0;
    color.g = float((int(colorBits) >> 8)   & 255) / 255.0;
    color.r = float((int(colorBits) >> 16)  & 255) / 255.0;
    return color;
  }

  vec4 unpackAos(float bits){
    vec4 unpackedAo;
    unpackedAo.w = float((int(bits)      ) & 3);
    unpackedAo.z = float((int(bits)  >> 2) & 3);
    unpackedAo.y = float((int(bits)  >> 4) & 3);
    unpackedAo.x = float((int(bits)  >> 6) & 3);

    return unpackedAo;
  }

  float computeAo(){
    vec4 vAosUnp = unpackAos(vAos);
    vec4 vAosValues = vec4(
      aoTable[int(vAosUnp.x)],
      aoTable[int(vAosUnp.y)],
      aoTable[int(vAosUnp.z)],
      aoTable[int(vAosUnp.w)]
    );
    float ao1 = lerpN(vAosValues.x, vAosValues.z, vUvs.x);
    float ao2 = lerpN(vAosValues.y, vAosValues.w, vUvs.x);
    return lerpN(ao1, ao2, vUvs.y);
  }

  void main() {
    vec3 lightColor = vec3(1.0);
    if( vNormal.x > 0.0 || vNormal.z < 0.0){
      lightColor = vec3(0.87,0.87,0.87);
    } else if( vNormal.x < 0.0 ){
      lightColor = vec3(0.95,0.95,0.95);
    }
    

    vec3 outColor = unpackColor(vColor);
    // float alpha = outColor.z == 0.6 ? 0.6 : 1.0;
    

    float ao = computeAo();
    vec3 aoColor = vec3(
      outColor.r * aoIntensity * 0.8,
      outColor.g * aoIntensity * 0.5,
      outColor.b * aoIntensity * 8.5
    );
    
    gl_FragColor = vec4(lerp(outColor, aoColor, ao) * lightColor, 1.0);

    float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	  gl_FragColor.rgb = mix( gl_FragColor.rgb, 
      mix(vec3(0.15,0.113,0.70), fogColor, fogFactor*0.95), 
      fogFactor );
  }
`,
})
material.transparent = true;
const aoFn = (arr: any) => arr.map((x: number) => (x - x / 25))
function vertexAO(_side1: boolean, _side2: boolean, _corner: boolean) {
  const side1 = _side1 ? 1 : 0;
  const side2 = _side2 ? 1 : 0;
  const corner = _corner ? 1 : 0;
  if(side1 && side2) {
    return 0
  }
  return 3 - (side1 + side2 + corner)
}
const applyTrn = (arr: number[], ops: any[]) => {
  let newArr = [...arr];
  for (const [index, value] of arr.entries()) {
    let sum = 0;
    for(let i = 0; i< ops.length;i++){
      sum += ops[i][index];
    }
    newArr[index] += sum;
  }
  return newArr;
}

const noise2D = createNoise2D(alea('7'));

export class Chunk {
  private cellSliceSize: number;
  private cell: Uint8Array;
  private offset: number[];
  public graphicsId?: number; 
  constructor(private cellSize: number, private pos: number[] = [0,0,0], empty = false) {
    this.offset = pos.map((x) => x * cellSize)
    this.cellSliceSize = cellSize * cellSize;
    this.cell = empty? new Uint8Array(1) :new Uint8Array(cellSize * cellSize * cellSize);
  }

  static fromData(data: Uint8Array, cellSize: number, pos: number[] = [0,0,0]): Chunk {
    const chunk = new Chunk(cellSize, pos);
    chunk.setBlocks(data);
    return chunk;
  }

  getBlocks(): Uint8Array {
    return this.cell;
  }
  setBlocks(data: Uint8Array) {
    this.cell = data;
  }
  generateKey(): string {
    return this.offset[0] + '_' + this.offset[1] + '_' + this.offset[2];
  }
  getOffset(): number[] {
    return this.offset;
  }
  computeVoxelOffset(x: number, y: number, z: number) {
    const {cellSize, cellSliceSize} = this;
    const voxelX = THREE.MathUtils.euclideanModulo(x, cellSize) | 0;
    const voxelY = THREE.MathUtils.euclideanModulo(y, cellSize) | 0;
    const voxelZ = THREE.MathUtils.euclideanModulo(z, cellSize) | 0;
    return voxelY * cellSliceSize +
           voxelZ * cellSize +
           voxelX;
  }
  static computeOffset(x: number, y: number, z: number, cellSize: number = CHUNK_WIDTH) {
    const cellSliceSize = cellSize * cellSize;
    const voxelX = THREE.MathUtils.euclideanModulo(x, cellSize) | 0;
    const voxelY = THREE.MathUtils.euclideanModulo(y, cellSize) | 0;
    const voxelZ = THREE.MathUtils.euclideanModulo(z, cellSize) | 0;
    return voxelY * cellSliceSize +
           voxelZ * cellSize +
           voxelX;
  }
  getCellForVoxel(x: number, y: number, z: number) {
    const {cellSize} = this;
    const cellX = Math.floor(x / cellSize);
    const cellY = Math.floor(y / cellSize);
    const cellZ = Math.floor(z / cellSize);
    if (cellX !== 0 || cellY !== 0 || cellZ !== 0) {
      return null;
    }
    return this.cell;
  }
  setVoxel(x: number, y: number, z: number, v: number) {
    const cell = this.getCellForVoxel(x, y, z);
    if (!cell) {
      return;  // TODO: add a new cell?
    }
    const voxelOffset = this.computeVoxelOffset(x, y, z);
    cell[voxelOffset] = v;
  }
  getVoxelArr(arr: number[]) {
    return this.getVoxel(arr[0], arr[1], arr[2])
  }

  getNeighVoxel(x: number, y: number, z: number): any {
    const SIZE = this.cellSize;

    const nchunk_x = x >= SIZE ?
        this.offset[0] + SIZE : x < 0 ?
        this.offset[0] - SIZE : this.offset[0];
      
    const nchunk_y = y >= SIZE ?
      this.offset[1] + SIZE : y < 0 ?
      this.offset[1] - SIZE : this.offset[1];
    
    const nchunk_z = z >= SIZE ?
      this.offset[2] + SIZE : z < 0 ?
      this.offset[2] - SIZE : this.offset[2];
    
    const key = nchunk_x + '_' + nchunk_y + '_' + nchunk_z;
    if (key == this.generateKey()) return 0;
      
    const chunk = chunkPool.getChunk(key);
    if (chunk) {
      const ncx = x < 0 ? SIZE - 1 : x % SIZE;
      const ncy = y < 0 ? SIZE - 1 : y % SIZE;
      const ncz = z < 0 ? SIZE - 1 : z % SIZE;
      

      return chunk.getVoxel(ncx, ncy, ncz);
    }
    return 0
  }
  isInChunk(x: number, y: number, z: number): boolean {
    return !this.isNotInChunk(x, y, z); 
  }
  isNotInChunk(x: number, y: number, z: number): boolean {
    return x < 0 || x >= this.cellSize ||
           y < 0 || y >= this.cellSize ||
           z < 0 || z >= this.cellSize   
  }
  getVoxel(x: number, y: number, z: number): any{
    if (this.isNotInChunk(x, y, z)) return this.getNeighVoxel(x, y, z) 
    
    const cell = this.getCellForVoxel(x, y, z);
    if (!cell) return 0;

    const voxelOffset = this.computeVoxelOffset(x, y, z);
    return cell[voxelOffset];
  }

  getNeigh(arr: number[], op: any[]) {
    
    return this.getVoxelArr(applyTrn(arr, op))
  }
  generateGeometryDataForCell(cellX: number, cellY: number, cellZ: number) {
    console.log(this.generateKey())
    const {cellSize} = this;
    const positions = [];
    const normals = [];
    const indices = [];
    const uvs = [];
    const aosArr = [];
    const colors = [];
    const startX = cellX * cellSize;
    const startY = cellY * cellSize;
    const startZ = cellZ * cellSize;

    for (let y = 0; y < cellSize; ++y) {
      const voxelY = startY + y;
      for (let z = 0; z < cellSize; ++z) {
        const voxelZ = startZ + z;
        for (let x = 0; x < cellSize; ++x) {
          const voxelX = startX + x;
          const rndA = (Math.random() * 2 - 1) 

          const voxel = this.getVoxel(voxelX, voxelY, voxelZ);
          if (voxel) {
            const scale = 300;
            const noiseValue = noise2D(
              (x + this.offset[0]) / scale,
              (z + this.offset[2]) / scale)
              
            let green = [
              0.2 + noiseValue/5,
              0.6 + noiseValue/3 ,
              0.4 + noiseValue/5 + rndA/5
            ]

            let yellow = [
              0.7 + noiseValue/5,
              0.6 + noiseValue/3 ,
              0.2 + noiseValue/5
            ]
    
            // There is a voxel here but do we need faces for it?
            for (const {dir, corners} of VoxelFaces) {
              const neighbor = this.getVoxel(
                  voxelX + dir[0],
                  voxelY + dir[1],
                  voxelZ + dir[2]);
              if (!neighbor) {
                const curr = [voxelX, voxelY, voxelZ]
                // this voxel has no neighbor in this direction so we need a face.
                const ndx = positions.length / 3;
                let a00 = 0;
                let a11 = 0;
                let a01 = 0;
                let a10 = 0;
                let aosBuffer = [];
                for (const [pos, uv] of corners) {
                  positions.push(
                    pos[0] + x + this.offset[0],
                    pos[1] + y + this.offset[1],
                    pos[2] + z + this.offset[2]);
                  
                  let color: number[] = [];
                  switch (voxel) {
                    case BlockType.dirt:
                      color = green;
                      break;
                    
                    case BlockType.sand:
                      color = yellow;
                      break;
                    
                    case BlockType.rock:
                      color = [0.2, 0.2, 0.6];
                      break;
                    
                    case BlockType.wood:
                      color = [0.65, 0.313, 0.06];
                      break;
                    
                    case BlockType.leaves:
                      color = [
                        0.23 + green[0]/5 ,
                        clamp(0.47 + green[1]/4 + rndA/50),
                        0.2 + green[2]/5];
                      break;
                    
                    case BlockType.purpleLeaves:
                      color = [
                        0.815,
                        clamp(0.08 + green[1]/5 + rndA/5) ,
                        0.96 + rndA/100];
                      break;
                  }
          
                  
                  
                  const lkMap = aoDirs[dir.join('')];
                  if (lkMap) {
                    const [n, ...lookups] = lkMap[pos.join('')];
                    const [a, b, c] = lookups.map((l: any) => !!this.getNeigh(curr, [l]));
                    const aoIndex = vertexAO(a, b, c);
                    const ao = aoTable[aoIndex]
                    if (n === 1) a00 = ao;
                    if (n === 2) a01 = ao;
                    if (n === 3) a10 = ao;
                    if (n === 4) a11 = ao;
                    aosBuffer.push(aoIndex);

                  }
                  
               
                  const colorBits =
                    Math.floor(color[0] * 255) << 16 | 
                    Math.floor(color[1] * 255) << 8 | 
                    Math.floor(color[2] * 255)  
                  
                  colors.push(colorBits)
                  normals.push(...dir);
                  uvs.push(...uv)
                }
                let aosBits =
                  aosBuffer[0] << 6 |
                  aosBuffer[1] << 4 |
                  aosBuffer[2] << 2 |
                  aosBuffer[3];
                
                aosArr.push(aosBits, aosBits, aosBits, aosBits);
                
                if (a00 + a11 > a01 + a10) {
                  
                  indices.push(
                    ndx, ndx + 3, ndx + 2,
                    ndx, ndx + 1, ndx + 3,
                  );
                } else {
                  
                  indices.push(
                    ndx, ndx + 1, ndx + 2,
                    ndx + 2, ndx + 1, ndx + 3,
                  );
                }
                
              }
            }
          }
        }
      }
    }
   
    return {
      positions,
      aosArr,
      uvs,
      normals,
      colors,
      indices,
    };
  }

  static generateMesh(data: any) {
    const {    
      positions,
      aos,
      uvs,
      normals,
      colors,
      indices
    } = data;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute(
        'normal',
      new THREE.BufferAttribute(normals, 3));
    
    geometry.setAttribute(
        'uv',
      new THREE.BufferAttribute(uvs, 2));
    
    geometry.setAttribute(
      'color',
      new THREE.BufferAttribute(colors, 1));
    
    geometry.setAttribute(
      'aos',
      new THREE.BufferAttribute(aos, 1));
    
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    
    const mesh = new THREE.Mesh(geometry, material);

    return mesh
  }

  public generateGeometry() {
    const {    
      positions: _positions,
      aosArr: _aos,
      uvs: _uvs,
      normals: _normals,
      colors: _colors,
      indices: _indices
    } = this.generateGeometryDataForCell(0, 0, 0);
    const positions = new Float32Array(new SharedArrayBuffer(4 * _positions.length));
    positions.set(_positions, 0);

    const uvs = new Float32Array(new SharedArrayBuffer(4 * _uvs.length));
    uvs.set(_uvs, 0);

    const colors = new Float32Array(new SharedArrayBuffer(4 * _colors.length));
    colors.set(_colors, 0);

    const normals = new Float32Array(new SharedArrayBuffer(4 * _normals.length));
    normals.set(_normals, 0);

    const aos = new Float32Array(new SharedArrayBuffer(4 * _aos.length));
    aos.set(_aos, 0);

    const indices = new Uint16Array(new SharedArrayBuffer(2 * _indices.length));
    indices.set(_indices, 0);
    return {
      positions,
      normals,
      uvs,
      colors,
      aos,
      indices,
    }
  }
  public generateGeometryAndMesh(): THREE.Mesh {
    const {    
      positions,
      aosArr,
      uvs,
      normals,
      colors,
      indices
    } = this.generateGeometryDataForCell(0, 0, 0);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(positions), 3));
    geometry.setAttribute(
        'normal',
      new THREE.BufferAttribute(new Float32Array(normals), 3));
    
    geometry.setAttribute(
        'uv',
      new THREE.BufferAttribute(new Float32Array(uvs), 2));
    
    geometry.setAttribute(
      'color',
      new THREE.BufferAttribute(new Float32Array(colors), 1));
    
    geometry.setAttribute(
      'aos',
      new THREE.BufferAttribute(new Float32Array(aosArr), 1));
    
    geometry.setIndex(indices);
    
    return new THREE.Mesh(geometry, material);
  }
}

const uv0 = [0, 0];
const uv1 = [0, 1];
const uv2 = [1, 0];
const uv3 = [1, 1];

const VoxelFaces = [
  { // left
    dir: [ -1,  0,  0, ],
    corners: [
      [[ 0, 1, 0 ], uv0],
      [[ 0, 0, 0 ], uv1],
      [[ 0, 1, 1 ], uv2],
      [[ 0, 0, 1 ], uv3],
    ],
  },
  { // right
    dir: [  1,  0,  0, ],
    corners: [
      [[ 1, 1, 1 ], uv0],
      [[ 1, 0, 1 ], uv1],
      [[ 1, 1, 0 ], uv2],
      [[ 1, 0, 0 ], uv3],
    ],
  },
  { // bottom
    dir: [  0, -1,  0, ],
    corners: [
      [[ 1, 0, 1 ], uv2],
      [[ 0, 0, 1 ], uv0],
      [[ 1, 0, 0 ], uv3],
      [[ 0, 0, 0 ], uv1],
    ],
  },
  { // top
    dir: [  0,  1,  0, ],
    corners: [
      [[ 0, 1, 1 ], uv0],
      [[ 1, 1, 1 ], uv1],
      [[ 0, 1, 0 ], uv2],
      [[ 1, 1, 0 ], uv3],
    ],
  },
  { // back
    dir: [  0,  0, -1, ],
    corners: [
      [[ 1, 0, 0 ], uv0],
      [[ 0, 0, 0 ], uv1],
      [[ 1, 1, 0 ], uv2],
      [[ 0, 1, 0 ], uv3],
    ],
  },
  { // front
    dir: [  0,  0,  1, ],
    corners: [
      [[ 0, 0, 1 ], uv0],
      [[ 1, 0, 1 ], uv1],
      [[ 0, 1, 1 ], uv2],
      [[ 1, 1, 1 ], uv3],
    ],
  },
];