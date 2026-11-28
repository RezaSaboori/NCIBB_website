const paths = {
  search: "M15.5 15.5 20 20m-3-9a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z",
  send: "M12 19V5m-6 6 6-6 6 6",
  expand: "M14 5h5v5m0-5-5 5M10 19H5v-5m0 5 5-5",
  collapse: "M19 5l-5 5m0-5v5h5M5 19l5-5m-5 0h5v5",
  pending: "M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
}

export function MessagingIcon({ name }: { name: keyof typeof paths }) {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name]} />
    </svg>
  )
}
