import RegisterForm from "../../components/auth/RegisterForm"
import "../../styles/glass.css"
import "./auth.css"

const SignupPage = () => {
  return (
    <div className="auth-page-backdrop">
      <div className="glass-transparent auth-page-card-scroll">
        <h2 className="auth-page-title">ثبت نام</h2>
        <RegisterForm />
      </div>
    </div>
  )
}

export default SignupPage