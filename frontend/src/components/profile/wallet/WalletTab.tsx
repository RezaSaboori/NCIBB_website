import { useCallback, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Icon } from "@iconify/react"

import { accountApi } from "@/dataset_services/accountApi"
import type { AppDispatch, RootState } from "@/store/store"
import { fetchWallet } from "@/store/walletSlice"
import { formatAccountDate, formatCoins } from "../shared/accountFormat"
import { AccountStatus } from "../shared/AccountStatus"
import { PageControls } from "../shared/PageControls"
import { useAccountQuery } from "../shared/useAccountQuery"
import { CreditLedger } from "./CreditLedger"

export function WalletTab() {
  const [page, setPage] = useState(1)
  const dispatch = useDispatch<AppDispatch>()
  const { wallet, error } = useSelector((state: RootState) => state.wallet)
  const history = useAccountQuery(useCallback(() => accountApi.creditHistory(page), [page]))

  return (
    <div className="account-workspace__stack">
      <section className="account-workspace__panel glass">
        <div className="account-workspace__heading"><Icon icon="mdi:heart-pulse" width={28} /><h1>کیف پول Beat Coin</h1></div>
        <AccountStatus loading={!wallet && !error} error={error ? "موجودی کیف پول دریافت نشد." : ""}
          retry={() => void dispatch(fetchWallet())} />
        {wallet && (
          <>
            <div className="account-workspace__metrics">
              <div><span>موجودی قابل استفاده</span><strong>{formatCoins(wallet.balance)}</strong></div>
              <div><span>اعتبار ماهانه</span><strong>{formatCoins(wallet.monthly_balance)}</strong></div>
              <div><span>اعتبار دائمی</span><strong>{formatCoins(wallet.permanent_balance)}</strong></div>
            </div>
            <p className="account-workspace__muted">تمدید اعتبار ماهانه در {formatAccountDate(wallet.reset_at)}</p>
          </>
        )}
      </section>
      {!!wallet?.groups?.length && (
        <section className="account-workspace__panel glass">
          <h2>کیف پول‌های اشتراکی</h2>
          <ul className="account-workspace__rows">
            {wallet.groups.map((group) => <li key={group.id}><span>{group.name}</span><bdi>{formatCoins(group.balance)}</bdi></li>)}
          </ul>
        </section>
      )}
      <section className="account-workspace__panel glass">
        <h2>تاریخچه تراکنش‌ها</h2>
        <AccountStatus loading={history.loading} error={history.error} retry={history.refresh} />
        {history.data && <CreditLedger entries={history.data.results} />}
        <PageControls data={history.data} page={page} onPage={setPage} />
      </section>
    </div>
  )
}
