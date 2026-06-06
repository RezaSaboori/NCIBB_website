import React from 'react';

export const UIControls = ({ theme, isGlass, setIsGlass, ignition, setIgnition, introActive, isCoreVisible, setIsCoreVisible }) => {
    const { currentTheme, toggleTheme, themeKey } = theme;

    if (introActive) return null;

    const btnStyle = {
        padding: '12px 24px',
        background: 'rgba(30, 30, 30, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        color: '#ccc',
        fontFamily: "'Helvetica Neue', sans-serif",
        textTransform: 'uppercase',
        fontSize: '11px',
        letterSpacing: '1px',
        cursor: 'pointer',
        borderRadius: '4px',
        backdropFilter: 'blur(10px)',
        transition: '0.4s ease',
    };

    const activeBtnStyle = {
        ...btnStyle,
        background: 'rgba(255, 220, 180, 0.2)',
        color: '#ffaa55',
        borderColor: '#ffaa55',
        boxShadow: '0 0 15px rgba(255, 170, 85, 0.2)',
    };

    const coreBtnStyle = {
        ...btnStyle,
        marginLeft: '20px',
        background: isGlass ? 'rgba(100, 200, 255, 0.15)' : 'rgba(255, 170, 51, 0.15)',
        borderColor: isGlass ? 'rgba(100, 200, 255, 0.3)' : 'rgba(255, 170, 51, 0.3)',
        color: isGlass ? '#aaddff' : '#ffaa33',
    };

    const visibilityBtnStyle = {
        ...btnStyle,
        background: isCoreVisible ? 'rgba(100, 255, 100, 0.15)' : 'rgba(255, 100, 100, 0.15)',
        borderColor: isCoreVisible ? 'rgba(100, 255, 100, 0.3)' : 'rgba(255, 100, 100, 0.3)',
        color: isCoreVisible ? '#aaffaa' : '#ffaaaa',
    };

    const themeBtnStyle = {
        ...btnStyle,
        background: currentTheme.buttonBg,
        color: currentTheme.buttonColor,
    };

    return (
        <div style={{
            position: 'absolute',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '10px',
            zIndex: 100,
            alignItems: 'center'
        }}>
            {[0, 25, 50, 75, 100].map((val) => (
                <button 
                    key={val}
                    style={ignition === val / 100 ? activeBtnStyle : btnStyle}
                    onClick={() => setIgnition(val / 100)}
                >
                    {val === 0 ? '0%' : `${val}% Ignition`}
                </button>
            ))}

            <button 
                style={coreBtnStyle}
                onClick={() => setIsGlass(!isGlass)}
            >
                Core: {isGlass ? 'GLASS' : 'SUN'}
            </button>

            <button 
                style={visibilityBtnStyle}
                onClick={() => setIsCoreVisible(!isCoreVisible)}
            >
                {isCoreVisible ? 'Hide Core' : 'Show Core'}
            </button>

            <button 
                style={themeBtnStyle}
                onClick={toggleTheme}
            >
                {currentTheme.buttonText}
            </button>
        </div>
    );
};
