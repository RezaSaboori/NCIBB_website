import { Route, Routes } from "react-router-dom"
import MainLayout from "./layouts/default"
import AuthLayout from "./layouts/auth"
import Page from "./pages/Page"
import ProfileManager from "./components/profile/ProfileManager"
import { DatasetPage } from "./pages/dataset"
import { PortalPage } from "./pages/portal"
import LandingPage from "./pages/landing"
import LoginPage from "./pages/auth/LoginPage"
import SignupPage from "./pages/auth/SignupPage"

function App() {
  return (
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
  )
}

export default App