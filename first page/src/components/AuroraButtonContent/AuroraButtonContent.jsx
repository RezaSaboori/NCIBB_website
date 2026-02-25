import React from 'react';
import './AuroraButtonContent.css';

const AuroraButtonContent = ({ visible }) => {
  return (
    <div 
      className="aurora-container" 
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.95)',
      }}
    >
      {/* Central Blobs */}
      <div className="aurora-orbit" style={{ zIndex: 2 }}>
        <div className="aurora-blob" style={{ width: '150px', height: '150px', background: 'radial-gradient(circle, #00c6ff 0%, rgba(0,198,255,0.2) 80%, transparent 100%)', animation: 'orbit-1 7s linear infinite' }}></div>
      </div>
      <div className="aurora-orbit" style={{ zIndex: 3 }}>
        <div className="aurora-blob" style={{ width: '110px', height: '110px', background: 'radial-gradient(circle, #bd34fe 0%, rgba(189,52,254,0.29) 80%, transparent 100%)', animation: 'orbit-2 10s linear infinite reverse' }}></div>
      </div>
      <div className="aurora-orbit" style={{ zIndex: 4 }}>
        <div className="aurora-blob" style={{ width: '90px', height: '90px', background: 'radial-gradient(circle, #ffffff 0%, rgba(255,255,255,0.33) 80%, transparent 100%)', animation: 'orbit-3 13s linear infinite' }}></div>
      </div>
      <div className="aurora-orbit" style={{ zIndex: 5 }}>
        <div className="aurora-blob" style={{ width: '85px', height: '85px', background: 'radial-gradient(circle, #001a57 30%, transparent 100%)', animation: 'orbit-4 18s linear infinite' }}></div>
      </div>
      <div className="aurora-orbit" style={{ zIndex: 1 }}>
        <div className="aurora-blob" style={{ width: '102px', height: '102px', background: 'radial-gradient(circle, rgba(0,255,208,0.54) 0%, rgba(0,255,208,0.03) 100%)', animation: 'orbit-5 21s linear infinite reverse' }}></div>
      </div>
      {/* Dense Left Blobs */}
      <div className="aurora-orbit" style={{ zIndex: 6 }}>
        <div className="aurora-blob" style={{ width: '120px', height: '120px', background: 'radial-gradient(circle, rgba(144,255,0,0.74) 0%, rgba(144,255,0,0.28) 80%, transparent 100%)', animation: 'orbit-L1 9s linear infinite reverse', opacity: 0.65 }}></div>
      </div>
      <div className="aurora-orbit" style={{ zIndex: 7 }}>
        <div className="aurora-blob" style={{ width: '90px', height: '90px', background: 'radial-gradient(circle, rgba(49,241,255,0.71) 0%, rgba(17,119,255,0.53) 100%)', animation: 'orbit-L2 6s linear infinite', opacity: 0.5 }}></div>
      </div>
      <div className="aurora-orbit" style={{ zIndex: 8 }}>
        <div className="aurora-blob" style={{ width: '80px', height: '80px', background: 'radial-gradient(circle, rgba(251,255,0,0.51) 0%, rgba(191,255,208,0.38) 100%)', animation: 'orbit-L3 13s linear infinite reverse', opacity: 0.62 }}></div>
      </div>
      <div className="aurora-orbit" style={{ zIndex: 9 }}>
        <div className="aurora-blob" style={{ width: '80px', height: '80px', background: 'radial-gradient(circle, rgba(255,178,254,0.6) 0%, rgba(254,195,180,0.73) 100%)', animation: 'orbit-L4 16s linear infinite', opacity: 0.44 }}></div>
      </div>
      <div className="aurora-orbit" style={{ zIndex: 10 }}>
        <div className="aurora-blob" style={{ width: '70px', height: '70px', background: 'radial-gradient(circle, rgba(188,255,186,0.63) 0%, rgba(180,243,254,0.53) 100%)', animation: 'orbit-L5 8s linear infinite reverse', opacity: 0.58 }}></div>
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'var(--btn-primary-bg)', opacity: 0.2, backdropFilter: 'blur(1px)' }}></div>
    </div>
  );
};

export default AuroraButtonContent;

