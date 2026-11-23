import React from "react"
import { Button } from "@heroui/react"
import { Link } from "react-router-dom"

interface HeroProps {
  title: string
  subtitle: string
  imageUrl: string
  primaryAction: {
    text: string
    link: string
  }
  secondaryAction: {
    text: string
    link: string
  }
}

export const Hero: React.FC<HeroProps> = ({
  imageUrl,
  primaryAction,
  secondaryAction,
}) => {
  return (
    <div className="relative">
      <div className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-800 dark:text-white">
          به NCIBB خوش آمدید
        </h1>
        <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
          ما به شما کمک می کنیم تا به اهداف خود برسید
        </p>
        <div className="mt-8 flex justify-center gap-4" dir="rtl">
          <Link to={primaryAction.link}>
            <Button color="primary" size="lg">
              شروع کنید
            </Button>
          </Link>
          <Link to={secondaryAction.link}>
            <Button variant="bordered" size="lg">
              بیشتر بدانید
            </Button>
          </Link>
        </div>
      </div>
      <div className="absolute inset-0 z-[-1] opacity-10">
        <img
          src={imageUrl}
          alt="Hero background"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  )
}
