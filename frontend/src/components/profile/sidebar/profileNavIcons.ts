import type { IconifyIcon } from "@iconify/react";

function outline(body: string): IconifyIcon {
  return {
    width: 24,
    height: 24,
    body: `<g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${body}</g>`,
  };
}

export const profileNavIcons = {
  dashboard: outline(`
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/>
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/>
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/>
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>
  `),
  account: outline(`
    <circle cx="12" cy="8" r="3.25"/>
    <path d="M5 20v-1.25A4.75 4.75 0 0 1 9.75 14h4.5A4.75 4.75 0 0 1 19 18.75V20Z"/>
  `),
  messages: outline(`
    <path d="M6.5 4.5h11A3.5 3.5 0 0 1 21 8v6a3.5 3.5 0 0 1-3.5 3.5H10L5 21v-4a3.5 3.5 0 0 1-2-3V8a3.5 3.5 0 0 1 3.5-3.5Z"/>
    <path d="M8 9.5h8m-8 4h5"/>
  `),
  projects: outline(
    '<path d="M3 8V6a2 2 0 0 1 2-2h4l2.5 2.5H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Zm0 1h18"/>',
  ),
  support: outline(`
    <path d="M5 14v-3a7 7 0 0 1 14 0v5c0 2.5-1.5 4-4 4h-3"/>
    <rect x="3" y="11" width="5" height="6" rx="2"/>
    <rect x="16" y="11" width="5" height="6" rx="2"/>
  `),
  users: outline(`
    <circle cx="9" cy="8" r="3"/>
    <path d="M3 19v-1a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v1Zm13-14a3 3 0 0 1 0 6m2 3a4 4 0 0 1 3 4v1"/>
  `),
  roles: outline(`
    <path d="M12 3 4.5 6v5c0 4.5 2.5 7.5 7.5 10 5-2.5 7.5-5.5 7.5-10V6L12 3Z"/>
    <path d="m8.5 12 2.5 2.5 4.5-5"/>
  `),
  groups: outline(`
    <rect x="9" y="3" width="6" height="5" rx="1"/>
    <rect x="3" y="16" width="6" height="5" rx="1"/>
    <rect x="15" y="16" width="6" height="5" rx="1"/>
    <path d="M12 8v4m-6 4v-4h12v4"/>
  `),
  research: outline(
    '<path d="M9 3h6m-5 0v6l-5 8.5A2 2 0 0 0 6.7 21h10.6a2 2 0 0 0 1.7-3.5L14 9V3M8.5 14h7"/>',
  ),
  learning: outline(
    '<path d="M12 7c-2.5-2-5.5-2.5-9-2v13c3.5-.5 6.5 0 9 2 2.5-2 5.5-2.5 9-2V5c-3.5-.5-6.5 0-9 2v13Z"/>',
  ),
  logout: outline(
    '<path d="M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5m-2-8h11m-4-4 4 4-4 4"/>',
  ),
  expand: outline('<path d="m14 6-6 6 6 6"/>'),
  collapse: outline('<path d="m10 6 6 6-6 6"/>'),
};
