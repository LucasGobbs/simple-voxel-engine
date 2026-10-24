# cube-engine

![cube-engine](docs/hero.png)

A small voxel engine prototype built on three.js and TypeScript. It generates Minecraft-style terrain in chunks — heightmap hills with rivers, sandy shores, dirt and rock layers, and scattered trees — and renders it with per-face culled meshes and baked ambient occlusion.

![demo](docs/demo.gif)

## Features

- Chunked voxel terrain (32×64×32 chunks) from layered, alea-seeded simplex noise: rivers, sand, dirt, rock, trees with green or purple leaves
- Chunk streaming: new chunks generate around the camera as you fly
- Per-chunk face culling — only visible faces get meshed
- Per-vertex ambient occlusion (8-neighbor corner rule), custom shader with fog
- Flying camera with pointer-lock mouse look

## Getting started

```bash
npm install
npm run dev
```

No shader build step needed — Vite serves everything.

**Controls:** click to lock the pointer, then:

- `WASD` — move
- `Space` / `Ctrl` — up / down
- `Shift` — 3× speed
- `Esc` — release the pointer

## Architecture

The game loop lives in `src/engine` — an abstract frame loop with delta-time stepping, renderer/fog setup, and a forked `PointerLockControls` (`src/engine/pointer.ts`). World code lives in `src/world`: chunk generation from noise, the face-culling and AO tables, and meshing. Chunk generation is set up to run off the main thread via a worker pool (`chunk-builder.worker.ts` + `WorkerPool`), but the simple in-process pool (`src/world/chunk-pool`) is what actually runs right now.

## Gallery

Aerial view over the forest:

![aerial](docs/forest_aerial.png)

Chunk boundary free terrain, streams loaded as the camera moves:

![far view](docs/far_view.png)

Down among the canopies:

![canopy](docs/canopy_shore.png)

Under the leaves, sand meeting grass:

![under canopy](docs/under_canopy.png)

## Status

This is a prototype/experiment, not a game:

- The threaded worker pool is written but the simple pool is the active one
- No collision or physics yet — you fly through blocks
