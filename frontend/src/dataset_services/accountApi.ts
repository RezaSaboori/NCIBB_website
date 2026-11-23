import axios from "axios"
import api from "./api"
import type {
  AccountGroup, AccountProfile, Adjustment, AdminProject, AuditEvent, ComposeMessage, Destination, DirectoryUser,
  Group, GroupMember, LedgerEntry, Mentorship, Page, Role, Thread, ThreadMessage, UserDetail, Wallet,
} from "@/types/account"

const get = async <T,>(path: string, params?: Record<string, string | number | undefined>) =>
  (await api.get<T>(path, { params })).data
const post = async <T,>(path: string, data?: unknown) => (await api.post<T>(path, data)).data
const patch = async <T,>(path: string, data: unknown) => (await api.patch<T>(path, data)).data
const put = async <T,>(path: string, data: unknown) => (await api.put<T>(path, data)).data

const profile = "/auth/profile/me/"
const auth = "/auth/"
const users = `${auth}users/`
const roles = `${auth}roles/`
const groups = `${auth}groups/`
const threads = "/messaging/threads/"
export type ScopedCatalog = Record<Role["scope"], Record<string, string>>
export type GroupLedger = Page<LedgerEntry> & { balance: string }

export const accountApi = {
  profile: () => get<AccountProfile>(profile),
  updateProfile: (data: Record<string, unknown>) => patch<AccountProfile>(profile, data),
  requestVerification: () => post<void>(`${auth}email-verification/`),
  verifyEmail: (token: string) => post<void>(`${auth}email-verification/confirm/`, { token }),
  wallet: () => get<Wallet>("/credits/"),
  creditHistory: (page = 1) => get<Page<LedgerEntry>>("/credits/transactions/", { page }),
  messageCounts: () => get<{ unread_count: number }>("/messaging/stats/"),
  platformCounts: () => get<{ total_users: number; active_users: number; total_projects: number }>("/core/admin-stats/"),
  users: (page = 1, search = "", role = "", status = "") =>
    get<Page<DirectoryUser>>(users, { page, search, role: role || undefined, is_active: status || undefined }),
  user: (id: number) => get<UserDetail>(`${users}${id}/`),
  changeAccess: (id: number, data: { roles?: number[]; is_active?: boolean }) =>
    patch<DirectoryUser>(`${users}${id}/access/`, data),
  projects: (id: number, page: number) => get<Page<AdminProject>>(`${users}${id}/projects/`, { page }),
  userThreads: (id: number, page: number) => get<Page<Thread>>(`${users}${id}/conversations/`, { page }),
  userThreadMessages: (id: number, threadId: number, page: number) =>
    get<Page<ThreadMessage>>(`${users}${id}/conversations/${threadId}/`, { page }),
  userCreditHistory: (id: number, page: number) => get<Page<LedgerEntry>>(`${users}${id}/credits/`, { page }),
  adjustUser: (id: number, data: Adjustment) => post<LedgerEntry>(`${users}${id}/credits/`, data),
  userAudit: (id: number, page: number) => get<Page<AuditEvent>>(`${users}${id}/audit/`, { page }),
  roles: (page = 1) => get<Page<Role>>(roles, { page }),
  allRoles: async () => {
    const first = await get<Page<Role>>(roles)
    const remaining = await Promise.all(Array.from(
      { length: Math.max(0, Math.ceil(first.count / 20) - 1) },
      (_, index) => get<Page<Role>>(roles, { page: index + 2 }),
    ))
    return [...first.results, ...remaining.flatMap((page) => page.results)]
  },
  roleCatalog: () => get<ScopedCatalog>(`${auth}role-capabilities/`),
  createRole: (data: Omit<Role, "id" | "builtin">) => post<Role>(roles, data),
  editRole: (id: number, data: Pick<Role, "label" | "capabilities">) => patch<Role>(`${roles}${id}/`, data),
  groups: (page = 1, search = "") => get<Page<Group>>(groups, { page, search }),
  createGroup: (data: Omit<Group, "id">) => post<Group>(groups, data),
  editGroup: (id: number, data: Omit<Group, "id">) => patch<Group>(`${groups}${id}/`, data),
  groupMembers: (id: number, page = 1, search = "") => get<Page<GroupMember>>(`${groups}${id}/members/`, { page, search }),
  researchGroups: () => get<Array<AccountGroup & { contacts: Array<{ id: number; name: string }> }>>(`${auth}research-groups/`),
  changeMembership: (id: number, userId: number, data: { roles: number[]; active: boolean }) =>
    put<GroupMember>(`${groups}${id}/members/${userId}/`, data),
  changeSpending: (id: number, membershipId: number, can_spend: boolean) =>
    patch<GroupMember>(`${groups}${id}/spending/${membershipId}/`, { can_spend }),
  groupWallet: (id: number, page = 1) => get<GroupLedger>(`${groups}${id}/wallet/`, { page }),
  adjustGroup: (id: number, data: Adjustment) => post<LedgerEntry>(`${groups}${id}/wallet/`, data),
  mentors: (id: number) => get<Mentorship[]>(`${groups}${id}/mentors/`),
  linkMentor: (id: number, data: Omit<Mentorship, "id">) => post<Mentorship>(`${groups}${id}/mentors/`, data),
  unlinkMentor: async (group: number, id: number) => { await api.delete(`${groups}${group}/mentors/${id}/`) },
  threads: (page = 1, route?: string, search = "") => get<Page<Thread>>(threads, { page, route, search }),
  thread: (id: number) => get<Thread>(`${threads}${id}/`),
  threadMessages: (id: number, page = 1) => get<Page<ThreadMessage>>(`${threads}${id}/messages/`, { page }),
  markRead: (id: number, through: number) => post<void>(`${threads}${id}/read/`, { through }),
  destinations: (search = "") => get<Destination[]>("/messaging/destinations/", { search }),
  compose: (data: ComposeMessage) => post<Thread>(threads, data),
  forward: (id: number, data: ComposeMessage & { message_ids: number[] }) =>
    post<Thread>(`${threads}${id}/forward/`, data),
  reply: (id: number, content: string) => post<ThreadMessage>(`${threads}${id}/messages/`, { content }),
}

export function accountError(error: unknown) {
  if (!axios.isAxiosError(error)) return "در انجام درخواست خطایی رخ داد."
  const { response } = error
  if (response?.status === 403) return "اجازه انجام این عملیات را ندارید."
  if (response?.status === 404) return "اطلاعات مورد نظر در دسترس نیست."
  if (response?.status === 429) return "تعداد درخواست‌ها زیاد است. کمی بعد دوباره تلاش کنید."
  if (response?.data?.code === "insufficient_credits") return "موجودی Beat Coin کافی نیست."
  if (response?.status === 409) return "درخواست با وضعیت فعلی کیف پول سازگار نیست."
  if (response?.status === 400) return "اطلاعات وارد شده را بررسی کنید."
  return "ارتباط با سامانه برقرار نشد. دوباره تلاش کنید."
}
