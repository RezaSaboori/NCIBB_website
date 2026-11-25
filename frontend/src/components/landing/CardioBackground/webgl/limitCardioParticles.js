export function limitCardioParticles(data, maxCount) {
  const { particleCount, particleData } = data;
  if (particleCount <= maxCount) return data;

  const limited = {};
  for (const [name, values] of Object.entries(particleData)) {
    const dimensions = values.length / particleCount;
    const selected = new Float32Array(maxCount * dimensions);

    // Keep the same sampled vertex and attributes across all buffers.
    for (let index = 0; index < maxCount; index++) {
      const source = Math.floor(index * particleCount / maxCount) * dimensions;
      const destination = index * dimensions;
      for (let axis = 0; axis < dimensions; axis++) {
        selected[destination + axis] = values[source + axis];
      }
    }

    limited[name] = selected;
  }

  return { ...data, particleData: limited, particleCount: maxCount };
}
