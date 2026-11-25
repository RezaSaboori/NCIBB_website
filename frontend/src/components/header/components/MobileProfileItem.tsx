import type { RootState } from "@/store/store";

import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

interface MobileProfileItemProps {
  pathname: string;
  onSelect: () => void;
  onSignIn: () => void;
}

export function MobileProfileItem({
  pathname,
  onSelect,
  onSignIn,
}: MobileProfileItemProps) {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
  const isCurrent = pathname === "/profile";
  const className = "header-nav__item glass-navigation__item";

  if (isAuthenticated) {
    return (
      <Link
        aria-current={isCurrent ? "page" : undefined}
        className={`${className}${isCurrent ? " blue-glass-transparent" : ""}`}
        to="/profile"
        onClick={onSelect}
      >
        پروفایل
      </Link>
    );
  }

  return (
    <button
      aria-haspopup="dialog"
      className={className}
      type="button"
      onClick={() => {
        onSelect();
        onSignIn();
      }}
    >
      پروفایل
    </button>
  );
}
