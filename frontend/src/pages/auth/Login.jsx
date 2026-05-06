import React, { useState, useEffect } from 'react';
import { IoIosCloseCircleOutline, IoMdCloseCircle } from "react-icons/io";
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa";
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, reset } from '../../features/auth/authSlice'; 
import toast from 'react-hot-toast';
import logo from '../../assets/bajiLogo.png';
import logoMp4 from '../../assets/bajiVideo.mp4';
import moblogoMp4 from '../../assets/welcome-bn.mp4';
import { HiOutlineHome } from 'react-icons/hi';

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [hasTypedUser, setHasTypedUser] = useState(false);
  const [hasTypedPass, setHasTypedPass] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    setGeneratedCode(Math.floor(1000 + Math.random() * 9000).toString());
  }, []);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    if (isSuccess || user) {
      navigate('/');
    }
    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (verificationCode !== generatedCode) {
      toast.error('Verification code does not match!');
      return;
    }
    // ✅ match the API’s required body keys
    dispatch(login({ userName: username, password }));
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
        <Link to="/"><HiOutlineHome className="text-white" size={25} /></Link>
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
              {/* TABS */}
              <div className="flex my-6">
                <button className="w-1/2 border-b-4 border-[#14805e] pb-2">Log in</button>
                <Link to="/register" className="w-1/2 text-gray-400 pb-2 text-center">
                  <button>Sign up</button>
                </Link>
              </div>
              {/* FORM */}
              <form className="flex flex-col" onSubmit={handleSubmit}>

                {/* USERNAME */}
                <div className="mb-4">
                  <label className="block mb-2 text-[#8d9aa5]">Username</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      placeholder="Enter your username"
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (e.target.value) setHasTypedUser(true);
                      }}
                      className={`w-full px-4 py-3 bg-[#222424] rounded focus:outline-2 ${
                        hasTypedUser && !username
                          ? 'outline-red-400'
                          : 'focus:outline-[#14805e]'
                      }`}
                    />
                    {username && (
                      <span
                        onClick={() => setUsername("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                      >
                        <IoMdCloseCircle className="text-gray-500" />
                      </span>
                    )}
                  </div>
                  {hasTypedUser && !username && (
                    <div className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <IoIosCloseCircleOutline /> This field is required.
                    </div>
                  )}
                </div>

                {/* PASSWORD */}
                <div className="mb-4">
                  <label className="block mb-2 text-[#8d9aa5]">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      placeholder="Enter your password"
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (e.target.value) setHasTypedPass(true);
                      }}
                      className={`w-full px-4 py-3 bg-[#222424] rounded focus:outline-2 ${
                        hasTypedPass && !password
                          ? 'outline-red-400'
                          : 'focus:outline-[#14805e]'
                      }`}
                    />
                    {password && (
                      <>
                        <span
                          onClick={() => setPassword("")}
                          className="absolute right-9 top-1/2 -translate-y-1/2 cursor-pointer"
                        >
                          <IoMdCloseCircle className="text-gray-500" />
                        </span>
                        <span
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                        >
                          {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                        </span>
                      </>
                    )}
                  </div>
                  {hasTypedPass && !password && (
                    <div className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <IoIosCloseCircleOutline /> This field is required.
                    </div>
                  )}
                </div>

                {/* VERIFICATION CODE */}
                <div className="mb-4">
                  <label className="block mb-2 text-[#8d9aa5]">Verification Code</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="w-full px-4 py-3 bg-[#222424] rounded focus:outline-[#14805e]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white text-xl font-mono">
                      {generatedCode}
                    </span>
                  </div>
                </div>

                {/* BUTTON */}
                <button
                  className="w-full bg-[#14805e] py-3 rounded font-semibold"
                >
                  {isLoading ? 'Logging in...' : 'Log in'}
                </button>

              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;