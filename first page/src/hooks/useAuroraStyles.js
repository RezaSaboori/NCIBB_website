import { useEffect, useState } from 'react';
import { ANIMATION_CONFIG } from '../config/constants';

export function useAuroraStyles() {
  const [auroraVisible, setAuroraVisible] = useState(false);

  useEffect(() => {
    const fontLinkId = 'inter-font-link';
    if (!document.getElementById(fontLinkId)) {
      const link = document.createElement('link');
      link.id = fontLinkId;
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    return () => {
      const link = document.getElementById(fontLinkId);
      if (link) link.remove();
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAuroraVisible(true);
    }, ANIMATION_CONFIG.AURORA_DELAY);

    return () => clearTimeout(timer);
  }, []);

  return auroraVisible;
}

