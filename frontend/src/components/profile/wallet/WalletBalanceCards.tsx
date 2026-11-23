import type { Wallet } from "@/types/account"
import { formatAccountDate, formatCoins } from "../shared/accountFormat"
import { ProfileDetailCards } from "../shared/ProfileDetailCards"

export function WalletBalanceCards({ wallet, showRenewal = false }: { wallet: Wallet; showRenewal?: boolean }) {
  return (
    <ProfileDetailCards items={[
      {
        label: "موجودی قابل استفاده",
        value: <strong className="account-workspace__balance">{formatCoins(wallet.balance)} <bdi>Beat Coin</bdi></strong>,
        fullWidthOnMobile: true,
      },
      {
        label: "اعتبار ماهانه",
        value: <strong className="account-workspace__balance">{formatCoins(wallet.monthly_balance)}</strong>,
        footer: showRenewal && <small className="account-workspace__muted">تمدید در {formatAccountDate(wallet.reset_at)}</small>,
      },
      {
        label: "اعتبار دائمی",
        value: <strong className="account-workspace__balance">{formatCoins(wallet.permanent_balance)}</strong>,
      },
    ]} />
  )
}
