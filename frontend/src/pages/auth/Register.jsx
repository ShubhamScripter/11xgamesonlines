import React, { useState, useEffect } from 'react';
import { IoIosCloseCircleOutline, IoMdCloseCircle } from "react-icons/io";
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa";
import { useNavigate ,Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, reset } from '../../features/auth/authSlice';
import toast, { Toaster } from 'react-hot-toast';
import logo from '../../assets/bajiLogo.png';
import logoMp4 from '../../assets/bajiVideo.mp4'
import moblogoMp4 from '../../assets/welcome-bn.mp4';
import { HiOutlineHome } from 'react-icons/hi';

function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    if (isSuccess || user) navigate('/');
    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error('Username is required');
      return;
    }
    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error(
        'Password must contain both letters and numbers (no special characters)'
      );
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Password and Confirm Password do not match');
      return;
    }

    dispatch(
      register({
        userName: username.trim(),
        password,
        name: name.trim() || username.trim(),
        email: email.trim(),
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
                <div className="flex my-6">
                  <Link to="/login" className="w-1/2 text-gray-400 pb-2 text-center"><button>Log in</button></Link>
                  <button className="w-1/2 border-b-4 border-[#14805e] pb-2">Sign up</button>
                </div>
                <form className='flex flex-col' onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-[16px] mb-2 text-[#8d9aa5]">Username</label>
                    <div className='relative'>
                      <input
                        type="text"
                        id="username"
                        value={username}
                        placeholder="Enter your username"
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
                      <div className='text-red-400 pt-1 flex items-center text-[14px] gap-1'><IoIosCloseCircleOutline size={18} /> This field is required.</div>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-[16px] mb-2 text-[#8d9aa5]">Email</label>
                    <div className='relative'>
                      <input
                        type="text"
                        id="email"
                        value={email}
                        placeholder="Enter your email"
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
                      <div className='text-red-400 pt-1 flex items-center text-[14px] gap-1'><IoIosCloseCircleOutline size={18} /> This field is required.</div>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-[16px] mb-2 text-[#8d9aa5]">Password</label>
                    <div className='relative'>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      placeholder="Enter your password"
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
                      <div className='text-red-400 pt-1 flex items-center text-[14px] gap-1'><IoIosCloseCircleOutline size={18} /> This field is required.</div>
                    )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-[16px] mb-2 text-[#8d9aa5]">Confirm Password</label>
                    <div className='relative'>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      value={confirmPassword}
                      placeholder="Enter your password"
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
                      <div className='text-red-400 pt-1 flex items-center text-[14px] gap-1'><IoIosCloseCircleOutline size={18} /> This field is required.</div>
                    )}
                    </div>
                  </div>
                  
                  <button className="w-full bg-[#14805e] py-3 rounded font-semibold" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Sign Up'}
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
