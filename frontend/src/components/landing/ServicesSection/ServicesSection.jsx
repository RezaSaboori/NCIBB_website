import React, { useState, useRef, useEffect } from "react"
import "./ServicesSection.css"

const servicesData = {
  داده: [
    {
      id: 1,
      title: "درگاه جامع محققین قلب و عروق",
      description:
        "دسترسی به داده‌های حجیم ژنومیک و بالینی قلب و عروق برای پژوهش‌های پیشرفته.",
      span: 3,
    },
    {
      id: 2,
      title: "استانداردسازی",
      description: "پیش‌پردازش و استانداردسازی داده‌های شما.",
      span: 1,
    },
    {
      id: 3,
      title: "اعتباربخشی",
      description: "خدمات اعتبار بخشی و اخذ DOI",
    },
    {
      id: 4,
      title: "امنیت داده",
      description: "حفظ حریم خصوصی بیماران و امنیت کامل داده‌های حساس پزشکی.",
      span: 1,
    },
  ],
  پردازش: [
    {
      id: 5,
      title: "خدمات پردازشی سریع",
      description: "خدمات پردازشی سریع و امن داده‌های حساس",
      span: 1,
    },
    {
      id: 6,
      title: "خدمات تحلیلی خودکار",
      description: "ابزارهای تحلیل آماری و داده‌کاوری خودکار",
      span: 2,
    },
    {
      id: 7,
      title: "خدمات سفارشی",
      description: "تحلیل سفارشی با استفاده از بروزترین متدهای موجود",
      span: 2,
    },
    {
      id: 8,
      title: "مشاوره",
      description: "پیدا کردن بهترین سرویس متناسب با نیاز",
      span: 1,
    },
  ],
  منابع: [
    {
      id: 9,
      title: "کتاب‌خانه",
      description:
        "آرشیوی از ۱۴ کتاب مهم در حوزه بایوبانکینگ به همراه خلاصه و امکان چت با کتاب‌ها.",
      span: 2,
    },
    {
      id: 10,
      title: "نقشه راه ",
      description: "نقشه راه یادگیری هوش مصنوعی و دیتاساینس",
    },
    {
      id: 11,
      title: "دوره‌های آموزشی",
      description: "مجموعه دوره‌های آموزشی مرتبط با علم داده و هوش مصنوعی.",
    },
    {
      id: 12,
      title: "اخبار",
      description: "آخرین اخبار و اطلاعات مرتبط با علم داده و هوش مصنوعی.",
      span: 2,
    },
  ],
}

const ServicesSection = ({ isVisible }) => {
  const [activeTab, setActiveTab] = useState("داده")
  const [indicatorStyle, setIndicatorStyle] = useState({})
  const tabsRef = useRef({})

  const tabs = ["منابع", "پردازش", "داده"] // Reverse order for RTL slider

  useEffect(() => {
    const activeElement = tabsRef.current[activeTab]
    if (activeElement) {
      setIndicatorStyle({
        width: `${activeElement.offsetWidth}px`,
        transform: `translateX(${activeElement.offsetLeft}px)`,
        opacity: 1,
      })
    }
  }, [activeTab])

  return (
    <div
      className={`services-section-wrapper ${isVisible ? "is-visible" : ""}`}
    >
      <div className="services-container">
        <div className="services-header">
          <h2 className="services-title">خدمات</h2>

          <div className="services-tabs-container">
            <div className="services-nav">
              <div className="services-nav__menu">
                {tabs.map((tab) => (
                  <div
                    key={tab}
                    ref={(el) => (tabsRef.current[tab] = el)}
                    className={`services-nav__item ${activeTab === tab ? "active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </div>
                ))}
                <div
                  className="services-nav__indicator"
                  style={indicatorStyle}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="services-bento-grid">
          {servicesData[activeTab].map((card, index) => (
            <div
              key={card.id}
              className={`service-card ${isVisible ? "reveal" : ""}`}
              style={{
                animationDelay: `${index * 150}ms`,
                gridColumn: `span ${card.span || 1}`,
              }}
            >
              <h3 className="service-card-title">{card.title}</h3>
              <p className="service-card-description">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ServicesSection
