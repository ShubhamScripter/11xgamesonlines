import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import api from '../utils/axiosConfig';
import { setUserLanguage } from '../features/auth/authSlice';
import {
  getStoredLanguage,
  normalizeLanguage,
  setStoredLanguage,
  translate,
} from './translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const [language, setLanguage] = useState(() => getStoredLanguage());

  useEffect(() => {
    const fromUser = user?.preferredLanguage;
    if (fromUser) {
      const normalized = normalizeLanguage(fromUser);
      setLanguage(normalized);
      setStoredLanguage(normalized);
    }
  }, [user?.preferredLanguage]);

  useEffect(() => {
    document.documentElement.lang =
      language === 'bn' ? 'bn' : language === 'hn' ? 'hi' : 'en';
  }, [language]);

  const changeLanguage = useCallback(
    async (nextLang) => {
      const normalized = normalizeLanguage(nextLang);
      if (normalized === language) return;

      setLanguage(normalized);
      setStoredLanguage(normalized);
      dispatch(setUserLanguage({ language: normalized }));

      if (token) {
        try {
          const res = await api.put('/update/language', { language: normalized });
          if (res.data?.data) {
            dispatch(
              setUserLanguage({ language: normalized, userData: res.data.data })
            );
          }
          toast.success(translate(normalized, 'lang.updated'));
        } catch (err) {
          toast.error(
            err?.response?.data?.message ||
              translate(normalized, 'lang.updateFailed')
          );
        }
      }
    },
    [dispatch, language, token]
  );

  const t = useCallback(
    (key, vars) => translate(language, key, vars),
    [language]
  );

  const value = useMemo(
    () => ({ language, changeLanguage, t }),
    [language, changeLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useTranslation must be used within LanguageProvider');
  }
  return ctx;
}
