import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { FaToggleOff, FaToggleOn } from 'react-icons/fa';

const METHOD_SECTIONS = ['bank', 'upi', 'crypto', 'whatsapp'];

const EMPTY_FORM = {
  method: 'bank',
  title: '',
  isActive: true,
  accountHolderName: '',
  accountNumber: '',
  ifscCode: '',
  bankName: '',
  branchName: '',
  upiId: '',
  qrCodeUrl: '',
  walletAddress: '',
  network: '',
  note: '',
  phoneNumber: '',
};

function ManualDepositAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [activeSection, setActiveSection] = useState('bank');
  const [activeMainTab, setActiveMainTab] = useState('add');
  const [accountImageFile, setAccountImageFile] = useState(null);
  const [togglingId, setTogglingId] = useState('');

  const imageBase = (axiosInstance?.defaults?.baseURL || '').replace('/api', '');
  const resolveImageUrl = (value) => {
    let src = String(value || '').trim();
    if (
      (src.startsWith('"') && src.endsWith('"')) ||
      (src.startsWith("'") && src.endsWith("'"))
    ) {
      src = src.slice(1, -1).trim();
    }
    if (!src) return '';
    if (src.startsWith('http')) return src;
    return `${imageBase}${src.startsWith('/') ? src : `/${src}`}`;
  };

  const fetchAccounts = async () => {
    try {
      const res = await axiosInstance.get('/admin/deposit-accounts');
      setAccounts(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load accounts');
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm((prev) => ({ ...EMPTY_FORM, method: prev.method || 'bank' }));
    setEditingId('');
    setAccountImageFile(null);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }

    const detailsPayload = {
      accountHolderName: form.accountHolderName,
      accountNumber: form.accountNumber,
      ifscCode: form.ifscCode,
      bankName: form.bankName,
      branchName: form.branchName,
      upiId: form.upiId,
      qrCodeUrl: form.qrCodeUrl,
      walletAddress: form.walletAddress,
      network: form.network,
      note: form.note,
      phoneNumber: form.phoneNumber,
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
        await axiosInstance.put(`/admin/deposit-accounts/${editingId}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Account updated');
      } else {
        await axiosInstance.post('/admin/deposit-accounts', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Account created');
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
    setActiveSection(account.method || 'bank');
    setEditingId(account._id);
    setAccountImageFile(null);
    setForm({
      method: account.method || 'bank',
      title: account.title || '',
      isActive: account.isActive !== false,
      accountHolderName: account.details?.accountHolderName || '',
      accountNumber: account.details?.accountNumber || '',
      ifscCode: account.details?.ifscCode || '',
      bankName: account.details?.bankName || '',
      branchName: account.details?.branchName || '',
      upiId: account.details?.upiId || '',
      qrCodeUrl: account.details?.qrCodeUrl || '',
      walletAddress: account.details?.walletAddress || '',
      network: account.details?.network || '',
      note: account.details?.note || '',
      phoneNumber: account.details?.phoneNumber || '',
    });
  };

  const handleDelete = async (accountId) => {
    const ok = window.confirm('Are you sure you want to delete this deposit account?');
    if (!ok) return;

    setDeletingId(accountId);
    try {
      await axiosInstance.delete(`/admin/deposit-accounts/${accountId}`);
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

      await axiosInstance.put(`/admin/deposit-accounts/${accountId}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

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

  const handleMethodChange = (method) => {
    setActiveSection(method);
    setEditingId('');
    setAccountImageFile(null);
    setForm({ ...EMPTY_FORM, method });
  };

  const getSubmitButtonText = () => {
    if (submitting) return 'Saving...';
    if (editingId) return `Update ${form.method.toUpperCase()} Account`;
    return `Add ${form.method.toUpperCase()} Account`;
  };

  const formatDate = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-GB');
  };

  const getTypeBadgeClass = (method) => {
    if (method === 'bank') return 'bg-[#e8f1ff] text-[#0b4bb3]';
    if (method === 'upi') return 'bg-[#eef2ff] text-[#334155]';
    if (method === 'crypto') return 'bg-[#fff7ed] text-[#b45309]';
    return 'bg-[#e8fdf1] text-[#15803d]';
  };

  const renderDetailsCell = (account) => {
    const details = account.details || {};
    const qrSrc = resolveImageUrl(details.qrCodeUrl);
    if (account.method === 'upi') {
      return (
        <div className="space-y-1">
          <div className="font-semibold text-[11px]">
            UPI ID: <span className="font-normal">{details.upiId || '-'}</span>
          </div>
          {details.qrCodeUrl ? (
            <img
              src={qrSrc}
              alt="UPI QR"
              className="w-16 h-16 rounded border object-cover"
              onError={(e) => {
                try {
                  const raw = String(details.qrCodeUrl || '');
                  const parsed = raw.startsWith('http') ? new URL(raw) : null;
                  const fallbackPath = parsed?.pathname || raw;
                  if (!e.currentTarget.dataset.fallback) {
                    e.currentTarget.dataset.fallback = '1';
                    e.currentTarget.src = `${window.location.origin}${fallbackPath.startsWith('/') ? fallbackPath : `/${fallbackPath}`}`;
                  }
                } catch {
                  // ignore fallback errors
                }
              }}
            />
          ) : (
            <div className="text-[11px] text-gray-500">No QR</div>
          )}
        </div>
      );
    }
    if (account.method === 'bank') {
      return (
        <div className="text-[11px] leading-5">
          <div><span className="font-semibold">Account:</span> {details.accountNumber || '-'}</div>
          <div><span className="font-semibold">Holder:</span> {details.accountHolderName || '-'}</div>
          <div><span className="font-semibold">Bank:</span> {details.bankName || '-'}</div>
          <div><span className="font-semibold">IFSC:</span> {details.ifscCode || '-'}</div>
        </div>
      );
    }
    if (account.method === 'crypto') {
      return (
        <div className="text-[11px] leading-5">
          <div><span className="font-semibold">Currency:</span> {details.network || '-'}</div>
          <div><span className="font-semibold">Wallet:</span> {details.walletAddress || '-'}</div>
        </div>
      );
    }
    return (
      <div className="text-[11px] leading-5">
        <div><span className="font-semibold">Number:</span> {details.phoneNumber || '-'}</div>
        <div><span className="font-semibold">Note:</span> {details.note || '-'}</div>
      </div>
    );
  };

  const renderMethodSpecificFields = () => {
    if (activeSection === 'bank') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-700">Account Number *</label>
            <input value={form.accountNumber} onChange={(e) => handleChange('accountNumber', e.target.value)} className="w-full border p-2 rounded-lg mt-1" placeholder="Enter account number" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700">Account Holder Name *</label>
            <input value={form.accountHolderName} onChange={(e) => handleChange('accountHolderName', e.target.value)} className="w-full border p-2 rounded-lg mt-1" placeholder="Enter account holder name" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700">Bank Name *</label>
            <input value={form.bankName} onChange={(e) => handleChange('bankName', e.target.value)} className="w-full border p-2 rounded-lg mt-1" placeholder="Enter bank name" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700">Branch Name *</label>
            <input value={form.branchName} onChange={(e) => handleChange('branchName', e.target.value)} className="w-full border p-2 rounded-lg mt-1" placeholder="Enter branch name" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700">IFSC Code *</label>
            <input value={form.ifscCode} onChange={(e) => handleChange('ifscCode', e.target.value)} className="w-full border p-2 rounded-lg mt-1" placeholder="Enter IFSC code" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700">Note</label>
            <input value={form.note} onChange={(e) => handleChange('note', e.target.value)} className="w-full border p-2 rounded-lg mt-1" placeholder="Optional note" />
          </div>
        </div>
      );
    }

    if (activeSection === 'upi') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-700">QR Code Image *</label>
            <input type="file" accept="image/*" onChange={(e) => setAccountImageFile(e.target.files?.[0] || null)} className="w-full border p-2 rounded-lg mt-1" />
            {accountImageFile ? (
              <img
                src={URL.createObjectURL(accountImageFile)}
                alt="Selected QR Preview"
                className="mt-2 w-24 h-24 rounded border object-cover"
              />
            ) : null}
            {form.qrCodeUrl ? (
              <div className="mt-1 text-[11px] text-gray-600">
                Existing image:{' '}
                <a
                  className="text-blue-600 underline"
                  href={resolveImageUrl(form.qrCodeUrl)}
                  target="_blank"
                  rel="noreferrer"
                >
                  View
                </a>
              </div>
            ) : null}
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700">UPI ID *</label>
            <input value={form.upiId} onChange={(e) => handleChange('upiId', e.target.value)} className="w-full border p-2 rounded-lg mt-1" placeholder="Enter UPI ID" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-gray-700">Note</label>
            <input value={form.note} onChange={(e) => handleChange('note', e.target.value)} className="w-full border p-2 rounded-lg mt-1" placeholder="Optional note" />
          </div>
        </div>
      );
    }

    if (activeSection === 'crypto') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-700">Network / Currency *</label>
            <input value={form.network} onChange={(e) => handleChange('network', e.target.value)} className="w-full border p-2 rounded-lg mt-1" placeholder="e.g. USDT-TRC20" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700">Wallet Address *</label>
            <input value={form.walletAddress} onChange={(e) => handleChange('walletAddress', e.target.value)} className="w-full border p-2 rounded-lg mt-1" placeholder="Enter wallet address" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-gray-700">Note</label>
            <input value={form.note} onChange={(e) => handleChange('note', e.target.value)} className="w-full border p-2 rounded-lg mt-1" placeholder="Optional note" />
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-700">WhatsApp Number *</label>
          <input value={form.phoneNumber} onChange={(e) => handleChange('phoneNumber', e.target.value)} className="w-full border p-2 rounded-lg mt-1" placeholder="Enter WhatsApp number" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700">Note</label>
          <input value={form.note} onChange={(e) => handleChange('note', e.target.value)} className="w-full border p-2 rounded-lg mt-1" placeholder="Optional note" />
        </div>
      </div>
    );
  };

  return (
    <div className='mt-4 p-2 font-["Times_New_Roman"]'>
      <h2 className="text-[#111827] text-[34px] font-[700] leading-[1.1] mb-3">Add Account</h2>

      <div className="border-b border-[#d1d5db] mb-3">
        <div className="flex items-center gap-4 text-sm font-semibold">
          <button type="button" className={`pb-2 border-b-2 ${activeMainTab === 'add' ? 'text-[#1d4ed8] border-[#1d4ed8]' : 'text-[#374151] border-transparent'}`} onClick={() => setActiveMainTab('add')}>
            Add Account
          </button>
          <button type="button" className={`pb-2 border-b-2 ${activeMainTab === 'view' ? 'text-[#1d4ed8] border-[#1d4ed8]' : 'text-[#374151] border-transparent'}`} onClick={() => setActiveMainTab('view')}>
            View Accounts ({accounts.length})
          </button>
        </div>
      </div>

      <div className="bg-[#f3f4f6] border border-[#e5e7eb] rounded-lg p-3 mb-4">
        <div className="flex flex-wrap gap-2">
          {METHOD_SECTIONS.map((methodKey) => (
            <button key={methodKey} type="button" onClick={() => handleMethodChange(methodKey)} className={`px-4 py-1.5 rounded-md text-xs font-semibold capitalize border ${activeSection === methodKey ? 'bg-[#2563eb] text-white border-[#1d4ed8]' : 'bg-white text-[#111827] border-[#d1d5db]'}`}>
              {methodKey}
            </button>
          ))}
        </div>
      </div>

      {activeMainTab === 'add' ? (
        <form onSubmit={submitForm} className="bg-[#f3f4f6] border border-[#e5e7eb] p-4 rounded-lg mb-4">
          <h3 className="text-[30px] font-bold text-[#111827] mb-4 capitalize">{activeSection} Account Details</h3>

          <div className="mb-3">
            <label className="text-xs font-semibold text-gray-700">Account Title *</label>
            <input value={form.title} onChange={(e) => handleChange('title', e.target.value)} className="w-full border p-2 rounded-lg mt-1" placeholder={`Enter ${activeSection} title`} />
          </div>

          {renderMethodSpecificFields()}

          <div className="flex items-center gap-2 mt-3">
            <input id="isActive" type="checkbox" checked={form.isActive} onChange={(e) => handleChange('isActive', e.target.checked)} />
            <label htmlFor="isActive" className="text-xs font-semibold text-gray-700">Active account</label>
          </div>

          <div className="flex justify-end gap-2 mt-5">
            <button className="bg-gray-200 px-3 py-2 rounded-md text-sm" type="button" onClick={resetForm}>Clear</button>
            <button className="bg-[#2563eb] text-white px-4 py-2 rounded-md font-semibold text-sm disabled:opacity-60" type="submit" disabled={submitting}>
              {getSubmitButtonText()}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-[#f3f4f6] border border-[#e5e7eb] rounded-lg p-3">
          <div className="bg-white border border-[#e5e7eb] rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[24px] font-bold text-[#111827]">All Accounts ({accounts.length})</h3>
              <button type="button" onClick={fetchAccounts} className="bg-[#2563eb] text-white px-3 py-1.5 rounded-md text-xs font-semibold">
                Refresh
              </button>
            </div>

            <div className="overflow-auto">
              <table className="w-full text-xs min-w-[940px] border border-[#d1d5db]">
                <thead className="bg-[#f9fafb]">
                  <tr>
                    <th className="p-2 text-left border-b border-r">Type</th>
                    <th className="p-2 text-left border-b border-r">Option</th>
                    <th className="p-2 text-left border-b border-r">Details</th>
                    <th className="p-2 text-left border-b border-r">Status</th>
                    <th className="p-2 text-left border-b border-r">Created</th>
                    <th className="p-2 text-left border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.length === 0 ? (
                    <tr>
                      <td className="p-3 text-center" colSpan={6}>No accounts found</td>
                    </tr>
                  ) : (
                    accounts.map((a) => (
                      <tr key={a._id} className="border-t align-top">
                        <td className="p-2 border-r">
                          <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold ${getTypeBadgeClass(a.method)}`}>{a.method}</span>
                        </td>
                        <td className="p-2 border-r">{a.title || '-'}</td>
                        <td className="p-2 border-r">{renderDetailsCell(a)}</td>
                        <td className="p-2 border-r">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${a.isActive ? 'bg-[#dcfce7] text-[#15803d]' : 'bg-[#fee2e2] text-[#b91c1c]'}`}>
                            {a.isActive ? 'active' : 'inactive'}
                          </span>
                        </td>
                        <td className="p-2 border-r">{formatDate(a.createdAt)}</td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <button
                              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-2 py-1 rounded-md text-[12px] font-semibold disabled:opacity-60 flex items-center gap-1"
                              onClick={() => startEdit(a)}
                              title="Edit"
                            >
                              <span className="leading-none">✎</span>
                              <span>Edit</span>
                            </button>
                            <button
                              className={`rounded-md px-2 py-1 text-[12px] font-semibold flex items-center gap-1 border disabled:opacity-60 ${
                                a.isActive
                                  ? 'bg-[#dcfce7] border-[#16a34a] text-[#15803d] hover:bg-[#d1fae5]'
                                  : 'bg-[#fee2e2] border-[#b91c1c] text-[#b91c1c] hover:bg-[#fecaca]'
                              }`}
                              onClick={() => handleToggleActive(a)}
                              disabled={togglingId === a._id}
                              title={a.isActive ? 'Disable account' : 'Enable account'}
                            >
                              {togglingId === a._id ? (
                                <span className="text-[12px] font-bold">...</span>
                              ) : a.isActive ? (
                                <>
                                  <FaToggleOn size={14} />
                                  <span>Disable</span>
                                </>
                              ) : (
                                <>
                                  <FaToggleOff size={14} />
                                  <span>Enable</span>
                                </>
                              )}
                            </button>
                            <button
                              className="bg-[#ef4444] hover:bg-[#dc2626] text-white px-2 py-1 rounded-md text-[12px] font-semibold disabled:opacity-60 flex items-center gap-1"
                              onClick={() => handleDelete(a._id)}
                              disabled={deletingId === a._id}
                              title="Delete"
                            >
                              {deletingId === a._id ? (
                                <span>...</span>
                              ) : (
                                <>
                                  <span className="leading-none">🗑</span>
                                  <span>Delete</span>
                                </>
                              )}
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
        </div>
      )}
    </div>
  );
}

export default ManualDepositAccounts;
