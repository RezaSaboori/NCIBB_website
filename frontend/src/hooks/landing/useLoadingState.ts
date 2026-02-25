import { useState, useCallback, useMemo } from 'react';

export interface LoadingProgress {
  mesh: number;
  webgl: number;
  theme: number;
  assets: number;
}

export const useLoadingState = () => {
  const [progress, setProgress] = useState<LoadingProgress>({
    mesh: 0,
    webgl: 0,
    theme: 0,
    assets: 0,
  });
  
  const [error, setError] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const updateProgress = useCallback((key: keyof LoadingProgress, value: number) => {
    setProgress(prev => ({
      ...prev,
      [key]: Math.min(100, Math.max(0, value))
    }));
  }, []);

  const totalProgress = useMemo(() => {
    // Weights for different loading stages
    const weights = {
      mesh: 0.4,    // Mesh data is the largest asset
      webgl: 0.3,   // Context init and shader compilation
      theme: 0.1,   // Theme preloading
      assets: 0.2,  // Other assets (logos, etc.)
    };

    return (
      progress.mesh * weights.mesh +
      progress.webgl * weights.webgl +
      progress.theme * weights.theme +
      progress.assets * weights.assets
    );
  }, [progress]);

  const isLoading = useMemo(() => {
    return !isFinished && totalProgress < 100;
  }, [isFinished, totalProgress]);

  const finishLoading = useCallback(() => {
    setProgress({
      mesh: 100,
      webgl: 100,
      theme: 100,
      assets: 100,
    });
    setIsFinished(true);
  }, []);

  const handleError = useCallback((msg: string) => {
    setError(msg);
    console.error('Loading Error:', msg);
  }, []);

  return {
    isLoading,
    totalProgress,
    progress,
    error,
    updateProgress,
    finishLoading,
    handleError,
  };
};

