import { useCallback, useState, type FormEvent } from "react"
import { Button } from "@heroui/react"
import { accountApi, accountError } from "@/dataset_services/accountApi"
import type { GroupMember } from "@/types/account"
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
      <label>{`جستجوی ${label}`}<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
      <label>{label}<select value={value?.id ?? ""} onChange={(event) => choose(options.find((member) => member.id === Number(event.target.value)))}>
        <option value="">انتخاب</option>{options.map((member) => <option value={member.id} key={member.id}>{member.user_name || member.username}</option>)}
      </select></label>
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
  return (
    <div className="account-workspace__stack">
      <h3>ارتباط استاد و دانشجو</h3>
      <form className="account-workspace__form" onSubmit={submit}>
        <div className="account-workspace__fields">
          <MentorPicker group={group} label="استاد" capability="group.mentor" value={professor} choose={setProfessor} />
          <MentorPicker group={group} label="دانشجو" capability="group.student" value={student} choose={setStudent} />
        </div>
        <Button className="account-workspace__submit" type="submit" color="primary" isLoading={saving}
          isDisabled={!professor || !student || professor.id === student.id}>ثبت ارتباط</Button>
      </form>
      <AccountStatus loading={links.loading} error={error || links.error} retry={links.refresh} />
      {links.data?.map((link) => (
        <div className="account-workspace__toolbar" key={link.id}>
          <span>{link.professor_name || names[link.professor] || link.professor} · {link.student_name || names[link.student] || link.student}</span>
          <Button size="sm" variant="flat" color="danger" isDisabled={saving} onPress={() => void change(() => accountApi.unlinkMentor(group, link.id))}>حذف ارتباط</Button>
        </div>
      ))}
    </div>
  )
}
