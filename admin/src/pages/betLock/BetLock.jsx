import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoLockClosed, IoPeople } from 'react-icons/io5';

const cards = [
  {
    title: 'Lock Application',
    description: 'Lock sports, bet types, leagues, or matches for all users.',
    path: '/lock-application',
    icon: IoLockClosed,
  },
  {
    title: 'Bet Locked Users',
    description: 'View users whose betting is locked at account level.',
    path: '/BetLockUser',
    icon: IoPeople,
  },
];

function BetLock() {
  const navigate = useNavigate();

  return (
    <div className="mt-4 p-2 font-['Times_New_Roman']">
      <h2 className="text-[#243a48] text-[16px] font-[700]">Bet Lock</h2>
      <p className="text-sm text-gray-600 mt-1">
        Manage application-wide bet locks and view locked user accounts.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 max-w-3xl">
        {cards.map(({ title, description, path, icon: Icon }) => (
          <button
            key={path}
            type="button"
            onClick={() => navigate(path)}
            className="text-left bg-[#e0e6e6] border border-[#7e97a7] rounded-lg p-4 hover:bg-[#d4dcde] transition-colors"
          >
            <div className="flex items-center gap-2 text-[#243a48] font-[700]">
              <Icon size={20} />
              {title}
            </div>
            <p className="text-sm text-gray-600 mt-2">{description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default BetLock;
