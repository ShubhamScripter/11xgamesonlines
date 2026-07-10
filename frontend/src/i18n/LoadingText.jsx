import React from 'react';
import { useTranslation } from './LanguageContext';

export default function LoadingText({ className = 'text-white text-sm' }) {
  const { t } = useTranslation();
  return <div className={className}>{t('common.loading')}</div>;
}
