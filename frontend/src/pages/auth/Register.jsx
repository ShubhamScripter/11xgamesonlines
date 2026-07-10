import React, { useState, useEffect } from 'react';
import { IoIosCloseCircleOutline, IoMdCloseCircle } from "react-icons/io";
import { FaRegEyeSlash, FaRegEye, FaChevronDown } from "react-icons/fa";
import { useNavigate ,Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, reset } from '../../features/auth/authSlice';
import toast, { Toaster } from 'react-hot-toast';
import { homeUrlForCurrency, getStoredCurrency } from '../../utils/currency';
import logo from '../../assets/bajiLogo.png';
import logoMp4 from '../../assets/bajiVideo.mp4'
import moblogoMp4 from '../../assets/welcome-bn.mp4';
import { HiOutlineHome } from 'react-icons/hi';
import LanguageSwitcher from '../../i18n/LanguageSwitcher';
import { useTranslation } from '../../i18n/LanguageContext';

const MAX_USERNAME_LENGTH = 10;

const CURRENCY_OPTIONS = [
  { code: 'BDT', label: 'BDT' },
  { code: 'USDT', label: 'USDT' },
];

function CurrencyIcon({ code }) {
  if (code === 'USDT') {
    return (
      <span className="w-6 h-6 rounded-full bg-[#26a17b] flex items-center justify-center text-white text-[13px] font-bold shrink-0">
        $
      </span>
    );
  }
  // BDT — Bangladesh flag style (green field with red circle)
  return (
    <span className="w-6 h-6 rounded-full bg-[#006a4e] flex items-center justify-center shrink-0">
      <span className="w-3 h-3 rounded-full bg-[#f42a41]" />
    </span>
  );
}

function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralCode = (searchParams.get('ref') || '').trim().toUpperCase();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currency, setCurrency] = useState('BDT');
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [hasTypedUser, setHasTypedUser] = useState(false);
  const [hasTypedEmail, setHasTypedEmail] = useState(false);
  const [hasTypedPass, setHasTypedPass] = useState(false);
  const [hasTypedPassConfirm, setHasTypedPassConfirm] = useState(false);
  const [hasTypedName, setHasTypedName] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) toast.error(message);
    if (isSuccess || user) {
      // Full-page redirect so the router basename matches the chosen currency
      // (USDT browses under "/$/...", BDT under "/...").
      window.location.assign(homeUrlForCurrency(getStoredCurrency()));
      return;
    }
    dispatch(reset());
  }, [user, isError, isSuccess, message, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      toast.error(t('auth.usernameRequired'));
      return;
    }
    if (trimmedUsername.length > MAX_USERNAME_LENGTH) {
      toast.error(t('auth.usernameMaxLength', { max: MAX_USERNAME_LENGTH }));
      return;
    }
    if (!email.trim()) {
      toast.error(t('auth.emailRequired'));
      return;
    }
    if (password.length < 8) {
      toast.error(t('auth.passwordMinLength'));
      return;
    }
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error(t('auth.passwordFormat'));
      return;
    }
    if (password !== confirmPassword) {
      toast.error(t('auth.passwordMismatch'));
      return;
    }

    dispatch(
      register({
        userName: trimmedUsername,
        password,
        name: name.trim() || trimmedUsername,
        email: email.trim(),
        currency,
        ...(referralCode ? { ref: referralCode } : {}),
      })
    );
  };

  return (
      <div className="relative w-full bg-[#191a1a]">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover hidden md:block"
        >
          <source src={logoMp4} />
        </video>

        <div className="fixed z-50 top-0 left-0 h-[65px] bg-[#191a1a] w-full flex justify-between items-center px-5 border-b border-gray-700">
          <img src={logo} alt="logo" className="h-full" />
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link to="/"><HiOutlineHome className="text-white" size={25} /></Link>
          </div>
        </div>

        <div className="h-screen pt-[65px] overflow-y-auto">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-[200px] object-cover md:hidden"
          >
            <source src={moblogoMp4} />
          </video>

          <div className="flex justify-center px-1 md:px-6 pb-6 md:relative">
            <div className="hidden md:flex w-1/2 items-center justify-center"></div>
            <div className="w-full md:w-1/2 flex items-center justify-center px-6">
              <div className="w-full max-w-md text-white">
                <div className="flex my-6">
                  <Link to="/login" className="w-1/2 text-gray-400 pb-2 text-center"><button>{t('nav.login')}</button></Link>
                  <button className="w-1/2 border-b-4 border-[#14805e] pb-2">{t('nav.signup')}</button>
                </div>
                {referralCode && (
                  <div className="mb-4 rounded-lg border border-[#14805e]/50 bg-[#14805e]/10 px-4 py-3">
                    <p className="text-sm text-[#14805e] font-semibold">{t('auth.invited')}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {t('auth.referralCode')} <span className="font-mono text-white">{referralCode}</span>
                    </p>
                  </div>
                )}
                <form className='flex flex-col' onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-[16px] mb-2 text-[#8d9aa5]">
                      {t('auth.username')}{' '}
                      <span className="text-[#8d9aa5]/70 text-sm">
                        {t('auth.usernameMax', { max: MAX_USERNAME_LENGTH })}
                      </span>
                    </label>
                    <div className='relative'>
                      <input
                        type="text"
                        id="username"
                        value={username}
                        maxLength={MAX_USERNAME_LENGTH}
                        placeholder={t('auth.usernamePlaceholder')}
                        onChange={(e) => {
                          setUsername(e.target.value);
                          if (e.target.value.length > 0) {
                            setHasTypedUser(true);
                          }
                        }}
                        className={`w-full px-4 py-3 bg-[#222424] text-white rounded-[2px] focus:outline-2 ${(hasTypedUser && username === "") ? 'outline-2 outline-red-400' : 'focus:outline-[#14805e]'} placeholder:font-light`}
                      />


                      {username && (
                        <span onClick={() => setUsername("")} className='absolute right-3 top-1/2 transform -translate-y-1/2'><IoMdCloseCircle className='text-gray-500' /></span>
                      )}
                      {hasTypedUser && username === "" && (
                      <div className='text-red-400 pt-1 flex items-center text-[14px] gap-1'><IoIosCloseCircleOutline size={18} /> {t('auth.fieldRequired')}</div>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-[16px] mb-2 text-[#8d9aa5]">{t('auth.chooseCurrency')}</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setCurrencyOpen((prev) => !prev)}
                        className={`w-full flex items-center justify-between px-4 py-3 bg-[#222424] text-white rounded-[2px] border ${currencyOpen ? 'border-[#14805e]' : 'border-transparent'} transition-colors`}
                      >
                        <span className="flex items-center gap-3">
                          <CurrencyIcon code={currency} />
                          <span className="font-medium">{currency}</span>
                        </span>
                        <FaChevronDown className={`text-gray-400 text-sm transition-transform ${currencyOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {currencyOpen && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setCurrencyOpen(false)} />
                          <ul className="absolute z-20 left-0 right-0 mt-1 bg-[#222424] border border-[#3a3d3d] rounded-[2px] overflow-hidden shadow-lg">
                            {CURRENCY_OPTIONS.map((opt) => (
                              <li
                                key={opt.code}
                                onClick={() => {
                                  setCurrency(opt.code);
                                  setCurrencyOpen(false);
                                }}
                                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#2c2f2f] ${currency === opt.code ? 'bg-[#1c2b25] text-white' : 'text-[#cfd6dc]'}`}
                              >
                                <CurrencyIcon code={opt.code} />
                                <span className="font-medium">{opt.label}</span>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-[16px] mb-2 text-[#8d9aa5]">{t('auth.email')}</label>
                    <div className='relative'>
                      <input
                        type="text"
                        id="email"
                        value={email}
                        placeholder={t('auth.emailPlaceholder')}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (e.target.value.length > 0) {
                            setHasTypedEmail(true);
                          }
                        }}
                        className={`w-full px-4 py-3 bg-[#222424] text-white rounded-[2px] focus:outline-2 ${(hasTypedEmail && email === "") ? 'outline-2 outline-red-400' : 'focus:outline-[#14805e]'} placeholder:font-light`}
                      />
                      {email && (
                        <span onClick={() => setEmail("")} className='absolute right-3 top-1/2 transform -translate-y-1/2'><IoMdCloseCircle className='text-gray-500' /></span>
                      )}
                      {hasTypedEmail && email === "" && (
                      <div className='text-red-400 pt-1 flex items-center text-[14px] gap-1'><IoIosCloseCircleOutline size={18} /> {t('auth.fieldRequired')}</div>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-[16px] mb-2 text-[#8d9aa5]">{t('auth.password')}</label>
                    <div className='relative'>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      placeholder={t('auth.passwordPlaceholder')}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (e.target.value.length > 0) {
                          setHasTypedPass(true);
                          }
                      }}
                      className={`w-full px-4 py-3 bg-[#222424] text-white rounded focus:outline-2 ${(hasTypedPass && password === "") ? 'outline-2 outline-red-400' : 'focus:outline-[#14805e]'}  placeholder:font-light`}
                    />
                    {password && (
                      <>
                      <span onClick={() => setPassword("")} className='absolute right-9 top-1/2 transform -translate-y-1/2'><IoMdCloseCircle className='text-gray-500' /></span>
                      <span className='absolute right-3 top-1/2 transform -translate-y-1/2' onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <FaRegEyeSlash className='text-gray-500' /> : <FaRegEye className='text-gray-500' />}
                      </span>
                      </>
                    )}
                    {hasTypedPass && password === "" && (
                      <div className='text-red-400 pt-1 flex items-center text-[14px] gap-1'><IoIosCloseCircleOutline size={18} /> {t('auth.fieldRequired')}</div>
                    )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-[16px] mb-2 text-[#8d9aa5]">{t('auth.confirmPassword')}</label>
                    <div className='relative'>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      value={confirmPassword}
                      placeholder={t('auth.passwordPlaceholder')}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (e.target.value.length > 0) {
                          setHasTypedPassConfirm(true);
                          }
                      }}
                      className={`w-full px-4 py-3 bg-[#222424] text-white rounded focus:outline-2 ${(hasTypedPassConfirm && confirmPassword === "") ? 'outline-2 outline-red-400' : 'focus:outline-[#14805e]'}  placeholder:font-light`}
                    />

                    {confirmPassword && (
                      <>
                      <span onClick={() => setConfirmPassword("")} className='absolute right-9 top-1/2 transform -translate-y-1/2'><IoMdCloseCircle className='text-gray-500' /></span>
                      <span className='absolute right-3 top-1/2 transform -translate-y-1/2' onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <FaRegEyeSlash className='text-gray-500' /> : <FaRegEye className='text-gray-500' />}
                      </span>
                      </>
                    )}
                    {hasTypedPassConfirm && confirmPassword === "" && (
                      <div className='text-red-400 pt-1 flex items-center text-[14px] gap-1'><IoIosCloseCircleOutline size={18} /> {t('auth.fieldRequired')}</div>
                    )}
                    </div>
                  </div>
                  
                  <button className="w-full bg-[#14805e] py-3 rounded font-semibold" disabled={isLoading}>
                  {isLoading ? t('auth.creatingAccount') : t('auth.signUp')}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

    </div>
    
  );
}

export default Register;
