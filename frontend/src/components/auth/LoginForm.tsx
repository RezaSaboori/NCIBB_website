import { Input, Link, useDisclosure } from "@heroui/react"
import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useDispatch } from "react-redux"
import { authService } from "../../dataset_services/authService"
import { loginSuccess } from "../../store/authSlice"
import { fetchUserProfile } from "../../store/profileSlice"
import { AppDispatch } from "../../store/store"
import { SocialButtons } from "./SocialButtons"
import { ForgotPasswordModal } from "./modal/ForgotPasswordModal"
import { GlassButton } from "@/components/ui/GlassButton"
import "./authForm.css"

type LoginFormFields = {
  email: string
  password: string
}

type LoginFormProps = {
  onLoginSuccess?: () => void
}

const loginSchema = yup.object().shape({
  email: yup.string().email("ایمیل نامعتبر است").required("ایمیل الزامی است"),
  password: yup.string().required("رمز عبور الزامی است"),
})

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const dispatch: AppDispatch = useDispatch()
  const [serverError, setServerError] = useState("")
  const {
    isOpen: isForgotPasswordOpen,
    onOpen: onForgotPasswordOpen,
    onOpenChange: onForgotPasswordOpenChange,
  } = useDisclosure()

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormFields>({
    resolver: yupResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormFields) => {
    setServerError("")
    try {
      const userData = await authService.login(data)
      localStorage.setItem("access_token", userData.access)
      localStorage.setItem("refresh_token", userData.refresh)
      dispatch(loginSuccess(userData))
      dispatch(fetchUserProfile())
      if (onLoginSuccess) {
        onLoginSuccess()
      }
    } catch {
      setServerError("ورود انجام نشد. دوباره تلاش کنید.")
    }
  }

  return (
    <>
      <form className="auth-form flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        {serverError && <p className="auth-form__error" role="alert">{serverError}</p>}
        <Controller
          name="email"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <Input
              radius="full"
              {...field}
              isRequired
              label="ایمیل"
              placeholder="ایمیل خود را وارد کنید"
              type="email"
              autoComplete="username"
              inputMode="email"
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message}
              labelPlacement="outside"
              classNames={{
                label: "text-right",
                input: "text-right",
                inputWrapper:
                  "rounded-full bg-gray2 data-[hover=true]:bg-gray2 data-[focus=true]:bg-gray2 data-[disabled=true]:bg-gray2 data-[has-value=false]:bg-gray2 data-[filled=false]:bg-gray2",
              }}
            />
          )}
        />
        <Controller
          name="password"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <Input
              radius="full"
              {...field}
              isRequired
              label="رمز عبور"
              placeholder="رمز عبور خود را وارد کنید"
              type="password"
              autoComplete="current-password"
              isInvalid={!!errors.password}
              errorMessage={errors.password?.message}
              labelPlacement="outside"
              classNames={{
                label: "text-right",
                input: "text-right",
                inputWrapper:
                  "rounded-full bg-gray2 data-[hover=true]:bg-gray2 data-[focus=true]:bg-gray2 data-[disabled=true]:bg-gray2 data-[has-value=false]:bg-gray2 data-[filled=false]:bg-gray2",
              }}
            />
          )}
        />
        <div className="flex items-center justify-between">
          <Link
            href="#"
            size="sm"
            onClick={(e) => {
              e.preventDefault()
              onForgotPasswordOpen()
            }}
          >
            رمز عبور خود را فراموش کرده اید؟
          </Link>
        </div>
        <GlassButton color="primary" type="submit" isLoading={isSubmitting} aria-busy={isSubmitting || undefined}>
          {isSubmitting ? "در حال ورود…" : "ورود"}
        </GlassButton>
        <div className="flex items-center gap-4">
          <hr className="w-full" />
          <span>یا</span>
          <hr className="w-full" />
        </div>
        <SocialButtons />
      </form>
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onOpenChange={onForgotPasswordOpenChange}
      />
    </>
  )
}

export default LoginForm
