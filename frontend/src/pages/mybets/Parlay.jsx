import React from 'react'
import { useTranslation } from '../../i18n/LanguageContext';

function Parlay({betdata}) {
  const { t } = useTranslation();

  return (
    <div>
        {betdata.length === 0 && (
            <div className="flex flex-col gap-4 pt-4">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold">{t('parlay.betDetails')}</h2>
                <p className="text-gray-700">{t('parlay.noCurrentBets')}</p>
              </div>
            </div>
          )}
    </div>
  )
}

export default Parlay
