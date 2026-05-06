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
import P2pTransfer from './pages/menu/P2pTransfer'
import P2pTransferLog from './pages/menu/P2pTransferLog'
import ManualDeposit from './pages/menu/ManualDeposit'
import Settings from './pages/menu/Setting'
import ChangePassword from './pages/menu/ChangePassword'
import { Toaster } from 'react-hot-toast'
import ProtectedRoute from './components/ProtectedRoute'
import MainLayout from './layouts/MainLayout'
import Slot from './components/casinocomp/gameType/Slot'
import CasinoProvider from './components/casinocomp/CasinoProvider'
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
              <Route path="/leagues" element={<Leagues />} />
              <Route path="/casino" element={<Casino />} />
              
              <Route path="/sports" element={<Sports />} />
              <Route path="/sports/fullmarket" element={<Fullmarkett />} />
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

              <Route path="/sports/fullmarket1" element={<Fullmarket1 />} />
              <Route path="/fullmarket" element={<Fullmarket />} />
              <Route path="/casino/:category/:provider" element={<CasinoProvider key={location.pathname} />} />
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/mybets" element={<Bets />} />
                <Route path='/user/payment-transfer-log' element={<TransferLog />} />
                <Route path='/user/upline-whatsapp' element={<UplineWhatsapp />} />
                <Route path='/user/balance-overview' element={<BalanceOverview />} />
                <Route path='/user/account-statement' element={<AccountStatement />} />
                <Route path='/user/current-bets' element={<CurrentBets />} />
                <Route path='/user/bet-history' element={<BetHistory />} />
                <Route path='/user/profit-loss' element={<ProfitLoss />} />
                <Route path='/user/active-log' element={<Activelog />} />
                <Route path='/user/profile' element={<Myprofile />} />
                <Route path='/user/p2p-transfer' element={<P2pTransfer />} />
                <Route path='/user/p2p-transfer-log' element={<P2pTransferLog />} />
                <Route path='/user/manual-deposit' element={<ManualDeposit />} />
                <Route path='/user/setting' element={<Settings />} />
                <Route path='/user/change-password' element={<ChangePassword />} />
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