import { Outlet, useLocation } from "react-router-dom"
import { useNavigationFade } from "@/components/ui/motion/useNavigationFade"
import "./auth.css"

export default function AuthLayout() {
  const { pathname } = useLocation()
  const routeRef = useNavigationFade(pathname)

  return (
    <main ref={routeRef} className="auth-layout-root">
      <Outlet />
    </main>
  )
}
