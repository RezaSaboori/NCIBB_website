import { Header } from "../components/header"
import { useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { Footer } from "../components/global/Footer"

export default function DefaultLayout() {
  const [sidebar, setSidebar] = useState<React.ReactNode | null>(null)
  const [sidebarWidth, setSidebarWidth] = useState<number>(260)
  const location = useLocation()
  const isHomePage = location.pathname === "/"
  const hasSidebar = !!sidebar

  return (
    <div
      className={`relative flex flex-col ${isHomePage ? "min-h-screen bg-[var(--color-gray1)]" : "min-h-screen"}`}
    >
      <Header
        className={isHomePage ? "bg-transparent" : ""}
        sidebarOffset={hasSidebar ? `calc(${sidebarWidth}px + 2rem)` : undefined}
      />
      {hasSidebar ? (
        <div className="flex flex-1">
          {sidebar}
          <main
            className={`flex-grow w-full max-w-none ${isHomePage ? "" : "pt-16"}`}
            style={!isHomePage ? { paddingRight: `calc(${sidebarWidth}px + 2rem)` } : undefined}
          >
            <Outlet context={{ setSidebar, setSidebarWidth }} />
          </main>
        </div>
      ) : (
        <main
          className={`flex-grow w-full max-w-none ${isHomePage ? "" : "pt-16"}`}
        >
          <Outlet context={{ setSidebar, setSidebarWidth }} />
        </main>
      )}
      <div
        className="mt-auto px-6 pb-6"
        style={hasSidebar ? { paddingRight: `calc(${sidebarWidth}px + 2rem + 1.5rem)` } : undefined}
      >
        <Footer />
      </div>
    </div>
  )
}