import React, { useRef } from 'react';
import CardioBackground from './components/CardioBackground';
import FloatingContentWrapper from './components/FloatingContentWrapper/FloatingContentWrapper';
import ThemeToggle from './components/ThemeToggle/ThemeToggle';
import { useInView } from './hooks/useInView';
import { useScrollProgress } from './hooks/useScrollProgress';
import { useCanvasMouseForwarding } from './hooks/useCanvasMouseForwarding';
import { useAuroraStyles } from './hooks/useAuroraStyles';
import { useTheme } from './context/ThemeContext';
import { COLORS, CARDIO_BACKGROUND_CONFIG, INTERSECTION_OBSERVER_CONFIG } from './config/constants';
import './App.css';

function App() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [section1Ref, section1InView] = useInView(INTERSECTION_OBSERVER_CONFIG);
  const { scrollProgress } = useScrollProgress(containerRef);
  const auroraVisible = useAuroraStyles();
  const { theme, colors } = useTheme();
  
  useCanvasMouseForwarding(section1Ref, canvasRef);

  const handleLoginClick = () => {
    console.log('Login clicked');
    // Add login logic here
  };

  const handleSignupClick = () => {
    console.log('Signup clicked');
    // Add signup logic here
  };

  const handlePortalClick = () => {
    console.log('Portal clicked');
    // Add portal navigation logic here
  };

  return (
    <div ref={containerRef} className="app-container">
      <ThemeToggle />
      <div ref={section1Ref} className="section-1">
        <CardioBackground 
          ref={canvasRef}
          quality={CARDIO_BACKGROUND_CONFIG.QUALITY}
          autoRotate={CARDIO_BACKGROUND_CONFIG.AUTO_ROTATE}
          interactive={CARDIO_BACKGROUND_CONFIG.INTERACTIVE}
          enableDragRotation={CARDIO_BACKGROUND_CONFIG.ENABLE_DRAG_ROTATION} 
          enableWheelZoom={CARDIO_BACKGROUND_CONFIG.ENABLE_WHEEL_ZOOM} 
          backgroundColor={colors.background}
          theme={theme}
          contentOffset={CARDIO_BACKGROUND_CONFIG.CONTENT_OFFSET} 
          paused={!section1InView}
          scrollProgress={scrollProgress}
        />
        
        <FloatingContentWrapper
          scrollProgress={scrollProgress}
          auroraVisible={auroraVisible}
          onLoginClick={handleLoginClick}
          onSignupClick={handleSignupClick}
          onPortalClick={handlePortalClick}
        />
      </div>
    </div>
  );
}

export default App;
