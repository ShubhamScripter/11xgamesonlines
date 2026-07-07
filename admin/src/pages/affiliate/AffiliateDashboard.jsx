import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import axios from '../../utils/axiosInstance';

const ADMIN_ROLES = ['superadmin', 'admin', 'subadmin', 'seniorSuper'];
const AGENT_ROLES = ['agent', 'superAgent'];

function copyText(text) {
  if (!text) return;
  navigator.clipboard.writeText(text).then(
    () => toast.success('Copied to clipboard'),
    () => toast.error('Could not copy')
  );
}

/** Admin-only affiliate management. Agents use /agent-dashboard */
function AffiliateDashboard() {
  const user = useSelector((state) => state.auth.user);
  const isAdmin = ADMIN_ROLES.includes(user?.role);
  const isAgent = AGENT_ROLES.includes(user?.role);

  const [settings, setSettings] = useState({
    enabled: false,
    globalCommissionPercent: 0,
  });
  const [agents, setAgents] = useState([]);
  const [agentForm, setAgentForm] = useState({
    name: '',
    email: '',
    userName: '',
    password: '',
    commissionPercent: '',
  });
  const [globalPct, setGlobalPct] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadAdmin = async () => {
    const { data } = await axios.get('/admin/affiliate/agents');
    setSettings(data?.data?.settings || {});
    setAgents(data?.data?.agents || []);
    setGlobalPct(String(data?.data?.settings?.globalCommissionPercent ?? ''));
  };

  useEffect(() => {
    if (!isAdmin) return;
    const run = async () => {
      setLoading(true);
      try {
        await loadAdmin();
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to load affiliate data');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [isAdmin]);

  if (isAgent) {
    return <Navigate to="/agent-dashboard" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="p-4 text-[#243a48] font-['Times_New_Roman']">
        Affiliate management is for admins only.
      </div>
    );
  }

  const saveGlobalSettings = async () => {
    setSaving(true);
    try {
      await axios.put('/admin/affiliate/settings', {
        affiliateModuleEnabled: settings.enabled,
        globalCommissionPercent: Number(globalPct),
      });
      toast.success('Affiliate settings saved.');
      await loadAdmin();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const createAgent = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post('/admin/affiliate/agents', {
        ...agentForm,
        commissionPercent:
          agentForm.commissionPercent !== ''
            ? Number(agentForm.commissionPercent)
            : undefined,
      });
      setAgentForm({ name: '', email: '', userName: '', password: '', commissionPercent: '' });
      await loadAdmin();
      toast.success('Agent created successfully.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Create failed');
    } finally {
      setSaving(false);
    }
  };

  const updateAgentPct = async (agentId, pct) => {
    try {
      await axios.put(`/admin/affiliate/agents/${agentId}/commission`, {
        commissionPercent: Number(pct),
      });
      await loadAdmin();
      toast.success('Commission updated.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed');
    }
  };

  if (loading) {
    return <div className="p-4 text-[#243a48]">Loading affiliate data...</div>;
  }

  return (
    <div className="mt-4 p-2 font-['Times_New_Roman'] max-w-6xl">
      <h1 className="text-[#243a48] text-[16px] font-[700]">Affiliate / Agent Management</h1>
      <p className="text-sm text-gray-600 mt-1">
        Configure affiliate module and manage agents. Agents view their own dashboard at Agent
        Dashboard after login.
      </p>

      <div className="space-y-4 mt-4">
        <section className="bg-[#e0e6e6] border-b border-b-[#7e97a7] p-4">
          <h2 className="text-[#243a48] font-[700]">Global Settings</h2>
          <label className="flex items-center gap-2 mt-3 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(settings.enabled)}
              onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm font-semibold text-[#243a48]">Enable affiliate module</span>
          </label>
          <div className="flex flex-wrap gap-3 items-end mt-3">
            <div>
              <label className="text-xs text-gray-600 block mb-1">Global commission %</label>
              <input
                className="border border-[#aaa] px-3 py-2 rounded w-24 text-sm bg-white"
                type="number"
                min="0"
                max="100"
                value={globalPct}
                onChange={(e) => setGlobalPct(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={saveGlobalSettings}
              disabled={saving}
              className="bg-[#243a48] text-white px-4 py-2 rounded text-sm font-semibold disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save settings'}
            </button>
          </div>
        </section>

        <section className="bg-[#e0e6e6] border-b border-b-[#7e97a7] p-4">
          <h2 className="text-[#243a48] font-[700] mb-3">Create Agent</h2>
          <form onSubmit={createAgent} className="grid md:grid-cols-3 gap-2">
            {[
              { key: 'name', label: 'Full name', type: 'text' },
              { key: 'email', label: 'Email', type: 'email' },
              { key: 'userName', label: 'Username', type: 'text' },
              { key: 'password', label: 'Password', type: 'password' },
              { key: 'commissionPercent', label: 'Commission % (optional)', type: 'number' },
            ].map(({ key, label, type }) => (
              <input
                key={key}
                className="border border-[#aaa] px-3 py-2 rounded text-sm bg-white"
                placeholder={label}
                type={type}
                value={agentForm[key]}
                onChange={(e) => setAgentForm({ ...agentForm, [key]: e.target.value })}
                required={key !== 'commissionPercent'}
              />
            ))}
            <button
              type="submit"
              disabled={saving}
              className="bg-[#243a48] text-white rounded px-4 py-2 text-sm font-semibold disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Agent'}
            </button>
          </form>
        </section>

        <section className="bg-white border border-[#7e97a7] overflow-x-auto">
          <h2 className="text-[#243a48] font-[700] p-3 border-b border-[#7e97a7]">
            Agents ({agents.length})
          </h2>
          <table className="w-full text-sm">
            <thead className="bg-[#e0e6e6]">
              <tr>
                <th className="text-left p-2">User</th>
                <th className="text-left p-2">Code</th>
                <th className="text-left p-2">Commission %</th>
                <th className="text-left p-2">Balance</th>
                <th className="text-left p-2">Referral Link</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((a) => (
                <tr key={a._id} className="border-t border-[#e0e6e6]">
                  <td className="p-2">{a.userName}</td>
                  <td className="p-2 font-mono">{a.code}</td>
                  <td className="p-2">
                    <input
                      className="border border-[#aaa] w-16 px-1 py-0.5 rounded"
                      type="number"
                      defaultValue={a.agentCommissionPercent ?? ''}
                      onBlur={(e) => updateAgentPct(a._id, e.target.value)}
                    />
                  </td>
                  <td className="p-2 font-semibold">{a.affiliateCommissionBalance ?? 0}</td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs break-all max-w-[200px]">{a.referralLink}</span>
                      <button
                        type="button"
                        onClick={() => copyText(a.referralLink)}
                        className="text-xs bg-[#243a48] text-white px-2 py-1 rounded shrink-0"
                      >
                        Copy
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!agents.length && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    No agents yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

export default AffiliateDashboard;
