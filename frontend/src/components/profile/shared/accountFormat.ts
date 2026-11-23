const dateFormat = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  timeZone: "Asia/Tehran", dateStyle: "medium", timeStyle: "short",
})
const coinFormat = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 2 })

export const formatAccountDate = (timestamp: string | null) => timestamp ? dateFormat.format(new Date(timestamp)) : "—"
export const formatCoins = (value: string | number) => coinFormat.format(Number(value))
export const accountName = ({ first_name, last_name, username }: {
  first_name: string; last_name: string; username: string
}) => `${first_name} ${last_name}`.trim() || username
