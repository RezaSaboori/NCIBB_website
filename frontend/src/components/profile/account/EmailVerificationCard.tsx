import { useState } from "react"
import { Button } from "@heroui/react"
import { accountApi, accountError } from "@/dataset_services/accountApi"

export function EmailVerificationCard({ email, verified }: { email: string; verified: boolean }) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle")
  const [error, setError] = useState("")
  const send = async () => {
    setError("")
    setState("sending")
    try {
      await accountApi.requestVerification()
      setState("sent")
    } catch (error) {
      setError(accountError(error))
      setState("idle")
    }
  }
  return (
    <section className="account-workspace__panel glass">
      <h2>تأیید ایمیل</h2>
      <p><bdi>{email}</bdi> · {verified ? "تأیید شده" : "در انتظار تأیید"}</p>
      {!verified && <Button className="account-workspace__submit" color="primary" isLoading={state === "sending"}
        isDisabled={state === "sent"} onPress={() => void send()}>ارسال پیوند تأیید</Button>}
      {state === "sent" && <p role="status">پیوند تأیید به ایمیل شما ارسال شد.</p>}
      {error && <p role="alert">{error}</p>}
    </section>
  )
}
