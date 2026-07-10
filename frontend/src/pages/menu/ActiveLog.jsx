import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MdArrowBackIos } from "react-icons/md";
import ActivelogCard from "../../components/menucomp/ActivelogCard";
import api from "../../utils/axiosConfig";
import { getUser } from "../../features/auth/authSlice";
import { useTranslation } from "../../i18n/LanguageContext";

function ActiveLog() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  useEffect(() => {
    const uid = user?._id;
    if (!uid) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const fetchLoginHistory = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/get/user-login-history/${uid}`);
        if (!cancelled) {
          const list = Array.isArray(res.data?.data) ? res.data.data : [];
          const sorted = [...list].sort(
            (a, b) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime()
          );
          setLogs(sorted);
        }
      } catch (err) {
        if (!cancelled) {
          const msg =
            err?.response?.data?.message ||
            err.message ||
            t('page.activeLog.fetchFailed');
          setError(msg);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchLoginHistory();
    return () => {
      cancelled = true;
    };
  }, [user?._id, t]);

  const totalPages = Math.max(1, Math.ceil(logs.length / itemsPerPage));
  const paginatedLogs = logs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="bg-[#141515] text-white space-y-3 px-4 md:w-[50%] mx-auto md:mt-12 w-full min-w-0 min-h-full pb-8">
      <div className="h-10 flex items-center">
        <div onClick={() => window.history.back()}>
          <MdArrowBackIos className="text-white text-md font-semibold" />
        </div>
        <span className="text-[18px] font-bold">
          {t('page.activeLog.title')}
        </span>
      </div>

      <div className="py-2">
        {loading && <p className="text-center mt-5">{t('common.loading')}</p>}
        {error && !loading && (
          <p className="text-center text-red-600 mt-5">{error}</p>
        )}

        {!loading && !error && logs.length === 0 && (
          <div className="rounded-lg shadow-md mt-4">
            <p className="text-gray-600 text-center">{t('page.activeLog.noData')}</p>
          </div>
        )}

        {!loading && !error && logs.length > 0 && (
          <>
            <ActivelogCard logdata={paginatedLogs} />
            <div className="mt-2 mb-4 flex items-center justify-between gap-2">
              <button
                type="button"
                className="rounded-md border border-[#2e363d] px-3 py-2 text-sm text-gray-200 disabled:opacity-50"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage <= 1}
              >
                {t('common.prev')}
              </button>
              <span className="text-xs md:text-sm text-gray-400">
                {t('common.page', { current: currentPage, total: totalPages })}
              </span>
              <button
                type="button"
                className="rounded-md border border-[#2e363d] px-3 py-2 text-sm text-gray-200 disabled:opacity-50"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage >= totalPages}
              >
                {t('common.next')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ActiveLog;
