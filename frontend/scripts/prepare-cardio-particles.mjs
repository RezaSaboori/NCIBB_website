import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { sampleParticlesFromMesh } from "../src/components/landing/CardioBackground/webgl/particle-sampler.js";
import { toTypedArray } from "../src/components/landing/CardioBackground/webgl/utils.js";

const directory = dirname(fileURLToPath(import.meta.url));
const assetDirectory = resolve(directory, "../public/landing/webgl_asset");

const inputPath = resolve(directory, "../../NCIBB_source_assets/mesh_data.json");
const outputPath = resolve(assetDirectory, "cardio-particles.bin");

const particleCount = 10000;

const manifest = JSON.parse(await readFile(inputPath, "utf8"));

if (!manifest.meshes || typeof manifest.meshes !== "object") {
  throw new Error("Invalid mesh manifest");
}

const primitives = [];

for (const meshPrimitives of Object.values(manifest.meshes)) {
  for (const primitive of meshPrimitives) {
    if (primitive.attributes?.POSITION) {
      primitives.push(primitive);
    }
  }
}

let totalVertexCount = 0;

for (const primitive of primitives) {
  const data = primitive.attributes.POSITION.data;
  const count = Array.isArray(data[0])
    ? data.length
    : data.length / 3;

  if (!Number.isInteger(count)) {
    throw new Error("Invalid position data");
  }

  totalVertexCount += count;
}

if (totalVertexCount === 0 || primitives.length > 256) {
  throw new Error("Invalid vertex or mesh count");
}

const positions = new Float32Array(totalVertexCount * 3);
const normals = new Float32Array(totalVertexCount * 3);
const meshIndices = new Uint8Array(totalVertexCount);

const bboxMin = [Infinity, Infinity, Infinity];
const bboxMax = [-Infinity, -Infinity, -Infinity];

let vertexOffset = 0;

for (let meshIndex = 0; meshIndex < primitives.length; meshIndex++) {
  const attributes = primitives[meshIndex].attributes;
  const vertexPositions = toTypedArray(attributes.POSITION);
  const count = vertexPositions.length / 3;

  positions.set(vertexPositions, vertexOffset * 3);

  if (attributes.NORMAL) {
    const vertexNormals = toTypedArray(attributes.NORMAL);

    if (vertexNormals.length !== vertexPositions.length) {
      throw new Error("Position/normal count mismatch");
    }

    normals.set(vertexNormals, vertexOffset * 3);
  } else {
    for (let i = 0; i < count; i++) {
      normals[(vertexOffset + i) * 3 + 1] = 1;
    }
  }

  meshIndices.fill(meshIndex, vertexOffset, vertexOffset + count);

  for (let i = 0; i < count; i++) {
    for (let axis = 0; axis < 3; axis++) {
      const value = vertexPositions[i * 3 + axis];
      bboxMin[axis] = Math.min(bboxMin[axis], value);
      bboxMax[axis] = Math.max(bboxMax[axis], value);
    }
  }

  vertexOffset += count;
}

const bbox = { min: bboxMin, max: bboxMax };

const center = bboxMin.map(
  (value, axis) => (value + bboxMax[axis]) / 2
);

const size = bboxMin.map(
  (value, axis) => bboxMax[axis] - value
);

const maxSize = Math.max(...size);

const heartBounds = [
  Math.max(size[0] * 0.8, 0.001),
  Math.max(size[1] * 0.6, 0.001),
  Math.max(size[2] * 0.4, 0.001),
];

const particleData = sampleParticlesFromMesh(
  positions,
  normals,
  meshIndices,
  totalVertexCount,
  particleCount,
  center,
  bbox,
  primitives.length
);

const attributes = [
  "positions",
  "normals",
  "colors",
  "sizes",
  "phases",
  "ao",
  "meshIndices",
];

const packed = new Float32Array(8 + particleCount * 13);

packed.set([
  particleCount,
  ...center,
  maxSize,
  ...heartBounds,
]);

let offset = 8;

for (const attribute of attributes) {
  const values = particleData[attribute];

  if (offset + values.length > packed.length) {
    throw new Error(`Invalid attribute: ${attribute}`);
  }

  packed.set(values, offset);
  offset += values.length;
}

if (offset !== packed.length) {
  throw new Error("Incomplete particle data");
}

await writeFile(outputPath, Buffer.from(packed.buffer));

console.log(`Generated: ${outputPath}`);
console.log(`Particles: ${particleCount}`);
console.log(`Output size: ${packed.byteLength} bytes`);