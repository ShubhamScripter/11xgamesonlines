

import React from 'react';
import { Toaster } from "react-hot-toast";
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute'; // <-- Correct import
import RoleRedirect from './components/navbar/RoleRedirected';
import Login from './pages/auth/Login';
import DownLineList from './pages/downlineList/admin/DownLineList';
import MainLayout from './layouts/MainLayout';
import AccountSummary from './pages/downlineList/admin/AccountSummary';
import CurrentBets from './pages/downlineList/admin/CurrentBets';
import BettingHistory from './pages/downlineList/admin/BettingHistory';
import BettingProfitLoss from './pages/downlineList/admin/BettingProfitLoss';
import TransactionHistory from './pages/downlineList/admin/TransactionHistory';
import TransactionHistory2 from './pages/downlineList/admin/TransactionHistory2';
import ActivityLog from './pages/downlineList/admin/ActivityLog';

import SubAdminDownList from "./pages/downlineList/subAdmin/DownLineList"
import SubAdminAccountSummary from './pages/downlineList/subAdmin/AccountSummary';
import SubAdminCurrentBets from './pages/downlineList/subAdmin/CurrentBets';
import SubAdminBettingHistory from './pages/downlineList/subAdmin/BettingHistory';
import SubAdminBettingProfitLoss from './pages/downlineList/subAdmin/BettingProfitLoss';
import SubAdminTransactionHistory from './pages/downlineList/subAdmin/TransactionHistory';
import SubAdminActivityLog from './pages/downlineList/subAdmin/ActivityLog';

import SeniorSuperDownLineList from './pages/downlineList/seniorSuper/DownLineList';
import SeniorSuperAccountSummary from './pages/downlineList/seniorSuper/AccountSummary';
import SeniorSuperCurrentBets from './pages/downlineList/seniorSuper/CurrentBets';
import SeniorSuperBettingHistory from './pages/downlineList/seniorSuper/BettingHistory';
import SeniorSuperBettingProfitLoss from './pages/downlineList/seniorSuper/BettingProfitLoss';
import SeniorSuperTransactionHistory from './pages/downlineList/seniorSuper/TransactionHistory';
import SeniorSuperActivityLog from './pages/downlineList/seniorSuper/ActivityLog';

import SuperAgentDownLineList from './pages/downlineList/superAgent/DownLineList';
import SuperAgentAccountSummary from './pages/downlineList/superAgent/AccountSummary';
import SuperAgentCurrentBets from './pages/downlineList/superAgent/CurrentBets';
import SuperAgentBettingHistory from './pages/downlineList/superAgent/BettingHistory';
import SuperAgentBettingProfitLoss from './pages/downlineList/superAgent/BettingProfitLoss';
import SuperAgentTransactionHistory from './pages/downlineList/superAgent/TransactionHistory';
import SuperAgentActivityLog from './pages/downlineList/superAgent/ActivityLog';

import AgentDownLineList from './pages/downlineList/agent/DownLineList';
import AgentAccountSummary from './pages/downlineList/agent/AccountSummary';
import AgentCurrentBets from './pages/downlineList/agent/CurrentBets';
import AgentBettingHistory from './pages/downlineList/agent/BettingHistory';
import AgentBettingProfitLoss from './pages/downlineList/agent/BettingProfitLoss';
import AgentTransactionHistory from './pages/downlineList/agent/TransactionHistory';
import AgentActivityLog from './pages/downlineList/agent/ActivityLog';

import MyAccountSummary from './pages/myAccount/MyAccountSummary';
import MyAccountStatement from './pages/myAccount/MyAccountStatement';
import MyProfile from './pages/myAccount/MyProfile';
import MyActivityLog from './pages/myAccount/MyActivityLog';

import AprofitByDownline from './pages/myReport/profitLossReportByDownline/AprofitByDownline';

import AprofitDownline from './pages/myReport/profitLossByDownline/AprofitDownline';
import AprofitDownlineSubAdmin from './pages/myReport/profitLossByDownline/SubAdmin';
import AprofitDownlineSeniorSuper from './pages/myReport/profitLossByDownline/SeniorSuper';
import AprofitDownlineSuperAgent from './pages/myReport/profitLossByDownline/SuperAgent';
import AprofitDownlineAgent from './pages/myReport/profitLossByDownline/Agent';

import AprofitMarket from './pages/myReport/profitLossByMarket/AprofitMarket';
import MatchMarketBets from './pages/myReport/profitLossByMarket/MatchMarketBets';

import CasinoProfitLoss from './pages/myReport/profitLossSportsWise/CasinoProfitLoss';

import ACdownlinesportspl from './pages/myReport/AllCasinoProfitLoss/ACdownlinesportspl';
import ACdownlinesportsplSubAdmin from './pages/myReport/AllCasinoProfitLoss/SubAdmin';
import ACdownlinesportsplSeniorSuper from './pages/myReport/AllCasinoProfitLoss/SeniorSuper';
import ACdownlinesportsplSuperAgent from './pages/myReport/AllCasinoProfitLoss/SuperAgent';
import ACdownlinesportsplAgent from './pages/myReport/AllCasinoProfitLoss/Agent';

import AprofitCasino from './pages/myReport/CasinoProfitLossByDate/AprofitCasino';

import DownlineNew from './pages/myReport/casinoProfitLossMonthly/DownlineNew';
import DownlineNewSubAdmin from './pages/myReport/casinoProfitLossMonthly/SubAdmin';
import DownlineNewSeniorSuper from './pages/myReport/casinoProfitLossMonthly/SeniorSuper';
import DownlineNewSuperAgent from './pages/myReport/casinoProfitLossMonthly/SuperAgent';
import DownlineNewAgent from './pages/myReport/casinoProfitLossMonthly/Agent';

import InternationalDownlineNew from './pages/myReport/InternationalCasinoDownline/DownlineNew';

import BetList from './pages/BetList/BetList';
import BetListLive from './pages/BetListLive/BetListLive';
import RiskManagement from './pages/riskManagement/RiskManagement';
import MatchedAll from './pages/riskManagement/MatchedAll';

import Banking from './pages/banking/Banking';
import ManualDepositAccounts from './pages/banking/ManualDepositAccounts';
import ManualDepositRequests from './pages/banking/ManualDepositRequests';
import ManualWithdrawRequests from './pages/banking/ManualWithdrawRequests';
import BlockMarket from './pages/blockMarket/BlockMarket';
import Transactionslog from './pages/banking/Transactionslog';

import GeneralSetting from './pages/generalSetting/GeneralSetting';
import CustomerSupport from './pages/customerSupport/CustomerSupport';
import SearchUser from './pages/generalSetting/SearchUser';
import Surveillance from './pages/generalSetting/Surveillance';
import BetLockeduser from './pages/generalSetting/BetLockeduser';
import PlayerBalance from './pages/generalSetting/PlayerBalance';
import ActiveMatch from './pages/generalSetting/ActiveMatch';
import InActiveMatch from './pages/generalSetting/InActiveMatch';
import UpdateFancyStatus from './pages/generalSetting/UpdateFancyStatus';
import SuspendedResult from './pages/generalSetting/SuspendedResult';
import SuspendedFancyResult from './pages/generalSetting/SuspendedFancyResult';
import SuspendedMarketResult from './pages/generalSetting/SuspendedMarketResult';
import ViewBets from './pages/generalSetting/ViewBets';
import InactiveUsers from './pages/generalSetting/InactiveUsers';
import BetLockedUsers from './pages/generalSetting/BetLockedUsers';

import DownLineView from './pages/downlineList/DownLineView';

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/admin/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/logout" element={<Login />} />
          <Route path='transaction-logs/:userId' element={<Transactionslog />} />
          <Route path='/match-market-bets' element={<MatchMarketBets />} />
          <Route element={<MainLayout />}>
            <Route path="/" element={<DownLineList />} />
            <Route path='/:role/:userId' element={<DownLineView />} />
            <Route path='/account-summary/:role/:userId' element={<AccountSummary />} />
            <Route path='/activity-log/:role/:userId' element={<ActivityLog />} />
            <Route path='/current-bets/:role/:userId' element={<CurrentBets />} />
            <Route path='/betting-history/:role/:userId' element={<BettingHistory />} />
            <Route path='/betting-profit-loss/:role/:userId' element={<BettingProfitLoss />} />
            <Route path='/transaction-history/:role/:userId' element={<TransactionHistory />} />
            <Route path='/transaction-history2/:role/:userId' element={<TransactionHistory2 />} />
            <Route path='/my-account-summary' element={<MyAccountSummary />} />
            <Route path='/my-account-statement' element={<MyAccountStatement />} />
            <Route path='/my-profile' element={<MyProfile />} />
            <Route path='/my-activity-log' element={<MyActivityLog />} />
            <Route path='/AprofitByDownline' element={<AprofitByDownline />} />
            <Route path='/AprofitDownline' element={<AprofitDownline />} />
            <Route path='/AprofitDownline/sub_admin/:userId' element={<AprofitDownlineSubAdmin />} />
            <Route path='/AprofitDownline/senior_super/:userId' element={<AprofitDownlineSeniorSuper />} />
            <Route path='/AprofitDownline/super_agent/:userId' element={<AprofitDownlineSuperAgent />} />
            <Route path='/AprofitDownline/agent/:userId' element={<AprofitDownlineAgent />} />
            <Route path='/AprofitMarket' element={<AprofitMarket />} />
            <Route path='/Adownlinesportspl' element={<CasinoProfitLoss />} />
            <Route path='/ACdownlinesportspl' element={<ACdownlinesportspl />} />
            <Route path='/ACdownlinesportspl/:role/:userId' element={<ACdownlinesportsplSubAdmin />} />
            {/* <Route path='/ACdownlinesportspl/senior_super' element={<ACdownlinesportsplSeniorSuper />} />
            <Route path='/ACdownlinesportspl/super_agent' element={<ACdownlinesportsplSuperAgent />} />
            <Route path='/ACdownlinesportspl/agent' element={<ACdownlinesportsplAgent />} /> */}
            <Route path='/AprofitCasino' element={<AprofitCasino />} />
            <Route path='/ACasinoprofitAndLossDownlineNew' element={<DownlineNew />} />
            <Route path='/ACasinoprofitAndLossDownlineNew/:role/:userId' element={<DownlineNewSubAdmin />} />
            {/* <Route path='/ACasinoprofitAndLossDownlineNew/senior_super' element={<DownlineNewSeniorSuper />} />
            <Route path='/ACasinoprofitAndLossDownlineNew/super_agent' element={<DownlineNewSuperAgent />} />
            <Route path='/ACasinoprofitAndLossDownlineNew/agent' element={<DownlineNewAgent />} /> */}
            <Route path='/ICasinoprofitAndLossDownlineNew' element={<InternationalDownlineNew />} />
            <Route path='/Betlist' element={<BetList />} />
            <Route path='/BetListLive' element={<BetListLive />} />
            <Route path='/RiskManagement' element={<RiskManagement />} />
            <Route path='/matchedAll' element={<MatchedAll />} />
            <Route path='/banking' element={<Banking />} />
            <Route path='/manual-deposit-accounts' element={<ManualDepositAccounts />} />
            <Route
              path='/manual-deposit-requests'
              element={<ManualDepositRequests requestType="deposit" />}
            />
            <Route path='/manual-withdraw-requests' element={<ManualWithdrawRequests />} />
            <Route path='/block-market' element={<BlockMarket />} />
            <Route path='/customer-support' element={<CustomerSupport />} />
            <Route path='/general-setting' element={<GeneralSetting />} />
            <Route path='/searchuser' element={<SearchUser />} />
            <Route path='/SurveillanceSetting' element={<Surveillance />} />
            <Route path='/PlayerBalance' element={<PlayerBalance />} />
            <Route path='/active-match' element={<ActiveMatch />} />
            <Route path='/in-active-match' element={<InActiveMatch />} />
            <Route path='/updateFancyStatus' element={<UpdateFancyStatus />} />
            <Route path='/SuspendedResult' element={<SuspendedResult />} />
            <Route path='/SuspendedFancyResult' element={<SuspendedFancyResult />} />
            <Route path='/SuspendedMarketResult' element={<SuspendedMarketResult />} />
            <Route path='/viewBets' element={<ViewBets />} />
            <Route path='/inactive-users' element={<InactiveUsers />} />
            <Route path='/BetLockUser' element={<BetLockedUsers />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;