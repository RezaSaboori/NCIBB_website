import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { Provider as ReduxProvider } from "react-redux"
import { store } from "./store/store.ts"
import App from "./App.tsx"
import { Provider } from "./provider.tsx"
import { ThemeProvider } from "./components/theme/ThemeProvider.tsx"
import "@/styles/globals.css"
import "@/styles/theme.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReduxProvider store={store}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Provider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </Provider>
      </BrowserRouter>
    </ReduxProvider>
  </React.StrictMode>
)
