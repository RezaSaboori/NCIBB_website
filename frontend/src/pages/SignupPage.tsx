import RegisterForm from "../components/auth/RegisterForm"
import "../styles/glass.css"

const SignupPage = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div
        className="glass-transparent rounded-2xl p-8 w-full max-w-md overflow-y-auto"
        style={{ minWidth: "340px", maxHeight: "90vh" }}
      >
        <h2 className="text-xl font-semibold mb-6 text-right">ثبت نام</h2>
        <RegisterForm />
      </div>
    </div>
  )
}

export default SignupPage