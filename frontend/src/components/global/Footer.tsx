import { FC } from "react"
import { Icon } from "@iconify/react"
import { Input, Button } from "@heroui/react"
import "./footer.css"

export const Footer: FC = () => {
  return (
    <footer
      className="glass footer-nav text-gray12 py-12 max-w-5xl mx-auto"
      dir="rtl"
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Contact Us & Follow Us */}
          <div className="lg:col-span-3 min-w-0 h-full flex flex-col">
            <div className="mb-8">
              <h3 className="text-lg font-bold h-fit">ارتباط با ما</h3>
            </div>
            <div className="h-full flex flex-col justify-between">
              <div className="flex flex-col w-full space-y-3">
                <a
                  href="mailto:info@cardiosmart.ai"
                  className="footer-contact-link flex items-center justify-between gap-2 w-full"
                >
                  <div className="bg-gray12 rounded-full p-1.5 shrink-0">
                    <Icon
                      icon="mynaui:envelope"
                      className="w-5 h-5 text-gray1"
                    />
                  </div>
                  <bdi className="footer-contact-value">info@cardiosmart.ai</bdi>
                </a>
                <a
                  href="tel:+982123923136"
                  className="footer-contact-link flex items-center justify-between gap-2 w-full"
                >
                  <div className="bg-gray12 rounded-full p-1.5 shrink-0">
                    <Icon
                      icon="ph:phone-light"
                      className="w-5 h-5 text-gray1"
                    />
                  </div>
                  <span dir="ltr">+98 212 3923136</span>
                </a>
              </div>
              <div className="w-full space-y-4 mt-4 lg:mt-0">
                <h4 className="text-md font-bold">ما را دنبال کنید!</h4>
                <div className="footer-social-links flex gap-3 lg:gap-4">
                  <a
                    href="#"
                    className="w-full aspect-square flex items-center justify-center rounded-full bg-gray12 text-gray1 hover:bg-gray8 transition-colors"
                  >
                    <Icon
                      icon="nrk:some-instagram"
                      className="w-[50%] h-[50%]"
                    />
                  </a>
                  <a
                    href="#"
                    className="w-full aspect-square flex items-center justify-center rounded-full bg-gray12 text-gray1 hover:bg-gray8 transition-colors"
                  >
                    <Icon
                      icon="eva:linkedin-fill"
                      className="w-[50%] h-[50%]"
                    />
                  </a>
                  <a
                    href="#"
                    className="w-full aspect-square flex items-center justify-center rounded-full bg-gray12 text-gray1 hover:bg-gray8 transition-colors"
                  >
                    <Icon icon="simple-icons:x" className="w-[45%] h-[45%]" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="lg:col-span-5 min-w-0 h-full flex flex-col">
            <div className="mb-8">
              <h3 className="text-lg font-bold">آدرس</h3>
            </div>
            <div className="h-full flex flex-col space-y-4">
              <p className="text-sm">
                تهران، ولیعصر، جنب پارک ملت، نبش نیایش، انستیتو ملی قلب و عروق
                شهید رجایی
              </p>
              <div className="relative h-[180px] rounded-[var(--border-radius-2xl)] overflow-hidden w-full">
                <iframe
                  src="https://balad.ir/embed?p=3A1CXreyL2L1RV"
                  title="مشاهده «بیمارستان تخصصی قلب رجایی» روی نقشه بلد"
                  className="absolute bottom-[-15px] left-0 w-full h-[256px] border-none"
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-4 min-w-0 space-y-6 flex flex-col justify-between">
            <div className="mb-8">
              <h3 className="text-lg font-bold">
                از جدیدترین اخبار باخبر شوید
              </h3>
            </div>
            <div className="h-full flex flex-col justify-between">
              <div className="flex space-x-2 justify-between items-center bg-gray12 rounded-full">
                <Input
                  type="email"
                  placeholder="ایمیل شما"
                  classNames={{
                    inputWrapper:
                      "bg-gray12 rounded-full mr-1 w-full data-[hover=true]:bg-gray12 data-[focus=true]:bg-gray12 text-[var(--color-gray1)]",
                    input:
                      "text-[var(--color-gray1)] placeholder:text-[var(--color-gray1)]",
                  }}
                />
                <Button
                  size="sm"
                  className="bg-gray1 text-gray12 font-semibold rounded-full m-1 "
                >
                  ثبت
                </Button>
              </div>
              <div className="flex space-x-2 space-x-reverse gap-2">
                <Button className="bg-blue-200 text-primary font-semibold w-full rounded-full">
                  ثبت نام
                </Button>
                <Button className="bg-primary text-gray1 font-semibold w-full rounded-full">
                  ورود
                </Button>
              </div>
              <div className="text-right text-sm text-gray5">
                <p>
                  تمام حقوق این وب سایت برای بانک ملی زیست داده یکپارچه قلب و
                  عروق محفوظ میباشد.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
