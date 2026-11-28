import { SearchInput, SelectInput } from "@/components/ui/inputs"
import { GlassButton } from "@/components/ui/GlassButton"
import { GlassTable, type GlassTableColumn } from "@/components/ui/tables/GlassTable"
import { useCallback, useState, type FormEvent } from "react"
import { accountApi, accountError } from "@/dataset_services/accountApi"
import type { GroupMember, Mentorship } from "@/types/account"
import { AccountStatus } from "../shared/AccountStatus"
import { useAccountQuery } from "../shared/useAccountQuery"

function MentorPicker({ group, capability, label, value, choose }: {
  group: number; capability: string; label: string; value?: GroupMember; choose: (value?: GroupMember) => void
}) {
  const [search, setSearch] = useState("")
  const matches = useAccountQuery(useCallback(() => accountApi.groupMembers(group, 1, search), [group, search]))
  const members = matches.data?.results.filter((member) => member.active && member.roles.some((role) => role.capabilities.includes(capability))) ?? []
  const options = value && !members.some((member) => member.id === value.id) ? [value, ...members] : members
  return (
    <div className="account-workspace__form">
      <label>{`جستجوی ${label}`}<SearchInput className="ui-input-shell--persian" inputProps={{ type: "search" }} value={search} onChange={setSearch} /></label>
      <label>{label}<SelectInput value={value?.id} onChange={(id) => choose(options.find((member) => member.id === Number(id)))} options={[
        { value: "", label: "انتخاب" },
        ...options.map((member) => ({ value: String(member.id), label: member.user_name || member.username })),
      ]} /></label>
      <AccountStatus error={matches.error} retry={matches.refresh} />
    </div>
  )
}

export function GroupMentorsPanel({ group, names }: { group: number; names: Record<number, string> }) {
  const [professor, setProfessor] = useState<GroupMember>()
  const [student, setStudent] = useState<GroupMember>()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const links = useAccountQuery(useCallback(() => accountApi.mentors(group), [group]))
  const change = async (run: () => Promise<unknown>) => {
    setError("")
    setSaving(true)
    try {
      await run()
      void links.refresh()
    } catch (error) {
      setError(accountError(error))
    } finally {
      setSaving(false)
    }
  }
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (professor && student) void change(() => accountApi.linkMentor(group, { professor: professor.id, student: student.id }))
  }
  const columns: GlassTableColumn<Mentorship>[] = [
    { key: "professor", label: "استاد", render: (link) => link.professor_name || names[link.professor] || link.professor },
    { key: "student", label: "دانشجو", render: (link) => link.student_name || names[link.student] || link.student },
    { key: "actions", label: "مدیریت", render: (link) => (
      <GlassButton size="sm" color="danger" isDisabled={saving}
        onPress={() => void change(() => accountApi.unlinkMentor(group, link.id))}>حذف ارتباط</GlassButton>
    ) },
  ]
  return (
    <GlassTable label="ارتباط‌های استاد و دانشجو" rows={links.data ?? []} columns={columns} rowKey={(link) => link.id}
      controls={<div className="account-workspace__section">
        <form className="account-workspace__form" onSubmit={submit}>
          <div className="account-workspace__fields">
            <MentorPicker group={group} label="استاد" capability="group.mentor" value={professor} choose={setProfessor} />
            <MentorPicker group={group} label="دانشجو" capability="group.student" value={student} choose={setStudent} />
          </div>
          <GlassButton className="account-workspace__submit" type="submit" color="primary" isLoading={saving}
            isDisabled={!professor || !student || professor.id === student.id}>ثبت ارتباط</GlassButton>
        </form>
        <AccountStatus loading={links.loading} error={error || links.error} retry={links.refresh} />
      </div>}
      empty={links.data && <p>ارتباطی ثبت نشده است.</p>} />
  )
}
