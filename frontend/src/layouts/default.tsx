import { useState, type CSSProperties, type Dispatch, type ReactNode, type SetStateAction } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { Header } from "../components/header"
import { Footer } from "../components/global/Footer"
import { useNavigationFade } from "@/components/ui/motion/useNavigationFade"
import "./default.css"

export interface LayoutContext {
  setSidebar: Dispatch<SetStateAction<ReactNode>>
  setSidebarWidth: Dispatch<SetStateAction<number>>
}

export default function DefaultLayout() {
  const [sidebar, setSidebar] = useState<ReactNode>(null)
  const [sidebarWidth, setSidebarWidth] = useState(260)
  const { pathname } = useLocation()
  const isHomePage = pathname === "/"
  const routeRef = useNavigationFade(pathname, !isHomePage)
  const style = { "--layout-sidebar-width": sidebar ? `${sidebarWidth}px` : "0px" } as CSSProperties

  return (
    <div style={style} className={`ncibb-layout relative flex min-h-screen flex-col${isHomePage ? " bg-[var(--color-gray1)]" : ""}${sidebar ? " ncibb-layout--with-sidebar" : ""}`}>
      <Header className={isHomePage ? "bg-transparent" : ""} />
      <div className="ncibb-layout__body">
        {sidebar}
        <main ref={routeRef} className={`ncibb-main flex-grow w-full max-w-none${isHomePage ? " ncibb-main--home" : ""}`}>
          <Outlet context={{ setSidebar, setSidebarWidth } satisfies LayoutContext} />
        </main>
      </div>
      <div className="ncibb-layout__footer px-6 pb-6"><Footer /></div>
    </div>
  )
}
