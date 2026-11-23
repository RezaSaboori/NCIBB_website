import { coinIcon } from "@/components/ui/coinIcon"
import { useCallback, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Icon } from "@iconify/react"
import { GlassCard } from "@/components/ui/GlassCard"
import { accountApi } from "@/dataset_services/accountApi"
import type { AppDispatch, RootState } from "@/store/store"
import { fetchWallet } from "@/store/walletSlice"
import { formatCoins } from "../shared/accountFormat"
import { AccountStatus } from "../shared/AccountStatus"
import { PageControls } from "../shared/PageControls"
import { useAccountQuery } from "../shared/useAccountQuery"
import { CreditLedger } from "./CreditLedger"
import { WalletBalanceCards } from "./WalletBalanceCards"

export function WalletTab() {
  const [page, setPage] = useState(1)
  const dispatch = useDispatch<AppDispatch>()
  const { wallet, error } = useSelector((state: RootState) => state.wallet)
  const history = useAccountQuery(useCallback(() => accountApi.creditHistory(page), [page]))

  return (
    <div className="account-workspace__stack">
      <GlassCard size="lg"
        heading={<div className="account-workspace__heading"><Icon icon={coinIcon} width={24} aria-hidden /><h2>اعتبار شخصی</h2></div>}>
        <AccountStatus loading={!wallet && !error} error={error ? "موجودی کیف پول دریافت نشد." : ""}
          retry={() => void dispatch(fetchWallet())} />
        {wallet && <WalletBalanceCards wallet={wallet} showRenewal />}
      </GlassCard>
      {!!wallet?.groups?.length && (
        <section className="account-workspace__section">
          <h2>موجودی اشتراکی</h2>
          <div className="account-workspace__metrics">
            {wallet.groups.map((group) => (
              <GlassCard key={group.id} size="sm" heading={<h3>{group.name}</h3>}>
                <strong>{formatCoins(group.balance)}</strong>
              </GlassCard>
            ))}
          </div>
        </section>
      )}
      <section className="account-workspace__section">
        <h2>تراکنش‌ها</h2>
        <CreditLedger entries={history.data?.results ?? []}
          controls={<AccountStatus loading={history.loading} error={history.error} retry={history.refresh} />}
          footer={<PageControls data={history.data} page={page} onPage={setPage} />}
          showEmpty={!!history.data} />
      </section>
    </div>
  )
}
