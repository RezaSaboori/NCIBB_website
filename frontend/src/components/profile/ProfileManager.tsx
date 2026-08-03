// frontend/src/components/profile/ProfileManager.tsx
import React, { useState, useEffect, useCallback } from "react"
import { Spinner } from "@heroui/react"
import { useSelector, useDispatch } from "react-redux"
// @ts-expect-error JS module without types
import { profileService } from "../../dataset_services/profileService"
import { logoutSuccess } from "../../store/authSlice"
import { authService } from "../../dataset_services/authService"
import { useNavigate, useOutletContext } from "react-router-dom"
import { RootState } from "../../store/store"

import ProfileSidebar from "./sidebar/ProfileSidebar"
import SessionExpiredBanner from "./shared/SessionExpiredBanner"
import DashboardTab from "./dashboard/DashboardTab"
import AccountTab from "./account/AccountTab"
import MessagesTab from "./messages/MessagesTab"
import { UserProjectsList } from "./UserProjectsList"
import LearningTab from "./learning/LearningTab"
import SecurityTab from "./security/SecurityTab"

interface ProfileData {
  preferences: any
  completion?: any
  [key: string]: any
}

type ProfileTab = "dashboard" | "account" | "messages" | "projects" | "learning"

const ProfileManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ProfileTab>("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false)
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState<boolean>(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { setSidebar, setSidebarWidth } = useOutletContext<any>()

  const handleLogout = async () => {
    try {
      await authService.logout()
      dispatch(logoutSuccess())
      navigate("/")
    } catch (err) {
      console.error("Logout failed:", err)
    }
  }

  const SIDEBAR_EXPANDED_WIDTH = 260
  const SIDEBAR_COLLAPSED_WIDTH = 72

  useEffect(() => {
    setSidebar(
      <ProfileSidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as ProfileTab)}
        onLogout={handleLogout}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />
    )
    setSidebarWidth(sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH)
    return () => {
      setSidebar(null)
      setSidebarWidth(260)
    }
  }, [activeTab, setSidebar, setSidebarWidth, sidebarCollapsed])

  const loadProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const data = await profileService.getCurrentProfile()
      setProfileData(data)
      setError(null)
    } catch (err: any) {
      setError("خطا در بارگذاری اطلاعات پروفایل")
      console.error("Profile load error:", err)
      if (err?.response?.status === 401) {
        dispatch(logoutSuccess())
      }
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, dispatch])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const handleProfileUpdate = async (updatedData: any) => {
    try {
      setSaving(true)
      const response = await profileService.updateProfile(updatedData)
      setProfileData((prev) => ({ ...prev, profile: response }) as ProfileData)
      return response
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" label="در حال بارگذاری..." />
      </div>
    )
  }

  // Session expired or unauthenticated — show in-page modal trigger, no redirect
  if (!isAuthenticated) {
    return (
      <SessionExpiredBanner message={error ?? "برای مشاهده پروفایل وارد شوید."} />
    )
  }

  if (!profileData) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p>اطلاعات پروفایل یافت نشد.</p>
      </div>
    )
  }

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardTab
            completion={(profileData as any)?.completion}
            userId={(user as any)?.id ?? ""}
            onRefresh={loadProfile}
          />
        )
      case "account":
        return (
          <AccountTab
            profileData={profileData}
            onUpdate={handleProfileUpdate}
            saving={saving}
            onRefresh={loadProfile}
          />
        )
      case "messages":
        return <MessagesTab />
      case "projects":
        return <UserProjectsList />
      case "learning":
        return (
          <LearningTab
            preferencesData={profileData?.preferences}
            onUpdate={handleProfileUpdate}
            saving={saving}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="page-content">
      {renderTab()}
    </div>
  )
}

export default ProfileManager