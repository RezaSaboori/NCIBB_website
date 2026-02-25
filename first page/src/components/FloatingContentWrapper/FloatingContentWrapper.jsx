import React from 'react';
import PrimaryContentContainer from '../PrimaryContentContainer/PrimaryContentContainer';
import SecondaryContentContainer from '../SecondaryContentContainer/SecondaryContentContainer';
import './FloatingContentWrapper.css';

const FloatingContentWrapper = ({ 
  scrollProgress, 
  auroraVisible,
  onLoginClick,
  onSignupClick,
  onPortalClick 
}) => {
  return (
    <div className="floating-content-outer">
      <div className="floating-content-inner">
        <SecondaryContentContainer
          scrollProgress={scrollProgress}
          onPortalClick={onPortalClick}
        />
        <PrimaryContentContainer
          scrollProgress={scrollProgress}
          auroraVisible={auroraVisible}
          onLoginClick={onLoginClick}
          onSignupClick={onSignupClick}
        />
      </div>
    </div>
  );
};

export default FloatingContentWrapper;

