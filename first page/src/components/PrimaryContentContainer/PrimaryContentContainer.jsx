import React from 'react';
import RotatingBorderButton from '../RotatingBorderButton/RotatingBorderButton';
import AuroraButtonContent from '../AuroraButtonContent/AuroraButtonContent';
import './PrimaryContentContainer.css';

const PrimaryContentContainer = ({ 
  scrollProgress, 
  auroraVisible,
  onLoginClick,
  onSignupClick 
}) => {
  const clampedProgress = Math.min(Math.max(scrollProgress, 0), 1);
  const firstPageProgress = Math.min(Math.max((clampedProgress - 0.1) / 0.4, 0), 1);
  const firstPageOpacity = Math.max(0, 1 - firstPageProgress);
  
  const containerStyle = {
    transform: `translateY(${-Math.min(clampedProgress * 6, 10)}vh)`,
    opacity: firstPageOpacity,
    pointerEvents: firstPageOpacity > 0.05 ? 'auto' : 'none',
  };

  return (
    <div 
      className="primary-content-wrapper" 
      style={containerStyle}
    >
      <div className="primary-content-container">
        <h1 className="primary-content-title">بانک ملی زیست داده قلب و عروق</h1>
        <h2 className="primary-content-subtitle">از داده خام تا تحلیل نهایی</h2>
        <p className="primary-content-description">
          ما با جمع آوری داده های سلامت موجود بصورت یکپارچه، منبعی ارزشمند را برای محققین قلب و عـروق بوجـود آورده ایـم.
        </p>
        
        <div className="primary-content-buttons">
          <RotatingBorderButton variant="secondary" onClick={onLoginClick}>
            <div className="button-content">
              <span className="button-text-secondary">وارد شوید</span>
            </div>
          </RotatingBorderButton>

          <RotatingBorderButton variant="primary" onClick={onSignupClick}>
            <AuroraButtonContent visible={auroraVisible} />
            <div className="button-content">
              <span className="button-text-primary">ثبت‌نام کنید</span>
            </div>
          </RotatingBorderButton>
        </div>
      </div>
    </div>
  );
};

export default PrimaryContentContainer;

