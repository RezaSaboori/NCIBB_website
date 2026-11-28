import React from "react"
import { Button } from "@heroui/react"
import { Link } from "react-router-dom"

interface CallToActionProps {
  title: string
  description: string
  action: {
    text: string
    link: string
  }
}

export const CallToAction: React.FC<CallToActionProps> = ({
  action,
}) => {
  return (
    <div className="py-20">
      <div className="page-container text-center">
        <h2 className="text-4xl font-bold text-gray-800 dark:text-white">
          آماده شروع هستید؟
        </h2>
        <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
          امروز به ما بپیوندید و تفاوتی که ما ایجاد می کنیم را تجربه کنید.
        </p>
        <div className="mt-8">
          <Link to={action.link}>
            <Button className="ui-control-button" color="primary" size="lg">
              ثبت نام کنید
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
