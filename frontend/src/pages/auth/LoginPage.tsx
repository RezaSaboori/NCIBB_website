import LoginForm from "../../components/auth/LoginForm"
import { useNavigate } from "react-router-dom"
import "../../styles/glass.css"
import "./auth.css"

const LoginPage = () => {
  const navigate = useNavigate()

  return (
    <div className="auth-page-backdrop">
      <div className="glass-transparent auth-page-card">
        <h2 className="auth-page-title">ورود به حساب</h2>
        <LoginForm onLoginSuccess={() => navigate("/")} />
      </div>
    </div>
  )
}

export default LoginPage