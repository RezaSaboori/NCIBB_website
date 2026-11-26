import RegisterForm from "../../components/auth/RegisterForm"
import "./auth.css"

const SignupPage = () => {
  return (
    <div className="glass-transparent auth-page-card-scroll">
      <h2 className="auth-page-title">ثبت نام</h2>
      <RegisterForm />
    </div>
  )
}

export default SignupPage
