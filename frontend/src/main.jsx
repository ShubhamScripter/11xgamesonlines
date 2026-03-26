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

import setupLocatorUI from "@locator/runtime";

// // ✅ LocatorJS setup (DEV ONLY)
// if (import.meta.env.DEV) {
//   import("@locator/runtime").then((locator) => {
//     locator.setup();
//   });
// }

if (process.env.NODE_ENV === "development") {
  setupLocatorUI();
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)