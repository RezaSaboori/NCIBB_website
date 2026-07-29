import { Header } from "../components/header"
import { useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { Footer } from "../components/global/Footer"

export default function DefaultLayout() {
  const [sidebar, setSidebar] = useState<React.ReactNode | null>(null)
  const location = useLocation()
  const isHomePage = location.pathname === "/"

  return (
    <div
      className={`relative flex flex-col ${isHomePage ? "min-h-screen bg-[var(--color-gray1)]" : "min-h-screen"}`}
    >
      <Header className={isHomePage ? "bg-transparent" : ""} />
      {sidebar ? (
        <div className="flex flex-1">
          {sidebar}
          <main
            className={`flex-grow w-full max-w-none ${isHomePage ? "" : "pt-16 pr-[calc(260px+2rem)] pl-6"}`}
          >
            <Outlet context={{ setSidebar }} />
          </main>
        </div>
      ) : (
        <main
          className={`flex-grow w-full max-w-none ${isHomePage ? "" : "pt-16 px-6"}`}
        >
          <Outlet context={{ setSidebar }} />
        </main>
      )}
      <div className="mt-auto px-6 pb-6">
        <Footer />
      </div>
    </div>
  )
}