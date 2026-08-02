/*TaahodCard.tsx*/
import React from "react";

interface TaahodCardProps {
  onConfirm: () => void;
}

export const TaahodCard: React.FC<TaahodCardProps> = ({ onConfirm }) => {
  return (
    <div className="glass dz-glass-container dz-glass-container--lg">
      <div className="dz-glass-container__header">
        <h2 className="s1-card-header__title">تعهدنامه</h2>
      </div>
      <div className="dz-glass-container__body s1-taahod-body custom-scrollbar">
        <p className="s1-taahod-intro">
          اینجانب با آگاهی کامل از مفاد این تعهدنامه و به‌منظور استفاده از خدمات
          سامانه داده‌ساز، موارد زیر را متعهد می‌شوم:
        </p>
        <ol className="s1-taahod-list" dir="rtl">
          <li>
            استفاده از خروجی‌های این سامانه صرفاً برای اهداف پژوهشی، آموزشی و
            بهبود ارائه خدمات بهداشتی مجاز است.
          </li>
          <li>
            از انتشار، اشتراک‌گذاری یا بهره‌برداری تجاری از داده‌های خام یا
            پردازش‌شده بدون اخذ مجوز کتبی خودداری می‌کنم.
          </li>
          <li>
            در صورت شناسایی هرگونه نقص امنیتی یا نشت داده، موضوع را بلافاصله به
            تیم فنی سامانه اطلاع خواهم داد.
          </li>
        </ol>
        <p className="s1-taahod-footer">
          با تکمیل و ثبت این فرم، تأیید می‌کنم که موارد فوق را خوانده،
          درک کرده و می‌پذیرم.
        </p>
      </div>
      <div className="dz-glass-container__footer">
        <button
          className="dz-btn dz-btn--primary s1-confirm-btn"
          type="button"
          onClick={onConfirm}
        >
          ایجاد پروژه
        </button>
      </div>
    </div>
  );
};