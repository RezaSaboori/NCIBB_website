import { GlassButton } from "@/components/ui/GlassButton"
import { GlassCard } from "@/components/ui/GlassCard"
// frontend/src/components/profile/ProfileForm.jsx
import React, { useMemo, useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useDisclosure } from "@heroui/react"
import { ProfileModal } from "./shared/ProfileModal"
import { profileService } from "../../dataset_services/profileService"
import ImageCropModal from "./ImageCropModal"
import UserAvatar from "../common/UserAvatar"
import CompletionCard from "./CompletionCard"
import AccountFields from "./account/AccountFields"
import { useProfileSaveFeedback } from "./account/useProfileSaveFeedback"

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

const ProfileForm = ({ profileData, onUpdate, onRefresh }) => {
  const [basicEditMode, setBasicEditMode] = useState(false)
  const [professionalEditMode, setProfessionalEditMode] = useState(false)
  const [completionData, setCompletionData] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const fileInputRef = useRef(null)
  const { feedback, save, clearFailure } = useProfileSaveFeedback()
  const saving = feedback?.phase === "saving"
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

  const savedValues = useMemo(() => ({
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
  }), [profileData])
  const lastSavedValues = useRef(savedValues)
  const { control, handleSubmit, reset, formState: { dirtyFields, errors, isValid } } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: savedValues,
    mode: "onChange",
  })

  React.useEffect(() => {
    loadCompletionData()
  }, [profileData])

  React.useEffect(() => {
    if (Object.entries(savedValues).every(([field, value]) => lastSavedValues.current[field] === value)) return
    lastSavedValues.current = savedValues
    reset(savedValues)
  }, [savedValues, reset])

  const loadCompletionData = async () => {
    try {
      const data = await profileService.getCompletionStatus()
      setCompletionData(data)
    } catch (error) {
      console.error("Failed to load completion data:", error)
    }
  }

  const onSubmitBasic = async (formData) => {
    const { first_name, last_name, email, phone, gender, city, state_province, country } = formData
    const saved = await save("basic", () => onUpdate({
      first_name, last_name, email, phone, gender, city, state_province, country,
    }))
    if (saved) {
      setBasicEditMode(false)
      await onRefresh()
      await loadCompletionData()
    }
  }

  const onSubmitProfessional = async (formData) => {
    const { job_title, company, department } = formData
    const saved = await save("professional", () => onUpdate({ job_title, company, department }))
    if (saved) {
      setProfessionalEditMode(false)
      await onRefresh()
      await loadCompletionData()
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
  const portrait = (
    <UserAvatar
      name={profile?.full_name || "کاربر ناشناس"}
      size="lg"
      src={profile?.profile_picture_url}
    />
  )

  return (
    <div className="account-workspace__stack">
      <GlassCard className="account-workspace__identity" size="sm" heading={<h2>تصویر پروفایل</h2>}
        footer={<>
          <GlassButton color="primary" onPress={() => fileInputRef.current?.click()}>تغییر عکس</GlassButton>
          {profile?.profile_picture_url && <GlassButton onPress={onDeleteOpen}>حذف عکس</GlassButton>}
        </>}>
        <div className="account-workspace__identity-body">
          {profile?.profile_picture_url ? portrait : (
            <button aria-label="تعامل با آواتار شیشه‌ای" className="account-workspace__avatar-trigger" type="button">
              {portrait}
            </button>
          )}
          <div>
            <strong>{profile?.full_name || "کاربر ناشناس"}</strong>
            {profile?.job_title && <p className="account-workspace__muted">{profile.job_title}{profile.company ? ` در ${profile.company}` : ""}</p>}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
        </div>
      </GlassCard>

      {completionData && <CompletionCard data={completionData} />}

      <AccountFields kind="basic" control={control} dirtyFields={dirtyFields} errors={errors} editing={basicEditMode}
        onEdit={() => { clearFailure("basic"); setBasicEditMode(true) }}
        onCancel={() => { setBasicEditMode(false); reset() }}
        onSubmit={handleSubmit(onSubmitBasic)} saving={saving} isValid={isValid}
        phase={feedback?.section === "basic" ? feedback.phase : undefined} />
      <AccountFields kind="professional" control={control} dirtyFields={dirtyFields} errors={errors} editing={professionalEditMode}
        onEdit={() => { clearFailure("professional"); setProfessionalEditMode(true) }}
        onCancel={() => { setProfessionalEditMode(false); reset() }}
        onSubmit={handleSubmit(onSubmitProfessional)} saving={saving} isValid={isValid}
        phase={feedback?.section === "professional" ? feedback.phase : undefined} />

      <ImageCropModal isOpen={isCropOpen} image={imageFile} onSave={handleImageUpload} onClose={onCropClose} />
      <ProfileModal isOpen={isDeleteOpen} onClose={onDeleteClose} title="حذف عکس پروفایل" footer={(
        <>
          <GlassButton onPress={onDeleteClose}>لغو</GlassButton>
          <GlassButton color="danger" onPress={handleImageDelete}>حذف</GlassButton>
        </>
      )}>
        <p>آیا عکس پروفایل حذف شود؟</p>
      </ProfileModal>
    </div>
  )
}

export default ProfileForm
