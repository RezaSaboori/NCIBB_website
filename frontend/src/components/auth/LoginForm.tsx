import { Input, Button, Link, useDisclosure } from "@heroui/react"
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
  const {
    isOpen: isForgotPasswordOpen,
    onOpen: onForgotPasswordOpen,
    onOpenChange: onForgotPasswordOpenChange,
  } = useDisclosure()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormFields>({
    resolver: yupResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormFields) => {
    try {
      const userData = await authService.login(data)
      localStorage.setItem("access_token", userData.access)
      localStorage.setItem("refresh_token", userData.refresh)
      dispatch(loginSuccess(userData))
      dispatch(fetchUserProfile())
      if (onLoginSuccess) {
        onLoginSuccess()
      }
    } catch (error) {
      console.error("Login failed:", error)
      // Handle login error (e.g., show an error message)
    }
  }

  return (
    <>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
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
        <Button color="primary" type="submit" radius="full">
          ورود
        </Button>
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
