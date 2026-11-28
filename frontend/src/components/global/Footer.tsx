import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

import { GlassButton } from "@/components/ui/GlassButton";
import "@/components/ui/inputs.css";
import "./footer.css";

const socialChannels = [
  { name: "اکس", icon: "simple-icons:x" },
  { name: "لینکدین", icon: "eva:linkedin-fill" },
  { name: "اینستاگرام", icon: "nrk:some-instagram" },
];

export function Footer() {
  return (
    <footer className="glass footer-nav" dir="rtl">
      <section
        aria-labelledby="footer-newsletter-title"
        className="footer-newsletter"
      >
        <h3 className="footer-title" id="footer-newsletter-title">
          از جدیدترین اخبار باخبر شوید
        </h3>
        <div className="ui-input-shell ui-input-shell--with-action ui-input-shell--persian footer-newsletter-field">
          <input
            aria-label="ایمیل شما"
            autoComplete="email"
            className="ui-input-field"
            dir="ltr"
            placeholder="ایمیل شما"
            type="email"
          />
          <GlassButton
            className="ui-input-action-slot footer-newsletter-submit"
            inset
            type="button"
          >
            ثبت
          </GlassButton>
        </div>
        <div className="footer-account">
          <Link className="ui-glass-button glass" to="/signup">
            ثبت نام
          </Link>
          <Link className="ui-glass-button blue-glass" to="/login">
            ورود
          </Link>
        </div>
      </section>

      <section aria-labelledby="footer-social-title" className="footer-social">
        <h3 className="footer-title" id="footer-social-title">
          ما را دنبال کنید!
        </h3>
        <div className="footer-social-buttons">
          {socialChannels.map(({ name, icon }) => (
            <GlassButton
              key={icon}
              isIconOnly
              aria-disabled="true"
              aria-label={name}
              className="footer-social-button glass--inverse"
              type="button"
            >
              <Icon aria-hidden="true" icon={icon} />
            </GlassButton>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="footer-location-title"
        className="footer-location"
      >
        <h3
          className="footer-title footer-title--desktop"
          id="footer-location-title"
        >
          آدرس
        </h3>
        <div className="footer-map glass">
          <div className="footer-map__viewport">
            <iframe
              allowFullScreen
              loading="lazy"
              src="https://balad.ir/embed?p=3A1CXreyL2L1RV"
              title="مشاهده «بیمارستان تخصصی قلب رجایی» روی نقشه بلد"
            />
          </div>
        </div>
        <p className="footer-address">
          تهران، ولیعصر، جنب پارک ملت، نبش نیایش، انستیتو ملی قلب و عروق شهید
          رجایی
        </p>
      </section>

      <section
        aria-labelledby="footer-contact-title"
        className="footer-contact"
      >
        <h3
          className="footer-title footer-title--desktop"
          id="footer-contact-title"
        >
          ارتباط با ما
        </h3>
        <div className="footer-contact-links">
          <a className="footer-contact-link" href="tel:+982123923136">
            <span className="glass glass--inverse footer-contact-icon">
              <Icon aria-hidden="true" icon="ph:phone-light" />
            </span>
            <bdi dir="ltr">+98 212 3923136</bdi>
          </a>
          <a className="footer-contact-link" href="mailto:info@cardiosmart.ai">
            <span className="glass glass--inverse footer-contact-icon">
              <Icon aria-hidden="true" icon="mynaui:envelope" />
            </span>
            <bdi dir="ltr">info@cardiosmart.ai</bdi>
          </a>
        </div>
      </section>

      <p className="footer-copyright">
        تمام حقوق این وب سایت برای بانک ملی زیست داده یکپارچه قلب و عروق محفوظ
        میباشد.
      </p>
    </footer>
  );
}
