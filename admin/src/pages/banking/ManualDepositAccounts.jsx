import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { FaToggleOff, FaToggleOn } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosInstance';
import ImagePreviewLink from '../../components/ImagePreviewLink';
import { resolveUploadUrl } from '../../utils/uploadUrl';
import { formatAppDate } from '../../utils/time';
import {
  MAX_ACCOUNTS_PER_METHOD,
  SECTION_HELP,
  validateAdminDepositAccountForm,
} from '../../utils/depositAccountValidation';

const METHOD_SECTIONS = [
  { key: 'bkash', label: 'bKash', color: '#e2136e', bg: '#fce7f3' },
  { key: 'nagad', label: 'Nagad', color: '#f97316', bg: '#ffedd5' },
  { key: 'rocket', label: 'Rocket', color: '#7c3aed', bg: '#f3e8ff' },
  { key: 'crypto', label: 'Crypto', color: '#d97706', bg: '#fff7ed' },
];

const EMPTY_FORM = {
  method: 'bkash',
  title: '',
  isActive: true,
  walletAddress: '',
  network: '',
  note: '',
  phoneNumber: '',
  accountType: 'Personal',
  minAmount: '',
};

function ManualDepositAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [activeSection, setActiveSection] = useState('bkash');
  const [activeMainTab, setActiveMainTab] = useState('add');
  const [accountImageFile, setAccountImageFile] = useState(null);
  const [accountImagePreview, setAccountImagePreview] = useState('');
  const [existingQrUrl, setExistingQrUrl] = useState('');
  const [togglingId, setTogglingId] = useState('');

  const accountsForSection = accounts.filter((a) => a.method === activeSection);
  const sectionMeta = METHOD_SECTIONS.find((s) => s.key === activeSection) || METHOD_SECTIONS[0];
  const sectionAtLimit = !editingId && accountsForSection.length >= MAX_ACCOUNTS_PER_METHOD;

  const sortAccounts = (list) =>
    [...list].sort((a, b) => {
      const methodCmp = String(a.method || '').localeCompare(String(b.method || ''));
      if (methodCmp !== 0) return methodCmp;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  const fetchAccounts = async () => {
    try {
      const res = await axiosInstance.get('/admin/deposit-accounts', {
        params: { _: Date.now() },
      });
      setAccounts(Array.isArray(res?.data?.data) ? sortAccounts(res.data.data) : []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load accounts');
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (activeMainTab === 'view') {
      fetchAccounts();
    }
  }, [activeMainTab]);

  useEffect(() => {
    return () => {
      if (accountImagePreview) URL.revokeObjectURL(accountImagePreview);
    };
  }, [accountImagePreview]);

  const formQrPreview = useMemo(() => {
    if (accountImagePreview) return accountImagePreview;
    if (existingQrUrl) return resolveUploadUrl(existingQrUrl);
    return '';
  }, [accountImagePreview, existingQrUrl]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm((prev) => ({ ...EMPTY_FORM, method: prev.method || 'bkash' }));
    setEditingId('');
    setAccountImageFile(null);
    if (accountImagePreview) URL.revokeObjectURL(accountImagePreview);
    setAccountImagePreview('');
    setExistingQrUrl('');
  };

  const handleQrFileChange = (file) => {
    if (accountImagePreview) URL.revokeObjectURL(accountImagePreview);
    setAccountImageFile(file);
    setAccountImagePreview(file ? URL.createObjectURL(file) : '');
  };

  const submitForm = async (e) => {
    e.preventDefault();
    if (sectionAtLimit) {
      toast.error(`Maximum ${MAX_ACCOUNTS_PER_METHOD} accounts allowed for this section`);
      return;
    }

    const validation = validateAdminDepositAccountForm(form);
    if (!validation.ok) {
      toast.error(validation.message);
      return;
    }

    const detailsPayload = {
      walletAddress: form.walletAddress,
      network: form.network,
      note: form.note,
      phoneNumber: form.phoneNumber,
      accountType: form.accountType,
      minAmount: form.minAmount ? Number(form.minAmount) : undefined,
    };

    const payload = new FormData();
    payload.append('method', form.method);
    payload.append('title', form.title.trim());
    payload.append('isActive', String(Boolean(form.isActive)));
    payload.append('details', JSON.stringify(detailsPayload));
    if (accountImageFile) {
      payload.append('accountImage', accountImageFile);
    }

    setSubmitting(true);
    try {
      if (editingId) {
        const res = await axiosInstance.put(`/admin/deposit-accounts/${editingId}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const updated = res?.data?.data;
        if (updated?._id) {
          setAccounts((prev) =>
            sortAccounts(prev.map((a) => (String(a._id) === String(updated._id) ? updated : a)))
          );
        }
        toast.success('Account updated');
      } else {
        const res = await axiosInstance.post('/admin/deposit-accounts', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const created = res?.data?.data;
        if (created?._id) {
          setAccounts((prev) => {
            if (prev.some((a) => String(a._id) === String(created._id))) return prev;
            return sortAccounts([...prev, created]);
          });
        }
        toast.success('Account created');
        setActiveSection(created?.method || form.method);
        setActiveMainTab('view');
      }
      resetForm();
      await fetchAccounts();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (account) => {
    setActiveMainTab('add');
    setActiveSection(account.method || 'bkash');
    setEditingId(account._id);
    setAccountImageFile(null);
    if (accountImagePreview) URL.revokeObjectURL(accountImagePreview);
    setAccountImagePreview('');
    setExistingQrUrl(account.details?.qrCodeUrl || '');
    setForm({
      method: account.method || 'bkash',
      title: account.title || '',
      isActive: account.isActive !== false,
      walletAddress: account.details?.walletAddress || '',
      network: account.details?.network || '',
      note: account.details?.note || '',
      phoneNumber: account.details?.phoneNumber || '',
      accountType: account.details?.accountType || 'Personal',
      minAmount: account.details?.minAmount ?? '',
    });
  };

  const handleDelete = async (accountId) => {
    const ok = window.confirm('Are you sure you want to delete this deposit account?');
    if (!ok) return;

    setDeletingId(accountId);
    try {
      await axiosInstance.delete(`/admin/deposit-accounts/${accountId}`);
      setAccounts((prev) => prev.filter((a) => String(a._id) !== String(accountId)));
      toast.success('Account deleted');
      if (editingId === accountId) {
        resetForm();
      }
      await fetchAccounts();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Delete failed');
    } finally {
      setDeletingId('');
    }
  };

  const handleToggleActive = async (account) => {
    const accountId = account?._id;
    if (!accountId) return;

    const newActiveValue = account?.isActive ? false : true;
    const ok = window.confirm(
      `Do you want to ${newActiveValue ? 'enable' : 'disable'} this ${account.method} account?`
    );
    if (!ok) return;

    setTogglingId(accountId);
    try {
      const payload = new FormData();
      payload.append('isActive', String(newActiveValue));

      const res = await axiosInstance.put(`/admin/deposit-accounts/${accountId}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updated = res?.data?.data;
      if (updated?._id) {
        setAccounts((prev) =>
          sortAccounts(prev.map((a) => (String(a._id) === String(updated._id) ? updated : a)))
        );
      } else {
        setAccounts((prev) =>
          sortAccounts(
            prev.map((a) =>
              String(a._id) === String(accountId) ? { ...a, isActive: newActiveValue } : a
            )
          )
        );
      }

      toast.success(`Account ${newActiveValue ? 'enabled' : 'disabled'}`);
      await fetchAccounts();
      // If currently editing this account, reflect status in form
      if (editingId === accountId) {
        setForm((prev) => ({ ...prev, isActive: newActiveValue }));
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Update failed');
    } finally {
      setTogglingId('');
    }
  };

  const handleSectionChange = (method) => {
    setActiveSection(method);
    if (activeMainTab === 'add') {
      setEditingId('');
      setAccountImageFile(null);
      if (accountImagePreview) URL.revokeObjectURL(accountImagePreview);
      setAccountImagePreview('');
      setExistingQrUrl('');
      setForm({ ...EMPTY_FORM, method });
    }
  };

  const getSubmitButtonText = () => {
    if (submitting) return 'Saving...';
    if (editingId) return `Update ${form.method.toUpperCase()} Account`;
    return `Add ${form.method.toUpperCase()} Account`;
  };

  const formatDate = (value) => formatAppDate(value);

  const RequiredMark = () => <span className="text-red-600 ml-0.5">*</span>;

  const getTypeBadgeClass = (method) => {
    if (method === 'bkash') return 'bg-[#fce7f3] text-[#be185d]';
    if (method === 'nagad') return 'bg-[#ffedd5] text-[#c2410c]';
    if (method === 'rocket') return 'bg-[#f3e8ff] text-[#7e22ce]';
    if (method === 'crypto') return 'bg-[#fff7ed] text-[#b45309]';
    return 'bg-gray-100 text-gray-600';
  };

  const renderDetailsCell = (account) => {
    const details = account.details || {};
    const qrSrc = resolveUploadUrl(details.qrCodeUrl);
    if (['bkash', 'nagad', 'rocket'].includes(account.method)) {
      return (
        <div className="text-[11px] leading-5">
          <div><span className="font-semibold">Number:</span> {details.phoneNumber || '-'}</div>
          <div><span className="font-semibold">Type:</span> {details.accountType || 'Personal'}</div>
          <div><span className="font-semibold">Note:</span> {details.note || '-'}</div>
        </div>
      );
    }
    if (account.method === 'crypto') {
      return (
        <div className="text-[11px] leading-5 space-y-1">
          <div><span className="font-semibold">Network:</span> {details.network || '-'}</div>
          <div><span className="font-semibold">Wallet:</span> {details.walletAddress || '-'}</div>
          {details.qrCodeUrl ? (
            <div className="pt-1">
              <p className="text-[10px] text-gray-500 mb-1">QR — click to enlarge</p>
              <ImagePreviewLink
                href={qrSrc}
                thumbnail
                alt={`${account.title || 'Crypto'} QR`}
                thumbnailClassName="w-16 h-16 rounded-lg border border-gray-200 object-cover cursor-pointer hover:opacity-90 hover:ring-2 hover:ring-blue-400 transition"
              />
            </div>
          ) : null}
        </div>
      );
    }
    return <span className="text-gray-400">—</span>;
  };

  const renderMethodSpecificFields = () => {
    const inputClass =
      'w-full border border-gray-300 focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] p-2.5 rounded-lg mt-1.5 outline-none';
    const labelClass = 'text-xs font-semibold text-gray-700 uppercase tracking-wide';

    if (['bkash', 'nagad', 'rocket'].includes(activeSection)) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              Mobile Number<RequiredMark />
            </label>
            <input
              value={form.phoneNumber}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              className={inputClass}
              placeholder="01755224890"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Account Type</label>
            <select
              value={form.accountType}
              onChange={(e) => handleChange('accountType', e.target.value)}
              className={inputClass}
            >
              <option value="Personal">Personal</option>
              <option value="Agent">Agent</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Note (shown to user)</label>
            <input
              value={form.note}
              onChange={(e) => handleChange('note', e.target.value)}
              className={inputClass}
              placeholder="e.g. Send Money only"
            />
          </div>
          <div>
            <label className={labelClass}>Min amount (optional)</label>
            <input
              type="number"
              value={form.minAmount}
              onChange={(e) => handleChange('minAmount', e.target.value)}
              className={inputClass}
              placeholder="100"
            />
          </div>
        </div>
      );
    }

    if (activeSection === 'crypto') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              Network / Currency<RequiredMark />
            </label>
            <input
              value={form.network}
              onChange={(e) => handleChange('network', e.target.value)}
              className={inputClass}
              placeholder="e.g. TRC20 (Tron)"
              required
            />
          </div>
          <div>
            <label className={labelClass}>
              Wallet Address<RequiredMark />
            </label>
            <input
              value={form.walletAddress}
              onChange={(e) => handleChange('walletAddress', e.target.value)}
              className={inputClass}
              placeholder="Enter wallet address"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>QR Code Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleQrFileChange(e.target.files?.[0] || null)}
              className={`${inputClass} file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-[#2563eb] file:text-white file:text-xs`}
            />
            {formQrPreview ? (
              <div className="mt-3">
                <p className="text-[11px] text-gray-500 mb-2">
                  Preview — click image to view full size
                </p>
                <ImagePreviewLink
                  href={formQrPreview}
                  thumbnail
                  alt="QR code preview"
                  thumbnailClassName="w-28 h-28 rounded-xl border-2 border-gray-200 object-cover cursor-pointer hover:opacity-95 hover:ring-2 hover:ring-[#2563eb] transition shadow-sm"
                />
              </div>
            ) : null}
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Note</label>
            <input
              value={form.note}
              onChange={(e) => handleChange('note', e.target.value)}
              className={inputClass}
              placeholder="Optional note"
            />
          </div>
        </div>
      );
    }

    return null;
  };

  const sectionHelp = SECTION_HELP[activeSection] || null;
  const sectionLabel = sectionMeta.label;

  return (
    <div className="mt-4 p-2 md:p-4 max-w-6xl">
      <div className="mb-5">
        <h2 className="text-2xl md:text-3xl font-bold text-[#111827]">Deposit Accounts</h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage bKash, Nagad, Rocket &amp; Crypto payment accounts for user deposits.
        </p>
      </div>

      <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-sm overflow-hidden mb-4">
        <div className="flex border-b border-[#e5e7eb]">
          <button
            type="button"
            className={`flex-1 sm:flex-none px-5 py-3 text-sm font-semibold transition ${
              activeMainTab === 'add'
                ? 'text-[#1d4ed8] border-b-2 border-[#1d4ed8] bg-blue-50/50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            onClick={() => setActiveMainTab('add')}
          >
            Add Account
          </button>
          <button
            type="button"
            className={`flex-1 sm:flex-none px-5 py-3 text-sm font-semibold transition ${
              activeMainTab === 'view'
                ? 'text-[#1d4ed8] border-b-2 border-[#1d4ed8] bg-blue-50/50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            onClick={() => setActiveMainTab('view')}
          >
            View Accounts
            <span className="ml-1.5 inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-[#1d4ed8] text-white text-[11px]">
              {accounts.length}
            </span>
          </button>
        </div>

        <div className="p-4 bg-[#f8fafc] border-b border-[#e5e7eb]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <p className="text-xs text-gray-600 font-medium">
              {activeMainTab === 'view'
                ? `Showing ${sectionLabel} accounts · filter by section`
                : `Adding account for ${sectionLabel} · up to ${MAX_ACCOUNTS_PER_METHOD} per section`}
            </p>
            <p className="text-[11px] text-gray-500">
              Total: {accounts.length} account{accounts.length === 1 ? '' : 's'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {METHOD_SECTIONS.map(({ key, label, color, bg }) => {
              const count = accounts.filter((a) => a.method === key).length;
              const selected = activeSection === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSectionChange(key)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold border transition ${
                    selected
                      ? 'text-white border-transparent shadow-md'
                      : 'bg-white text-gray-800 border-[#d1d5db] hover:border-gray-400'
                  }`}
                  style={
                    selected
                      ? { backgroundColor: color, borderColor: color }
                      : { backgroundColor: count > 0 ? bg : undefined }
                  }
                >
                  {label}
                  <span className={`ml-1.5 ${selected ? 'opacity-90' : 'text-gray-500'}`}>
                    ({count}/{MAX_ACCOUNTS_PER_METHOD})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {activeMainTab === 'add' ? (
        <form
          onSubmit={submitForm}
          className="bg-white border border-[#e5e7eb] rounded-xl shadow-sm p-5 md:p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
            <div>
              <h3 className="text-xl font-bold text-[#111827] capitalize flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: sectionMeta.color }}
                />
                {sectionLabel} Account
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {accountsForSection.length}/{MAX_ACCOUNTS_PER_METHOD} accounts in this section
                {sectionAtLimit ? (
                  <span className="text-red-600 font-semibold"> · limit reached</span>
                ) : null}
              </p>
            </div>
            {editingId && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                Editing mode
              </span>
            )}
          </div>

          {sectionHelp && (
            <div className="mb-5 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4 text-xs text-gray-800">
              <p className="font-bold text-sm text-[#1d4ed8] mb-2">{sectionHelp.title}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <p className="font-semibold text-gray-700 mb-1">Required fields</p>
                  <ul className="list-disc ml-4 space-y-0.5">
                    {sectionHelp.required.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 mb-1">Optional</p>
                  <ul className="list-disc ml-4 space-y-0.5">
                    {sectionHelp.optional.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="font-semibold text-gray-700 mt-3 mb-1">User will submit</p>
              <ul className="list-disc ml-4 space-y-0.5">
                {sectionHelp.userNeeds.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {sectionHelp.distribution && (
                <p className="mt-3 text-[#1d4ed8] font-semibold border-t border-blue-100 pt-2">
                  {sectionHelp.distribution}
                </p>
              )}
            </div>
          )}

          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Account Title<RequiredMark />
            </label>
            <input
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full border border-gray-300 focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] p-2.5 rounded-lg mt-1.5 outline-none"
              placeholder={`e.g. ${sectionLabel} Account 1`}
              required
            />
          </div>

          {renderMethodSpecificFields()}

          <label className="flex items-center gap-2.5 mt-4 cursor-pointer w-fit">
            <input
              id="isActive"
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => handleChange('isActive', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#2563eb]"
            />
            <span className="text-sm font-medium text-gray-700">Active — visible to users</span>
          </label>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
            <button
              className="px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200"
              type="button"
              onClick={resetForm}
            >
              Clear
            </button>
            <button
              className="px-5 py-2.5 rounded-lg font-semibold text-sm text-white bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={submitting || sectionAtLimit}
            >
              {getSubmitButtonText()}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 md:p-5 border-b border-[#e5e7eb] bg-[#f8fafc]">
            <div>
              <h3 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: sectionMeta.color }}
                />
                {sectionLabel} Accounts
                <span className="text-gray-500 font-normal text-base">
                  ({accountsForSection.length})
                </span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Only {sectionLabel} accounts are listed. Switch section above to view others.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchAccounts}
              className="shrink-0 bg-white border border-[#2563eb] text-[#2563eb] hover:bg-blue-50 px-4 py-2 rounded-lg text-xs font-semibold transition"
            >
              Refresh list
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Details</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {accountsForSection.length === 0 ? (
                  <tr>
                    <td className="px-4 py-12 text-center text-gray-500" colSpan={6}>
                      <p className="font-medium">No {sectionLabel} accounts yet</p>
                      <p className="text-xs mt-1">
                        Switch to Add Account tab to create one for this section.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveMainTab('add')}
                        className="mt-3 text-[#2563eb] text-xs font-semibold hover:underline"
                      >
                        Add {sectionLabel} account →
                      </button>
                    </td>
                  </tr>
                ) : (
                  accountsForSection.map((a) => (
                    <tr key={a._id} className="hover:bg-gray-50/80 align-top">
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] uppercase font-bold ${getTypeBadgeClass(a.method)}`}
                        >
                          {a.method}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{a.title || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{renderDetailsCell(a)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            a.isActive
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {a.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {formatDate(a.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap justify-end gap-1.5">
                          <button
                            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-2.5 py-1.5 rounded-md text-[11px] font-semibold disabled:opacity-60"
                            onClick={() => startEdit(a)}
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            className={`rounded-md px-2.5 py-1.5 text-[11px] font-semibold border disabled:opacity-60 ${
                              a.isActive
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100'
                            }`}
                            onClick={() => handleToggleActive(a)}
                            disabled={togglingId === a._id}
                            type="button"
                          >
                            {togglingId === a._id ? (
                              '...'
                            ) : a.isActive ? (
                              <span className="flex items-center gap-1">
                                <FaToggleOn size={12} /> Disable
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <FaToggleOff size={12} /> Enable
                              </span>
                            )}
                          </button>
                          <button
                            className="bg-red-500 hover:bg-red-600 text-white px-2.5 py-1.5 rounded-md text-[11px] font-semibold disabled:opacity-60"
                            onClick={() => handleDelete(a._id)}
                            disabled={deletingId === a._id}
                            type="button"
                          >
                            {deletingId === a._id ? '...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManualDepositAccounts;
