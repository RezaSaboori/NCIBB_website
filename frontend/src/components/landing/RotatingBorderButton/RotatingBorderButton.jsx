import React, { useEffect, useRef } from 'react';
import './RotatingBorderButton.css';

const RotatingBorderButton = ({ 
  children, 
  className = '', 
  style = {},
  variant = 'secondary', // 'secondary' or 'primary'
  onClick,
  ...props 
}) => {
  const buttonRef = useRef(null);
  const borderMaskRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!buttonRef.current || !borderMaskRef.current) return;
      
      // Get button's bounding rectangle
      const rect = buttonRef.current.getBoundingClientRect();
      
      // Calculate button center
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate mouse position relative to button center
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
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const baseStyle = {
    position: 'relative',
    padding: '1rem 3rem',
    borderRadius: '9999px',
    overflow: 'hidden',
    cursor: 'pointer',
    border: 'none',
    ...style
  };

  const variantStyles = {
    secondary: {
      background: 'var(--btn-secondary-bg, rgba(255,255,255,0.03))',
      transition: 'all 0.3s ease',
    },
    primary: {
      background: 'var(--btn-primary-bg, rgba(0,0,0,0.2))',
      transition: 'transform 0.3s',
      isolation: 'isolate',
    }
  };

  return (
    <button
      ref={buttonRef}
      className={`rotating-border-btn ${variant === 'secondary' ? 'glass-btn-secondary' : 'aurora-group'} ${className}`}
      style={{ ...baseStyle, ...variantStyles[variant] }}
      onClick={onClick}
      {...props}
    >
      <div ref={borderMaskRef} className="gradient-border-mask"></div>
      {children}
    </button>
  );
};

export default RotatingBorderButton;

