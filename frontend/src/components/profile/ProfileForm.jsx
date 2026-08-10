// frontend/src/components/profile/ProfileForm.jsx
import React, { useState, useRef } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Textarea,
  Button,
  Select,
  SelectItem,
  Divider,
  Progress,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react"
import { Icon } from "@iconify/react"
import { profileService } from "../../dataset_services/profileService"
import ImageCropModal from "./ImageCropModal"
import UserAvatar from "../common/UserAvatar"
import CompletionCard from "./CompletionCard"
import "./modal.css"

const profileSchema = yup.object({
  first_name: yup
    .string()
    .min(2, "نام باید حداقل ۲ کاراکتر باشد")
    .max(50, "نام باید کمتر از ۵۰ کاراکتر باشد")
    .required("نام الزامی است"),
  last_name: yup
    .string()
    .min(2, "نام خانوادگی باید حداقل ۲ کاراکتر باشد")
    .max(50, "نام خانوادگی باید کمتر از ۵۰ کاراکتر باشد")
    .required("نام خانوادگی الزامی است"),
  email: yup.string().email("ایمیل نامعتبر است").required("ایمیل الزامی است"),
  phone: yup
    .string()
    .matches(/^(\+98|0)?9\d{9}$/, "شماره موبایل معتبر نیست")
    .required("شماره موبایل الزامی است"),
  job_title: yup.string().max(200, "عنوان شغلی باید کمتر از ۲۰۰ کاراکتر باشد"),
  company: yup.string().max(200, "نام شرکت باید کمتر از ۲۰۰ کاراکتر باشد"),
})

const genderOptions = [
  { key: "male", label: "مرد" },
  { key: "female", label: "زن" },
]

const ProfileForm = ({ profileData, onUpdate, saving, onRefresh }) => {
  const [basicEditMode, setBasicEditMode] = useState(false)
  const [professionalEditMode, setProfessionalEditMode] = useState(false)
  const [completionData, setCompletionData] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const fileInputRef = useRef(null)
  const {
    isOpen: isCropOpen,
    onOpen: onCropOpen,
    onClose: onCropClose,
  } = useDisclosure()
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      first_name: profileData?.profile?.first_name || "",
      last_name: profileData?.profile?.last_name || "",
      email: profileData?.email || "",
      phone: profileData?.phone || "",
      job_title: profileData?.profile?.job_title || "",
      company: profileData?.profile?.company || "",
      department: profileData?.profile?.department || "",
      city: profileData?.profile?.city || "",
      state_province: profileData?.profile?.state_province || "",
      country: profileData?.profile?.country || "",
      gender: profileData?.profile?.gender || "",
    },
    mode: "onChange",
  })

  React.useEffect(() => {
    loadCompletionData()
  }, [profileData])

  React.useEffect(() => {
    // Reset form when profileData changes
    if (profileData) {
      reset({
        first_name: profileData.profile.first_name || "",
        last_name: profileData.profile.last_name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        job_title: profileData.profile.job_title || "",
        company: profileData.profile.company || "",
        department: profileData.profile.department || "",
        city: profileData.profile.city || "",
        state_province: profileData.profile.state_province || "",
        country: profileData.profile.country || "",
        gender: profileData.profile.gender || "",
      })
    }
  }, [profileData, reset])

  const loadCompletionData = async () => {
    try {
      const data = await profileService.getCompletionStatus()
      setCompletionData(data)
    } catch (error) {
      console.error("Failed to load completion data:", error)
    }
  }

  const onSubmitBasic = async (formData) => {
    try {
      const basicPayload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
      }
      await onUpdate(basicPayload)
      setBasicEditMode(false)
      await onRefresh()
      await loadCompletionData()
    } catch (error) {
      console.error("Failed to update basic info:", error)
    }
  }

  const onSubmitProfessional = async (formData) => {
    try {
      const professionalPayload = {
        job_title: formData.job_title,
        company: formData.company,
        department: formData.department,
        city: formData.city,
        state_province: formData.state_province,
        country: formData.country,
      }
      await onUpdate(professionalPayload)
      setProfessionalEditMode(false)
      await onRefresh()
      await loadCompletionData()
    } catch (error) {
      console.error("Failed to update professional info:", error)
    }
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("حجم فایل باید کمتر از ۵ مگابایت باشد")
        return
      }
      setImageFile(file)
      onCropOpen()
    }
  }

  const handleImageUpload = async (croppedImageBlob) => {
    try {
      const formData = new FormData()
      formData.append("profile_picture", croppedImageBlob, "profile.jpg")

      await profileService.uploadProfilePicture(formData)
      onCropClose()
      setImageFile(null)
      await onRefresh()
    } catch (error) {
      console.error("Failed to upload image:", error)
    }
  }

  const handleImageDelete = async () => {
    try {
      await profileService.removeProfilePicture()
      onDeleteClose()
      await onRefresh()
    } catch (error) {
      console.error("Failed to delete image:", error)
    }
  }

  const profile = profileData?.profile

  return (
    <div
      className="u-container u-container--lg text-right overflow-hidden rounded-none"
      style={{ "--radius": "0" }}
    >
      {/* Instruction and Avatar side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 items-stretch w-full">
        <Card className="h-full w-full lg:order-2 shadow-none rounded-4xl p-[var(--gap)] bg-[var(--color-gray1)]">
          <CardBody className="h-full flex items-center">
            <p>
              جهت به‌روزرسانی و تغییر اطلاعات، روی «ویرایش» هر بخش کلیک کرده و
              بعد از اتمام بر روی «ذخیره تغییرات» کلیک کنید.
            </p>
          </CardBody>
        </Card>

        <Card className="h-52 w-52 lg:order-1 lg:justify-self-start p-0 shadow-none bg-transparent">
          <CardBody className="flex flex-col h-fit items-center p-0">
            <div className="relative">
              <UserAvatar
                src={profile?.profile_picture_url}
                name={profile?.full_name || "کاربر ناشناس"}
                seed={profileData?.id ?? profileData?.email ?? profile?.full_name}
                size="lg"
                className="shadow-lg"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              <Button
                isIconOnly
                size="sm"
                variant="solid"
                color="primary"
                className="absolute -bottom-1 -right-0 rounded-full"
                onPress={() => fileInputRef.current?.click()}
              >
                <Icon icon="fluent:edit-24-regular" className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex flex-col items-center text-center mt-auto r">
              <div className="flex flex-col text-center items-center">
                <h3 className="text-lg font-semibold">
                  {profile?.full_name || "کاربر ناشناس"}
                </h3>
                <p className="text-small text-default-500">
                  {profile?.job_title
                    ? `${profile.job_title}${profile.company ? ` در ${profile.company}` : ""}`
                    : "عنوان شغلی ثبت نشده است"}
                </p>
              </div>

              {profile?.profile_picture_url && (
                <Button
                  color="danger"
                  variant="flat"
                  size="sm"
                  startContent={
                    <Icon icon="heroicons:trash" className="w-4 h-4" />
                  }
                  onPress={onDeleteOpen}
                >
                  حذف عکس
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {completionData && (
        <CompletionCard data={completionData} onRefresh={loadCompletionData} />
      )}

      <div className="grid grid-cols-1 gap-[var(--gap)] ">
        {/* Profile Form - split into two sections */}
        <div className="space-y-[var(--gap)]">
          {/* Basic Information Card */}
          <Card className="shadow-none rounded-4xl p-[var(--gap)] p-t-0 bg-[var(--color-gray1)] mt-16">
            <CardHeader className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">اطلاعات پایه</h3>
              {!basicEditMode ? (
                <Button
                  color="primary"
                  className="rounded-full"
                  variant="flat"
                  startContent={
                    <Icon icon="heroicons:pencil" className="w-4 h-4" />
                  }
                  onPress={() => setBasicEditMode(true)}
                >
                  ویرایش
                </Button>
              ) : (
                <div className="flex gap-[calc(var(--gap)/3)]">
                  <Button
                    color="primary"
                    className="rounded-full"
                    startContent={
                      <Icon icon="heroicons:check" className="w-4 h-4" />
                    }
                    onPress={handleSubmit(onSubmitBasic)}
                    isLoading={saving}
                    isDisabled={!isValid || !isDirty}
                  >
                    ذخیره تغییرات
                  </Button>
                  <Button
                    variant="flat"
                    className="rounded-full"
                    onPress={() => {
                      setBasicEditMode(false)
                      reset()
                    }}
                  >
                    لغو
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit(onSubmitBasic)}>
                <div
                  className="grid grid-cols-1 md:grid-cols-2 gap-[calc(var(--gap)/2)]"
                  dir="rtl"
                >
                  <Controller
                    name="first_name"
                    control={control}
                    render={({ field }) => (
                      <Input
                        radius="full"
                        {...field}
                        label="نام"
                        placeholder="نام خود را وارد کنید"
                        isRequired
                        isDisabled={!basicEditMode}
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
                    render={({ field }) => (
                      <Input
                        radius="full"
                        {...field}
                        label="نام خانوادگی"
                        placeholder="نام خانوادگی خود را وارد کنید"
                        isRequired
                        isDisabled={!basicEditMode}
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
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <Input
                        radius="full"
                        {...field}
                        label="ایمیل"
                        isReadOnly
                        isDisabled={true}
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
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <Input
                        radius="full"
                        {...field}
                        label="شماره موبایل"
                        placeholder="شماره موبایل خود را وارد کنید"
                        isDisabled={!basicEditMode}
                        isInvalid={!!errors.phone}
                        errorMessage={errors.phone?.message}
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
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <Select
                        radius="full"
                        {...field}
                        label="جنسیت"
                        placeholder="جنسیت"
                        isDisabled={!basicEditMode}
                        selectedKeys={field.value ? [field.value] : []}
                        onSelectionChange={(keys) => {
                          const selectedValue = Array.from(keys)[0]
                          field.onChange(selectedValue || "")
                        }}
                        labelPlacement="outside"
                        classNames={{
                          label: "text-right",
                          value: "text-right",
                          trigger:
                            "rounded-full text-right bg-gray2 data-[hover=true]:bg-gray2 data-[focus=true]:bg-gray2 data-[disabled=true]:bg-gray2 data-[placeholder=true]:bg-gray2 data-[has-value=false]:bg-gray2",
                        }}
                      >
                        {genderOptions.map((option) => (
                          <SelectItem key={option.key} value={option.key}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </Select>
                    )}
                  />
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      <Input
                        radius="full"
                        {...field}
                        label="شهر"
                        placeholder="مثلا: تهران"
                        isDisabled={!basicEditMode}
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
                    name="state_province"
                    control={control}
                    render={({ field }) => (
                      <Input
                        radius="full"
                        {...field}
                        label="استان"
                        placeholder="مثلا: تهران"
                        isDisabled={!basicEditMode}
                        labelPlacement="outside"
                        classNames={{
                          label: "text-right",
                          input: "text-right",
                          inputWrapper:
                            "bg-gray2 data-[hover=true]:bg-gray2 data-[focus=true]:bg-gray2 data-[disabled=true]:bg-gray2",
                        }}
                      />
                    )}
                  />
                  <Controller
                    name="country"
                    control={control}
                    render={({ field }) => (
                      <Input
                        radius="full"
                        {...field}
                        label="کشور"
                        placeholder="مثلا: ایران"
                        isDisabled={!basicEditMode}
                        labelPlacement="outside"
                        classNames={{
                          label: "text-right",
                          input: "text-right",
                          inputWrapper:
                            "bg-gray2 data-[hover=true]:bg-gray2 data-[focus=true]:bg-gray2 data-[disabled=true]:bg-gray2",
                        }}
                      />
                    )}
                  />
                </div>
              </form>
            </CardBody>
          </Card>

          {/* Professional Information Card */}
          <Card className="shadow-none rounded-4xl p-[var(--gap)] p-t-0 bg-[var(--color-gray1)]">
            <CardHeader className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">اطلاعات حرفه ای</h3>
              {!professionalEditMode ? (
                <Button
                  color="primary"
                  className="rounded-full"
                  variant="flat"
                  startContent={
                    <Icon icon="heroicons:pencil" className="w-4 h-4" />
                  }
                  onPress={() => setProfessionalEditMode(true)}
                >
                  ویرایش
                </Button>
              ) : (
                <div className="flex gap-[calc(var(--gap)/3)]">
                  <Button
                    color="primary"
                    className="rounded-full"
                    startContent={
                      <Icon icon="heroicons:check" className="w-4 h-4" />
                    }
                    onPress={handleSubmit(onSubmitProfessional)}
                    isLoading={saving}
                    isDisabled={!isValid || !isDirty}
                  >
                    ذخیره تغییرات
                  </Button>
                  <Button
                    variant="flat"
                    className="rounded-full"
                    onPress={() => {
                      setProfessionalEditMode(false)
                      reset()
                    }}
                  >
                    لغو
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardBody>
              <form
                onSubmit={handleSubmit(onSubmitProfessional)}
                className="space-y-[var(--gap)]"
              >
                <div
                  className="grid grid-cols-1 md:grid-cols-2 gap-[calc(var(--gap)/2)]"
                  dir="rtl"
                >
                  <Controller
                    name="job_title"
                    control={control}
                    render={({ field }) => (
                      <Input
                        radius="full"
                        {...field}
                        label="عنوان شغلی"
                        placeholder="مثلا: مهندس نرم افزار"
                        isDisabled={!professionalEditMode}
                        isInvalid={!!errors.job_title}
                        errorMessage={errors.job_title?.message}
                        labelPlacement="outside"
                        classNames={{
                          label: "text-right",
                          input: "text-right",
                          inputWrapper:
                            "bg-gray2 data-[hover=true]:bg-gray2 data-[focus=true]:bg-gray2 data-[disabled=true]:bg-gray2",
                        }}
                      />
                    )}
                  />
                  <Controller
                    name="company"
                    control={control}
                    render={({ field }) => (
                      <Input
                        radius="full"
                        {...field}
                        label="شرکت"
                        placeholder="مثلا: انستیتو قلب رجایی"
                        isDisabled={!professionalEditMode}
                        isInvalid={!!errors.company}
                        errorMessage={errors.company?.message}
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
                    name="department"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="دپارتمان"
                        placeholder="مثلا: نوآوری و فناوری "
                        isDisabled={!professionalEditMode}
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

                {/* Location moved to Basic Information */}
              </form>
            </CardBody>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={isCropOpen}
        onOpenChange={onCropClose}
        className="modal-container"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                تصویر پروفایل
              </ModalHeader>
              <ModalBody>
                <ImageCropModal
                  imageFile={imageFile}
                  onCropComplete={handleImageUpload}
                  onClose={onClose}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  لغو
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isDeleteOpen}
        onOpenChange={onDeleteClose}
        className="modal-container"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                حذف عکس پروفایل
              </ModalHeader>
              <ModalBody>
                <p>
                  آیا از حذف عکس پروفایل اطمینان دارید؟ این عمل برگشت پذیر نیست.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" onPress={handleImageDelete}>
                  حذف
                </Button>
                <Button color="primary" variant="flat" onPress={onClose}>
                  لغو
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

export default ProfileForm
