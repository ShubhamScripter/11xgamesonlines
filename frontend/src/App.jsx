import React,{useEffect,useState} from 'react'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Home from './pages/home/Home'
import Casino from './pages/Casino/Casino'
import Sports from './pages/sports/Sports'
import Leagues from './pages/leagues/Leagues'
import Bets from './pages/mybets/Bets'
import Fullmarket from './pages/leagues/Fullmarket'
import Fullmarkett from './pages/sports/Fullmarkett'
import Fullmarket1 from './pages/sports/Fullmarket1'
import Fullmarket2 from './pages/sports/Fullmarket2'
import Footer from './components/Footer/Footer'
import SupportWhatsAppFab from './components/Header/SupportWhatsAppFab'
import Cricket from './pages/sports/Cricket'
import Soccer from './pages/sports/Soccer'
import Tennis from './pages/sports/Tennis'
import { Routes, Route,useLocation } from 'react-router-dom'
import TransferLog from './pages/menu/TransferLog'
import UplineWhatsapp from './pages/menu/UplineWhatsapp'
import BalanceOverview from './pages/menu/BalanceOverview'
import AccountStatement from './pages/menu/AccountStatement'
import CurrentBets from './pages/menu/CurrentBets'
import BetHistory from './pages/menu/BetHistory'
import ProfitLoss from './pages/menu/ProfitLoss'
import Activelog from './pages/menu/ActiveLog'
import Myprofile from './pages/menu/MyProfile'
import ManualDeposit from './pages/menu/ManualDeposit'
import Settings from './pages/menu/Setting'
import ChangePassword from './pages/menu/ChangePassword'
import { Toaster } from 'react-hot-toast'
import ProtectedRoute from './components/ProtectedRoute'
import MainLayout from './layouts/MainLayout'
import Slot from './components/casinocomp/gameType/Slot'
import CasinoProvider from './components/casinocomp/CasinoProvider'
import Sponsorships from './pages/trust/Sponsorships'
import BrandAmbassadors from './pages/trust/BrandAmbassadors'
import SponsorshipDetail from './pages/trust/SponsorshipDetail'
import AmbassadorDetail from './pages/trust/AmbassadorDetail'

// Protected account pages mounted under /user/*. For USDT users the router
// basename ("/$") prefixes these automatically (e.g. /$/user/profile).
const ACCOUNT_ROUTES = [
  { path: 'payment-transfer-log', element: <TransferLog /> },
  { path: 'upline-whatsapp', element: <UplineWhatsapp /> },
  { path: 'balance-overview', element: <BalanceOverview /> },
  { path: 'account-statement', element: <AccountStatement /> },
  { path: 'current-bets', element: <CurrentBets /> },
  { path: 'bet-history', element: <BetHistory /> },
  { path: 'profit-loss', element: <ProfitLoss /> },
  { path: 'active-log', element: <Activelog /> },
  { path: 'profile', element: <Myprofile /> },
  { path: 'manual-deposit', element: <ManualDeposit /> },
  { path: 'setting', element: <Settings /> },
  { path: 'change-password', element: <ChangePassword /> },
];

function App() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname);

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location.pathname]);
  return (
    <div className="relative flex justify-center items-center">
      <div className="w-full flex flex-col shadow-lg bg-[#f0f8ff] relative">
        <Toaster position="top-right" reverseOrder={false} />
        <main className='flex-grow no-scrollbar fixed w-full'>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<MainLayout />}>
              {/* Sports & main public pages */}
              <Route path="/" element={<Home />} />
              {/* <Route path="/leagues" element={<Leagues />} />
              <Route path="/casino" element={<Casino />} />
              
              <Route path="/sports" element={<Sports />} />
              <Route path="/sports/fullmarket" element={<Fullmarkett />} />
              

              <Route path="/sports/fullmarket1" element={<Fullmarket1 />} />
              <Route path="/fullmarket" element={<Fullmarket />} /> */}
              <Route path="/cricket" element={<Cricket activeTab="All" />} />
              <Route path="/football" element={<Soccer activeTab="All" />} />
              <Route path="/tennis" element={<Tennis activeTab="All" />} />
              <Route path="/casino/:category/:provider" element={<CasinoProvider key={location.pathname} />} />
              <Route path="/sponsorships" element={<Sponsorships />} />
              <Route path="/sponsorships/:slug" element={<SponsorshipDetail />} />
              <Route path="/brand-ambassadors" element={<BrandAmbassadors />} />
              <Route path="/brand-ambassadors/:slug" element={<AmbassadorDetail />} />
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/mybets" element={<Bets />} />
                <Route 
                  path="/sports/fullmarket/:match/:gameid"
                  element={<Fullmarkett />} 
                />
                <Route 
                  path="/sports/soccer/:match/:gameid"
                  element={<Fullmarket1 />} 
                />
                <Route 
                  path="/sports/tennis/:match/:gameid"
                  element={<Fullmarket2 />} 
                />
                {ACCOUNT_ROUTES.map((r) => (
                  <Route key={r.path} path={`/user/${r.path}`} element={r.element} />
                ))}
              </Route>
            </Route>
          </Routes>
          
        </main>
        {/* <SupportWhatsAppFab />
        <Footer activeTab={activeTab} setActiveTab={setActiveTab} /> */}
      </div>
    </div>
  )
}

export default App;