// Generic project representation for the profile page.
// Services (datasaz, portal, etc.) must map their own types to this interface.
export interface UserProject {
  id: number;
  name: string;
  serviceName: string;       // e.g. "datasaz", "portal"
  serviceLabel: string;      // human-readable label, e.g. "داده‌ساز"
  stageLabel: string;        // e.g. "مرحله ۲"
  statusLabel: string;       // e.g. "در حال انجام"
  openUrl: string;           // route to navigate on "Open"
  createdAt: string;
  updatedAt: string;
}