import { GlassSwitch } from "../../ui/inputs/GlassSwitch";
import { useTheme } from "../../theme";

export function MobileThemeSwitch() {
  const { theme, setTheme } = useTheme();

  return (
    <GlassSwitch
      checked={theme === "dark"}
      className="header-mobile-nav__theme-switch"
      label="حالت تاریک"
      onChange={(event) =>
        setTheme(event.currentTarget.checked ? "dark" : "light")
      }
    />
  );
}
