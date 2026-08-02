import { Input, Button } from "@heroui/react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { authService } from "../../dataset_services/authService"
import { loginSuccess } from "../../store/authSlice"
import { fetchUserProfile } from "../../store/profileSlice"
import { AppDispatch } from "../../store/store"
import { SocialButtons } from "./SocialButtons"
import { useState } from "react"

type RegisterFormFields = {
  username: string
  first_name: string
  last_name: string
  email: string
  password: string
  password_confirm: string
}

type ServerErrorValue = string | string[] | null | undefined
type ServerError = Record<string, ServerErrorValue> | string

const registerSchema = yup.object().shape({
  username: yup.string().required("نام کاربری الزامی است"),
  first_name: yup.string().required("نام الزامی است"),
  last_name: yup.string().required("نام خانوادگی الزامی است"),
  email: yup.string().email("ایمیل نامعتبر است").required("ایمیل الزامی است"),
  password: yup
    .string()
    .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد")
    .required("رمز عبور الزامی است"),
  password_confirm: yup
    .string()
    .oneOf([yup.ref("password")], "رمزهای عبور باید مطابقت داشته باشند")
    .required("تایید رمز عبور الزامی است"),
})

type RegisterFormProps = {
  onRegisterSuccess?: () => void
}

const RegisterForm = ({ onRegisterSuccess }: RegisterFormProps) => {
  const dispatch: AppDispatch = useDispatch()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<ServerError | null>(null)
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormFields>({
    resolver: yupResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormFields) => {
    try {
      const userData = await authService.register(data)
      localStorage.setItem("access_token", userData.access)
      localStorage.setItem("refresh_token", userData.refresh)
      dispatch(loginSuccess(userData))
      dispatch(fetchUserProfile())
      if (onRegisterSuccess) {
        onRegisterSuccess()
      } else {
        navigate("/")
      }
    } catch (error: any) {
      console.error("Registration failed:", error)
      setServerError(error?.response?.data ?? "An unexpected error occurred.")
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      {serverError && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">خطا:</strong>
          <span className="block sm:inline ml-2">
            {typeof serverError === "string" ? (
              <span>{serverError}</span>
            ) : (
              Object.entries(serverError).map(([key, value]) => {
                const normalized = Array.isArray(value)
                  ? value.join(", ")
                  : (value ?? "")
                return <div key={key}>{`${key}: ${normalized}`}</div>
              })
            )}
          </span>
        </div>
      )}
      <Controller
        name="username"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <Input
            radius="full"
            {...field}
            isRequired
            label="نام کاربری"
            placeholder="نام کاربری خود را وارد کنید"
            isInvalid={!!errors.username}
            errorMessage={errors.username?.message}
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
      <div className="flex gap-4" dir="rtl">
        <Controller
          name="first_name"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <Input
              radius="full"
              {...field}
              isRequired
              label="نام"
              placeholder="نام خود را وارد کنید"
              isInvalid={!!errors.first_name}
              errorMessage={errors.first_name?.message}
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
          name="last_name"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <Input
              radius="full"
              {...field}
              isRequired
              label="نام خانوادگی"
              placeholder="نام خانوادگی خود را وارد کنید"
              isInvalid={!!errors.last_name}
              errorMessage={errors.last_name?.message}
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
      </div>
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
      <Controller
        name="password_confirm"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <Input
            radius="full"
            {...field}
            isRequired
            label="تایید رمز عبور"
            placeholder="رمز عبور خود را تایید کنید"
            type="password"
            isInvalid={!!errors.password_confirm}
            errorMessage={errors.password_confirm?.message}
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
      <Button color="primary" type="submit">
        ثبت نام
      </Button>
      <div className="flex items-center gap-4">
        <hr className="w-full" />
        <span>یا</span>
        <hr className="w-full" />
      </div>
      <SocialButtons />
    </form>
  )
}

export default RegisterForm
