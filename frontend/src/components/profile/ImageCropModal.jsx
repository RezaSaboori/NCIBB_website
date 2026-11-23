import { useEffect, useState } from "react"
import { ProfileModal } from "./shared/ProfileModal"
import { GlassButton } from "@/components/ui/GlassButton"

export default function ImageCropModal({ isOpen, onClose, image, onSave }) {
  const [preview, setPreview] = useState("")

  useEffect(() => {
    if (!image || !isOpen) return
    const url = URL.createObjectURL(image)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [image, isOpen])

  return (
    <ProfileModal isOpen={isOpen} onClose={onClose} title="تصویر پروفایل" footer={(
      <>
        <GlassButton onPress={onClose}>لغو</GlassButton>
        <GlassButton color="primary" isDisabled={!image} onPress={() => onSave(image)}>ذخیره</GlassButton>
      </>
    )}>
      {preview && <img src={preview} alt="پیش‌نمایش عکس پروفایل" className="account-workspace__picture" />}
    </ProfileModal>
  )
}
