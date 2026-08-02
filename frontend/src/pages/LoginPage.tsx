import LoginForm from "../components/auth/LoginForm"
import { useNavigate } from "react-router-dom"
import "../styles/glass.css"

const LoginPage = () => {
  const navigate = useNavigate()

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div
        className="glass-transparent rounded-2xl p-8 w-full max-w-md"
        style={{ minWidth: "340px" }}
      >
        <h2 className="text-xl font-semibold mb-6 text-right">ورود به حساب</h2>
        <LoginForm onLoginSuccess={() => navigate("/")} />
      </div>
    </div>
  )
}

export default LoginPage