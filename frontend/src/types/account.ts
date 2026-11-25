export interface Page<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface Role {
  id: number
  code: string
  label: string
  scope: "platform" | "group"
  capabilities: string[]
  builtin: boolean
}
export type RoleSummary = Pick<Role, "code" | "label"> & { id: number | null }

export interface AccountGroup {
  id: number
  name: string
  parent_id: number | null
  membership_id: number
  roles: RoleSummary[]
  can_spend: boolean
  can_manage_wallet: boolean
}

export interface AccountProfile {
  id: number
  email: string
  first_name: string
  last_name: string
  is_email_verified: boolean
  username: string
  phone: string | null
  profile: Record<string, unknown>
  preferences: Record<string, unknown> | null
  roles: RoleSummary[]
  capabilities: string[]
  groups: AccountGroup[]
}

export interface SharedBalance { id: number; name: string; balance: string }
export interface Wallet {
  balance: string
  monthly_balance: string
  permanent_balance: string
  reset_at: string
  period: string
  job_price: string
  groups?: SharedBalance[]
}

export interface LedgerEntry {
  id: number
  actor: number | null
  amount: string
  balance_after: string | null
  bucket: string
  description: string
  transaction_type: string
  reference_id: string
  created_at: string
}
export interface Adjustment { amount: string; reason: string; request_id: string }

export interface DirectoryUser {
  id: number
  first_name: string
  last_name: string
  username: string
  email: string
  roles: RoleSummary[]
  groups: AccountGroup[]
  balance: string
  is_email_verified: boolean
  is_active: boolean
  created_at: string
  last_login: string | null
}

export interface UserDetail extends DirectoryUser {
  wallet: Wallet
  profile: { job_title: string; company: string; department: string }
}

export interface AdminProject {
  pk: number
  name: string
  service: string
  status: string
  updated_at: string
}

export interface AuditEvent {
  id: number
  actor_name: string | null
  action: string
  details: Record<string, unknown>
  created_at: string
}

export type ThreadRoute = "support_queue" | "admin_queue" | "support_direct" | "admin_direct" | "mentor" | "legacy"
export type TicketStatus = "open" | "waiting" | "resolved"
export type TicketOwnerFilter = "mine" | "unassigned"

export interface TicketAssignee {
  id: number
  name: string
}

export interface Ticket {
  status: TicketStatus
  assignee?: TicketAssignee | null
}

export type TicketUpdate = { status: TicketStatus } |
  { assignee_id: number | null; expected_assignee_id: number | null }

export interface Thread {
  id: number
  route: ThreadRoute
  subject: string
  counterpart: string
  preview: string
  preview_sender: number | null
  preview_created_at: string | null
  can_reply: boolean
  unread_count: number
  updated_at: string
  ticket: Ticket | null
}

export interface MessageQuote {
  id: number
  sender_name: string
  excerpt: string
}

export interface ThreadMessage {
  id: number
  sender: number
  sender_name: string
  content: string
  forwarded: boolean
  created_at: string
  reply_to: MessageQuote | null
  read_by_other: boolean | null
}

export interface Destination {
  kind: Exclude<ThreadRoute, "legacy">
  label: string
  recipient?: number
  group?: number
}
export type ComposeMessage = Omit<Destination, "label"> & { subject: string; content: string }

export interface Group {
  id: number
  name: string
  parent: number | null
}

export interface GroupMember {
  id: number
  user: number
  user_name: string
  username: string
  roles: Role[]
  active: boolean
  can_spend: boolean
}

export interface Mentorship { id: number; professor: number; student: number; professor_name?: string; student_name?: string }
