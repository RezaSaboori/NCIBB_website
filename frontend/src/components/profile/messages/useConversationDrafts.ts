import { useRef, useState } from "react"
import { accountApi, accountError } from "@/dataset_services/accountApi"
import type { MessageQuote, ThreadMessage } from "@/types/account"

export interface ReplyAttempt {
  content: string
  quote?: MessageQuote
  createdAt: string
}

export interface ConversationDraft {
  content: string
  quote?: MessageQuote
  sending: boolean
  error: string
  sent?: ThreadMessage
  attempt?: ReplyAttempt
}

const emptyDraft: ConversationDraft = { content: "", sending: false, error: "" }

export function useConversationDrafts(refreshList: () => void) {
  const [drafts, setDrafts] = useState<Partial<Record<number, ConversationDraft>>>({})
  const pending = useRef(new Set<number>())

  const update = (threadId: number, changes: Partial<ConversationDraft>) => {
    setDrafts((previous) => ({ ...previous, [threadId]: { ...emptyDraft, ...previous[threadId], ...changes } }))
  }

  const send = async (threadId: number) => {
    const draft = drafts[threadId]
    const content = draft?.content.trim()
    if (!draft || !content || pending.current.has(threadId)) return
    pending.current.add(threadId)
    update(threadId, {
      sending: true, error: "",
      attempt: { content, quote: draft.quote, createdAt: new Date().toISOString() },
    })
    try {
      const message = await accountApi.reply(threadId, content, draft.quote?.id)
      update(threadId, { ...emptyDraft, quote: undefined, attempt: undefined, sent: message })
      refreshList()
    } catch (error) {
      update(threadId, { sending: false, error: accountError(error) })
    } finally {
      pending.current.delete(threadId)
    }
  }

  return { get: (threadId: number) => drafts[threadId] ?? emptyDraft, update, send }
}
