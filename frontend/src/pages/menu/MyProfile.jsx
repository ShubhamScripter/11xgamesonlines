import React from "react";
import { MdArrowBackIos } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import LanguageSwitcher from "../../i18n/LanguageSwitcher";
import { useTranslation } from "../../i18n/LanguageContext";

function MyProfile({ setProfileOpen }) {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isMobileSheet = typeof setProfileOpen === "function";
  const closeProfile = () => setProfileOpen?.(false);

  return (
    <div className={`flex flex-col min-h-full bg-[#141515] ${isMobileSheet ? "" : "md:mt-12"}`}>
      {isMobileSheet ? (
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-[#1a1a1a]">
          <button
            type="button"
            onClick={closeProfile}
            className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
            aria-label="Close profile"
          >
            <MdArrowBackIos className="text-lg" />
            <span className="text-sm font-medium">{t('profile.back')}</span>
          </button>
          <span className="text-[17px] font-bold text-white">{t('profile.title')}</span>
          <button
            type="button"
            onClick={closeProfile}
            className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-[#303232] transition-colors"
            aria-label="Close profile"
          >
            <IoClose className="text-2xl" />
          </button>
        </div>
      ) : (
        <div className="hidden md:flex items-center justify-between text-[18px] font-bold gap-2 h-[66px] px-4 bg-[#1a1a1a]">
          <span className="text-white">{t('profile.title')}</span>
          <LanguageSwitcher />
        </div>
      )}
      <div className="flex flex-col items-center flex-1 px-2 pb-4">
        {isMobileSheet ? (
          <div className="w-full flex justify-end px-2 pt-3">
            <LanguageSwitcher />
          </div>
        ) : null}
        <table className="shadow-md rounded-lg md:mt-4 w-full">
          <tbody>
            <tr className="border-b border-gray-700">
              <td colSpan={1} className="p-2">
                <span className="text-gray-300 text-md">{t('profile.username')}</span>
              </td>
              <td colSpan={2} className="p-2">
                <span className="text-gray-300 text-md">{user?.userName || '—'}</span>
              </td>
            </tr>
            <tr className="border-b border-gray-700">
              <td colSpan={1} className="p-2">
                <span className="text-gray-300 text-md">{t('profile.email')}</span>
              </td>
              <td colSpan={2} className="p-2">
                <span className="text-gray-300 text-md">{user?.email}</span>
              </td>
            </tr>
            <tr className="border-b border-gray-700">
              <td colSpan={1} className="p-2">
                <span className="text-gray-300 text-md">{t('profile.language')}</span>
              </td>
              <td colSpan={2} className="p-2">
                <LanguageSwitcher />
              </td>
            </tr>
            <tr>
              <td colSpan={1} className="p-2">
                <span className="text-gray-300 text-md">{t('profile.password')}</span>
              </td>
              <td colSpan={1} className="p-2">
                <span className="text-gray-300 text-md">********</span>
              </td>
              <td colSpan={1} className="p-2">
                <button
                  onClick={() => navigate("/user/change-password")}
                  type="button"
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200"
                >
                  {t('profile.edit')}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MyProfile;
