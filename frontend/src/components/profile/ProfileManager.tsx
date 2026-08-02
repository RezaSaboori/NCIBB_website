// frontend/src/components/profile/ProfileManager.tsx
import React, { useState, useEffect, useCallback } from "react"
import { Spinner, Alert, Button } from "@heroui/react"
import { useSelector, useDispatch } from "react-redux"
// ts-expect-error JS module without types
import { profileService } from "../../dataset_services/profileService"
import { logoutSuccess } from "../../store/authSlice" // Import logout action
import { authService } from "../../dataset_services/authService"
import { useNavigate, useOutletContext } from "react-router-dom"
// ts-expect-error JSX module without types
import ProfileForm from "./ProfileForm"
// ts-expect-error JSX module without types
import SecuritySettings from "./SecuritySettings"
// ts-expect-error JSX module without types
import PreferencesSettings from "./PreferencesSettings"
// ts-expect-error JSX module without types
import ActivityLog from "./ActivityLog"
import Sidebar from "./sidebar"
import { UserProjectsList } from "./UserProjectsList"
// ts-expect-error JSX module without types
import CompletionCard from "./CompletionCard"
import { RootState } from "../../store/store"

// Removed unused User interface (came from JS store)

interface ProfileData {
  preferences: any
  // Add other profile properties here
}

const ProfileManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("dashboard")
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  )
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState<boolean>(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { setSidebar } = useOutletContext<any>()

  useEffect(() => {
    setSidebar(
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />
    )
    return () => setSidebar(null)
  }, [activeTab, setSidebar])

  const handleLogout = async () => {
    try {
      await authService.logout()
      dispatch(logoutSuccess())
      navigate("/")
    } catch (error) {
      console.error("Logout failed:", error)
      // Optionally, show an error message to the user
    }
  }

  const loadProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false)
      setError("You are not logged in.")
      return
    }
    try {
      setLoading(true)
      const data = await profileService.getCurrentProfile()
      setProfileData(data)
      setError(null)
    } catch (err: any) {
      setError("Failed to load profile data")
      console.error("Profile load error:", err)
      if (err.response && err.response.status === 401) {
        dispatch(logoutSuccess()) // Dispatch logout if unauthorized
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
      // You might want to refresh the user data in Redux state here
      return response
    } catch (error) {
      throw error
    } finally {
      setSaving(false)
    }
  }

  // Privacy settings have been removed from the application

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" label="Loading profile..." />
      </div>
    )
  }

  if (error || !isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert
          color="danger"
          title="Access Denied"
          description={error || "Please log in to view your profile."}
          endContent={
            !isAuthenticated && (
              <Button as="a" href="/login" size="sm" variant="flat">
                Go to Login
              </Button>
            )
          }
        />
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p>No profile data found.</p>
      </div>
    )
  }

  const tabs = [
    {
      id: "dashboard",
      label: "داشبورد",
      content: (
        <div className="space-y-6">
          <CompletionCard
            data={(profileData as any)?.completion}
            onRefresh={loadProfile}
          />
          <ActivityLog userId={(user as any)?.id ?? ""} />
        </div>
      ),
    },
    {
      id: "profile",
      label: "پروفایل",
      content: (
        <ProfileForm
          profileData={profileData}
          onUpdate={handleProfileUpdate}
          saving={saving}
          onRefresh={loadProfile}
        />
      ),
    },
    {
      id: "messages",
      label: "پیام ها",
      content: <div className="p-4">بخش پیام‌ها در دسترس نیست.</div>,
    },
    {
      id: "projects",
      label: "پروژه ها",
      content: (
        <div className="p-4">
          <UserProjectsList />
        </div>
      ),
    },
    {
      id: "learning",
      label: "آموزش",
      content: (
        <div className="space-y-6">
          <PreferencesSettings
            preferencesData={profileData?.preferences}
            onUpdate={handleProfileUpdate}
            saving={saving}
          />
          <SecuritySettings
            userData={{ ...(user as any), ...(profileData as any) }}
            onUpdate={handleProfileUpdate}
            saving={saving}
          />
        </div>
      ),
    },
  ]

  return (
    <div className="p-6 ml-0 mr-7 w-100vw overflow-x-hidden">
      <div className="mx-auto w-full min-w-0">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12">
            {tabs.find((tab) => tab.id === activeTab)?.content}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileManager
