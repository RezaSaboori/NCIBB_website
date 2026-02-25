import React, { useEffect, useRef } from 'react';
import './RotatingBorder.css';

const RotatingBorder = ({ 
  children, 
  className = '', 
  style = {},
  borderWidth = 2,
  ...props 
}) => {
  const containerRef = useRef(null);
  const borderMaskRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current || !borderMaskRef.current) return;
      
      // Get container's bounding rectangle
      const rect = containerRef.current.getBoundingClientRect();
      
      // Calculate container center
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate mouse position relative to container center
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      
      // Calculate angle in radians using atan2
      // Negate deltaY because screen Y increases downward, but we want
      // the angle to reflect the visual direction (up = positive Y)
      const angleRad = Math.atan2(-deltaY, deltaX);
      
      // Convert to degrees
      let angleDeg = (angleRad * 180) / Math.PI;
      
      // CSS linear-gradient uses angles measured clockwise from top (north)
      // Convert from atan2 (counter-clockwise from right) to CSS format
      // We want the bright part (0% stop) to point TOWARD the mouse
      angleDeg = 270 - angleDeg;
      
      // Normalize to 0-360 range
      angleDeg = ((angleDeg % 360) + 360) % 360;
      
      borderMaskRef.current.style.setProperty('--angle', `${angleDeg}deg`);
      borderMaskRef.current.style.setProperty('--border-width', `${borderWidth}px`);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [borderWidth]);

  return (
    <div
      ref={containerRef}
      className={`rotating-border-container ${className}`}
      style={{ position: 'relative', ...style }}
      {...props}
    >
      <div ref={borderMaskRef} className="gradient-border-mask-container"></div>
      {children}
    </div>
  );
};

export default RotatingBorder;

