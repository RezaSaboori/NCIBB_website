const paths = {
  sending: "M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  sent: "m5 12 4 4L19 6",
  read: "m2 12 4 4L16 6m-6 9 1 1L21 6",
  failed: "M12 8v4m0 4h.01M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0Z",
}

const labels = { sending: "در حال ارسال", sent: "ارسال شد", read: "خوانده شد", failed: "ارسال ناموفق" }

export function MessageDelivery({ status, error }: { status: keyof typeof paths; error?: string }) {
  const label = error ? `${labels[status]} · ${error}` : labels[status]
  return (
    <span className={`account-messages__delivery account-messages__delivery--${status}`} role="img" aria-label={label} title={label}>
      <svg aria-hidden="true" width="1.15em" height="1.15em" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        <path d={paths[status]} />
      </svg>
    </span>
  )
}
