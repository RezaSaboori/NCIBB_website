import { lazy, Suspense } from "react"
import { Route, Routes } from "react-router-dom"
import MainLayout from "./layouts/default"
import AuthLayout from "./layouts/auth"
import LandingPage from "./pages/landing"

const Page = lazy(() => import("./pages/Page"))

const ProfileManager = lazy(
  () => import("./components/profile/ProfileManager")
)

const DatasetPage = lazy(() =>
  import("./pages/dataset").then((module) => ({
    default: module.DatasetPage,
  }))
)

const PortalPage = lazy(() =>
  import("./pages/portal").then((module) => ({
    default: module.PortalPage,
  }))
)

const LoginPage = lazy(() => import("./pages/auth/LoginPage"))
const SignupPage = lazy(() => import("./pages/auth/SignupPage"))

function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="/about" element={<Page pageName="about" />} />
        <Route path="/contact" element={<Page pageName="contact" />} />
        <Route path="/resources" element={<Page pageName="resources" />} />
        <Route path="/dataset" element={<DatasetPage />} />
        <Route path="/portal" element={<PortalPage />} />
        <Route path="/profile" element={<ProfileManager />} />
      </Route>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>
      </Routes>
    </Suspense>
  )
}

export default App