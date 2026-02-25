import React from 'react';
import './SecondaryContentContainer.css';

const SecondaryContentContainer = ({ scrollProgress, onPortalClick }) => {
  const clampedProgress = Math.min(Math.max(scrollProgress, 0), 1);
  const secondPageProgress = Math.min(Math.max((clampedProgress - 0.5) / 0.35, 0), 1);
  const secondaryBoxOffset = (1 - secondPageProgress) * 35;
  const secondaryBoxOpacity = Math.pow(secondPageProgress, 1.25);

  const containerStyle = {
    opacity: secondaryBoxOpacity,
    transform: `translateY(${secondaryBoxOffset}vh)`,
    pointerEvents: secondaryBoxOpacity > 0.05 ? 'auto' : 'none',
  };

  return (
    <div 
      className="secondary-content-wrapper" 
      style={containerStyle}
    >
      <div className="secondary-content-container">
        <div>
          <h3 className="secondary-content-title">سریع، دقیق، یکپارچه</h3>
          <p className="secondary-content-description">
            ما با جمع آوری داده های سلامت موجود بصورت یکپارچه، منبعی ارزشمند را برای محققین قلب و عـروق بوجـود آورده ایـم.
          </p>
        </div>
        <ul className="secondary-content-features">
          <li>• جریان زنده ویدئوی MRI سه‌بعدی با رمزنگاری سراسری</li>
          <li>• هماهنگی خودکار با پیشرفت اسکرول برای ورود بدون تأخیر</li>
          <li>• گزارش لحظه‌ای کیفیت فریم و وضعیت اتصال پژوهشگران</li>
        </ul>
        <button className="secondary-content-portal-button" onClick={onPortalClick}>
          ورود به پورتال
        </button>
      </div>
    </div>
  );
};

export default SecondaryContentContainer;

