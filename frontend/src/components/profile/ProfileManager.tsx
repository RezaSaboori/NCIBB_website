import { useCallback, useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate, useOutletContext, useSearchParams } from "react-router-dom"

import { GlassCard } from "@/components/ui/GlassCard"
import { accountApi } from "@/dataset_services/accountApi"
import { authService } from "@/dataset_services/authService"
import type { LayoutContext } from "@/layouts/default"
import { logoutSuccess } from "@/store/authSlice"
import type { AppDispatch, RootState } from "@/store/store"

import AccountTab from "./account/AccountTab"
import { EmailVerificationCard } from "./account/EmailVerificationCard"
import { RolesTab } from "./admin/RolesTab"
import { UsersTab } from "./admin/UsersTab"
import DashboardTab from "./dashboard/DashboardTab"
import { GroupsTab } from "./groups/GroupsTab"
import { ResearchGroupsTab } from "./groups/ResearchGroupsTab"
import LearningTab from "./learning/LearningTab"
import MessagesTab from "./messages/MessagesTab"
import { AccountStatus } from "./shared/AccountStatus"
import SessionExpiredBanner from "./shared/SessionExpiredBanner"
import { useAccountQuery } from "./shared/useAccountQuery"
import { profileNavigation } from "./sidebar/navItems"
import ProfileSidebar from "./sidebar/ProfileSidebar"
import { WalletTab } from "./wallet/WalletTab"
import { useProfileWallet } from "./wallet/useProfileWallet"
import { UserProjectsList } from "./UserProjectsList"
import "./accountWorkspace.css"

export default function ProfileManager() {
  const [params] = useSearchParams()
  const activeTab = params.get("tab") ?? "dashboard"
  const [collapsed, setCollapsed] = useState(false)
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { setSidebar, setSidebarWidth } = useOutletContext<LayoutContext>()
  const query = useAccountQuery(useCallback(() => isAuthenticated ? accountApi.profile() : null, [isAuthenticated]))
  const profile = query.data
  const refresh = query.refresh
  const navigation = useMemo(() => profile ? profileNavigation(profile) : null, [profile])
  const canOpen = navigation && [...navigation.primary, ...navigation.bottom].some((item) => item.id === activeTab)
  useProfileWallet(isAuthenticated && (activeTab === "dashboard" || activeTab === "wallet"))

  const logout = useCallback(async () => {
    await authService.logout()
    dispatch(logoutSuccess())
    navigate("/")
  }, [dispatch, navigate])

  useEffect(() => {
    if (!isAuthenticated || !navigation) return
    setSidebar(
      <ProfileSidebar {...navigation} activeTab={activeTab} isCollapsed={collapsed}
        onLogout={() => void logout()} onToggleCollapse={() => setCollapsed((value) => !value)} />,
    )
    setSidebarWidth(collapsed ? 72 : 260)
    return () => { setSidebar(null) }
  }, [activeTab, collapsed, isAuthenticated, logout, navigation, setSidebar, setSidebarWidth])

  useEffect(() => {
    if (!isAuthenticated) return
    const refreshAccess = () => { if (document.visibilityState === "visible") void refresh() }
    window.addEventListener("focus", refreshAccess)
    return () => window.removeEventListener("focus", refreshAccess)
  }, [isAuthenticated, refresh])

  const update = async (data: Record<string, unknown>) => {
    const response = await accountApi.updateProfile(data)
    query.setData(response)
    return response
  }

  if (!isAuthenticated) return <SessionExpiredBanner message="برای مشاهده پروفایل وارد شوید." />

  if (!profile) return (
    <div className="page-content account-workspace">
      <AccountStatus loading={query.loading} error={query.error} retry={refresh} />
    </div>
  )

  const admin = profile.capabilities.includes("platform.admin")
  const renderTab = () => {
    if (!canOpen) return <div className="account-workspace__stack">
      <h1>دسترسی به این بخش در دسترس نیست</h1>
      <GlassCard size="sm"><Link className="glass ui-glass-button account-workspace__submit" to="/profile">بازگشت به داشبورد</Link></GlassCard>
    </div>
    switch (activeTab) {
      case "dashboard": return <DashboardTab profile={profile} />
      case "account": return <div className="account-workspace__stack">
        <EmailVerificationCard key={profile.email} email={profile.email} verified={profile.is_email_verified} />
        <AccountTab profileData={profile} onUpdate={update} onRefresh={refresh} />
      </div>
      case "wallet": return <WalletTab />
      case "messages": return <MessagesTab key="messages" userId={profile.id} />
      case "support": return <MessagesTab key="support" userId={profile.id} queue />
      case "projects": return <UserProjectsList />
      case "learning": return <LearningTab />
      case "users": return <UsersTab viewerId={profile.id} initialStatus={params.get("status") ?? ""} onAccessChanged={() => void refresh()} />
      case "roles": return <RolesTab />
      case "groups": return <GroupsTab admin={admin} memberships={profile.groups} />
      case "research": return <ResearchGroupsTab />
      default: return null
    }
  }

  return <div key={activeTab} className="page-content account-workspace ui-fade-in" dir="rtl">{renderTab()}</div>
}
