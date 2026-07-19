// Datasaz API layer — stubs to be implemented per step requirements

export const datasazApi = {
  // Step 2: submit cohort definition criteria
  submitDefinition: async (_payload: unknown): Promise<void> => {
    throw new Error("Not implemented");
  },

  // Step 3: trigger processing job
  startProcessing: async (_jobId: string): Promise<void> => {
    throw new Error("Not implemented");
  },

  // Step 4: fetch output results
  fetchOutput: async (_jobId: string): Promise<unknown> => {
    throw new Error("Not implemented");
  },
};