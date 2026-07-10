// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import { BrowserRouter } from 'react-router-dom'
// import './index.css'
// import App from './App.jsx'
// import {store} from './app/store.js'
// import { Provider } from 'react-redux';
// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <Provider store={store}>
//     <BrowserRouter>
//     <App />
//     </BrowserRouter>
//     </Provider>
//   </StrictMode>,
// )
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { store } from './app/store.js'
import { Provider } from 'react-redux'
import { getStoredCurrency } from './utils/currency'
import { LanguageProvider } from './i18n/LanguageContext.jsx'

import setupLocatorUI from "@locator/runtime";

// USDT users browse under a global "$" prefix (e.g. /$/cricket). The basename is
// derived from the logged-in user's stored currency, so every Link/navigate is
// prefixed automatically. It only changes on login/logout (which hard-reload).
const wantsUsdPrefix = getStoredCurrency() === 'USDT';
const ROUTER_BASENAME = wantsUsdPrefix ? '/$' : '/';

// Keep the actual URL in sync with the basename. Without this, a logged-in USDT
// user whose URL is still "/" (no prefix) would mismatch basename "/$" and the
// router would render nothing. We correct the URL with a full reload first.
const currentPath = window.location.pathname;
const hasUsdPrefix = currentPath === '/$' || currentPath.startsWith('/$/');
const { search, hash } = window.location;

let mustRedirect = false;
if (wantsUsdPrefix && !hasUsdPrefix) {
  mustRedirect = true;
  window.location.replace(`/$${currentPath}${search}${hash}`);
} else if (!wantsUsdPrefix && hasUsdPrefix) {
  mustRedirect = true;
  window.location.replace(`${currentPath.slice(2) || '/'}${search}${hash}`);
}

// // ✅ LocatorJS setup (DEV ONLY)
// if (import.meta.env.DEV) {
//   import("@locator/runtime").then((locator) => {
//     locator.setup();
//   });
// }

if (process.env.NODE_ENV === "development") {
  setupLocatorUI();
}

if (!mustRedirect) {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <Provider store={store}>
        <LanguageProvider>
          <BrowserRouter basename={ROUTER_BASENAME}>
            <App />
          </BrowserRouter>
        </LanguageProvider>
      </Provider>
    </StrictMode>,
  )
}