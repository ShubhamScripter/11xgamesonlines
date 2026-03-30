import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "../../utils/axiosInstance";

const ALLOWED_ROLES = ["superadmin", "admin", "subadmin", "seniorSuper"];

function CustomerSupport() {
  const user = useSelector((state) => state.auth.user);
  const canManage = ALLOWED_ROLES.includes(user?.role);

  const [whatsappDialCode, setWhatsappDialCode] = useState("91");
  const [whatsappPhoneNational, setWhatsappPhoneNational] = useState("");
  const [waCountries, setWaCountries] = useState([]);
  const [savingWa, setSavingWa] = useState(false);

  useEffect(() => {
    if (!canManage) return;
    (async () => {
      try {
        const [settingsRes, countriesRes] = await Promise.all([
          axios.get("/admin/app-settings"),
          axios.get("/public/whatsapp-countries"),
        ]);
        const d = settingsRes.data?.data;
        if (d?.whatsappDialCode) setWhatsappDialCode(String(d.whatsappDialCode));
        if (d?.whatsappPhoneNational != null)
          setWhatsappPhoneNational(String(d.whatsappPhoneNational));
        const list = countriesRes.data?.data;
        if (Array.isArray(list) && list.length) {
          setWaCountries([...list].sort((a, b) => a.label.localeCompare(b.label)));
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, [canManage]);

  const saveSupportWhatsApp = async () => {
    setSavingWa(true);
    try {
      await axios.put("/admin/app-settings", {
        whatsappDialCode,
        whatsappPhoneNational: whatsappPhoneNational.replace(/\D/g, ""),
      });
      alert("WhatsApp support number saved.");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to save");
    } finally {
      setSavingWa(false);
    }
  };

  if (!canManage) {
    return (
      <div className='mt-4 p-4 font-["Times_New_Roman"]'>
        <h2 className="text-[#243a48] text-[16px] font-[700]">Customer support</h2>
        <p className="mt-2 text-red-600 text-sm">You do not have permission to manage this section.</p>
      </div>
    );
  }

  return (
    <div className='mt-4 p-2 font-["Times_New_Roman"]'>
      <h2 className="text-[#243a48] text-[16px] font-[700]">Customer support</h2>
      <p className="text-sm text-gray-600 mt-1 mb-4">
        WhatsApp number shown to users on the client app (floating button). Choose country and enter the mobile number without country code.
      </p>

      <div className="bg-white border border-[#7e97a7] rounded-lg p-4 shadow-sm max-w-2xl">
        <h3 className="text-[#243a48] font-[700] mb-1">WhatsApp</h3>
        <p className="text-sm text-gray-600 mb-3">
          Choose country, then enter <strong>only the mobile number</strong> (do not type country code — e.g. India: 10 digits starting with 6–9).
        </p>
        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-600">Country</label>
            <select
              value={whatsappDialCode}
              onChange={(e) => setWhatsappDialCode(e.target.value)}
              className="border border-[#aaa] px-3 py-2 rounded min-w-[200px] text-sm bg-white"
            >
              {(waCountries.length
                ? waCountries
                : [{ dial: "91", label: "India" }]
              ).map((c) => (
                <option key={c.dial} value={c.dial}>
                  {c.label} (+{c.dial})
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-600">Mobile number (without + / country code)</label>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="9876543210"
              value={whatsappPhoneNational}
              onChange={(e) =>
                setWhatsappPhoneNational(e.target.value.replace(/[^\d]/g, ""))
              }
              className="border border-[#aaa] px-3 py-2 rounded min-w-[180px] text-sm"
            />
          </div>
          <button
            type="button"
            disabled={savingWa}
            onClick={saveSupportWhatsApp}
            className="bg-[#243a48] text-white px-4 py-2 rounded text-sm font-semibold disabled:opacity-50"
          >
            {savingWa ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomerSupport;
