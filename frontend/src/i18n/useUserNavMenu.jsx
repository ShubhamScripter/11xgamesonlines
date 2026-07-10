import { useMemo } from 'react';
import { useTranslation } from './LanguageContext';
import { casinoData } from '../components/casinocomp/data/CasinoData';

import slotColor from '../assets/icon/icon-slotColor.png';
import fishColor from '../assets/icon/icon-fishColor.png';
import crashColor from '../assets/icon/icon-crashColor.png';
import arcadeColor from '../assets/icon/icon-arcadeColor.png';
import casinoColor from '../assets/icon/icon-casinoColor.png';
import tableColor from '../assets/icon/icon-tableColor.png';
import cricketColor from '../assets/icon/cricketball-CqVRg2R3.png';
import tennisColor from '../assets/icon/tennisball-CRn_0kNy.png';
import footballColor from '../assets/icon/football-CcbDrciO.png';
import {
  RiWallet3Fill,
  RiFileList3Fill,
  RiHandCoinFill,
  RiHistoryFill,
  RiEyeLine,
  RiUser3Fill,
  RiLogoutBoxRFill,
  RiBankCardFill,
  RiCalendarCheckFill,
  RiGiftFill,
  RiShareForwardFill,
} from 'react-icons/ri';

function getProviders(gameType) {
  const providers = Object.entries(casinoData.providers)
    .filter(([, games]) =>
      games.some((g) =>
        g.game_type?.toLowerCase().includes(gameType.toLowerCase())
      )
    )
    .map(([key]) => key);
  return ['all', ...providers];
}

function getLeagues(matches) {
  if (!matches || !Array.isArray(matches)) return [];
  const leagues = [
    ...new Set(matches.map((m) => m.title || m.cname || 'Unknown League')),
  ];
  return ['All', ...leagues];
}

export function useUserNavMenu({
  cricketMatches,
  soccerMatches,
  tennisMatches,
  cricketInplayCount,
  soccerInplayCount,
  tennisInplayCount,
  currentBetCount,
}) {
  const { t } = useTranslation();

  return useMemo(() => {
    const cricketLeagues = getLeagues(cricketMatches);
    const soccerLeagues = getLeagues(soccerMatches);
    const tennisLeagues = getLeagues(tennisMatches);

    return [
      {
        labelKey: 'menu.cricket',
        label: t('menu.cricket'),
        icon: cricketColor,
        sportType: 'Cricket',
        sportPath: '/cricket',
        subItems: cricketLeagues,
        badge: cricketInplayCount > 0 ? cricketInplayCount : undefined,
      },
      {
        labelKey: 'menu.football',
        label: t('menu.football'),
        icon: footballColor,
        sportType: 'Soccer',
        sportPath: '/football',
        subItems: soccerLeagues,
        badge: soccerInplayCount > 0 ? soccerInplayCount : undefined,
      },
      {
        labelKey: 'menu.tennis',
        label: t('menu.tennis'),
        icon: tennisColor,
        sportType: 'Tennis',
        sportPath: '/tennis',
        subItems: tennisLeagues,
        badge: tennisInplayCount > 0 ? tennisInplayCount : undefined,
      },
      {
        labelKey: 'menu.casino',
        label: t('menu.casino'),
        icon: casinoColor,
        gameType: 'casino',
        subItems: getProviders('casino'),
      },
      {
        labelKey: 'menu.crash',
        label: t('menu.crash'),
        icon: crashColor,
        gameType: 'crash',
        subItems: getProviders('crash'),
      },
      {
        labelKey: 'menu.slot',
        label: t('menu.slot'),
        icon: slotColor,
        gameType: 'slot',
        subItems: getProviders('slot'),
      },
      {
        labelKey: 'menu.table',
        label: t('menu.table'),
        icon: tableColor,
        gameType: 'table',
        subItems: getProviders('table'),
      },
      {
        labelKey: 'menu.fishing',
        label: t('menu.fishing'),
        icon: fishColor,
        gameType: 'fishing',
        subItems: getProviders('fish'),
      },
      {
        labelKey: 'menu.arcade',
        label: t('menu.arcade'),
        icon: arcadeColor,
        gameType: 'arcade',
        subItems: getProviders('arcade'),
      },
      {
        labelKey: 'menu.balanceOverview',
        label: t('menu.balanceOverview'),
        icon: <RiWallet3Fill />,
        path: '/user/balance-overview',
      },
      {
        labelKey: 'menu.accountStatement',
        label: t('menu.accountStatement'),
        icon: <RiFileList3Fill />,
        path: '/user/account-statement',
      },
      {
        labelKey: 'menu.currentBets',
        label: t('menu.currentBets'),
        icon: <RiHandCoinFill />,
        path: '/user/current-bets',
        badge: currentBetCount,
      },
      {
        labelKey: 'menu.betsHistory',
        label: t('menu.betsHistory'),
        icon: <RiHistoryFill />,
        path: '/user/bet-history',
      },
      {
        labelKey: 'menu.activeLog',
        label: t('menu.activeLog'),
        icon: <RiEyeLine />,
        path: '/user/active-log',
      },
      {
        labelKey: 'menu.myProfile',
        label: t('menu.myProfile'),
        icon: <RiUser3Fill />,
        path: '/user/profile',
      },
      {
        labelKey: 'menu.dailyAttendance',
        label: t('menu.dailyAttendance'),
        icon: <RiCalendarCheckFill />,
        path: '/user/attendance',
      },
      {
        labelKey: 'menu.giftCoupon',
        label: t('menu.giftCoupon'),
        icon: <RiGiftFill />,
        path: '/user/gift-coupon',
      },
      {
        labelKey: 'menu.myReferrals',
        label: t('menu.myReferrals'),
        icon: <RiShareForwardFill />,
        path: '/user/referral',
      },
      {
        labelKey: 'menu.selfDepositWithdraw',
        label: t('menu.selfDepositWithdraw'),
        icon: <RiBankCardFill />,
        path: '/user/manual-deposit',
      },
      {
        labelKey: 'menu.logout',
        label: t('menu.logout'),
        icon: <RiLogoutBoxRFill />,
        action: 'logout',
      },
    ];
  }, [
    t,
    cricketMatches,
    soccerMatches,
    tennisMatches,
    cricketInplayCount,
    soccerInplayCount,
    tennisInplayCount,
    currentBetCount,
  ]);
}

export function translateSubItemLabel(t, sub) {
  if (sub === 'All' || sub === 'all') return t('menu.all');
  return sub === 'all' ? t('menu.all') : sub;
}
