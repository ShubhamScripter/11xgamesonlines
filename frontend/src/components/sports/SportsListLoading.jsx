import React from 'react';
import Spinner from '../Spinner';

function SportsListLoading({ message = 'Loading matches...' }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0b0e11] gap-3">
      <Spinner />
      <p className="text-[#8b949e] text-sm">{message}</p>
    </div>
  );
}

export default SportsListLoading;
