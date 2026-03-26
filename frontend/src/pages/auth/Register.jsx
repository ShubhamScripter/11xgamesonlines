import React, { useState, useEffect } from 'react';
import { IoIosArrowBack } from "react-icons/io";
import { FaUser, FaLock } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import logo from '../../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, reset } from '../../features/auth/authSlice';
import toast, { Toaster } from 'react-hot-toast';

function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [usernameFocus, setUsernameFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [confirmPasswordFocus, setConfirmPasswordFocus] = useState(false);
  const [nameFocus, setNameFocus] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);

  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  const isUsernameActive = usernameFocus || username;
  const isPasswordActive = passwordFocus || password;
  const isConfirmPasswordActive = confirmPasswordFocus || confirmPassword;
  const isNameActive = nameFocus || name;
  const isEmailActive = emailFocus || email;

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
    <div className='min-h-screen bg-[url(/loginbg.jpg)] bg-cover bg-center bg-no-repeat flex flex-col'>
      <Toaster position="top-center" reverseOrder={false} />

      {/* Back Button */}
      <div
        className='bg-white w-8 h-8 rounded-full flex justify-center items-center ml-2 mt-2 cursor-pointer'
        onClick={() => navigate('/login')}
        role="button"
        aria-label="Back to login"
      >
        <IoIosArrowBack className='text-gray-600 w-6 h-6' />
      </div>

      {/* Logo */}
      <div className='flex flex-col items-center justify-center mt-4'>
        <img src={logo} alt="Logo" width={200} height={200} />
      </div>

      {/* Register Form */}
      <div className='bg-white rounded-t-2xl shadow-lg p-4 mt-4 flex-1 flex flex-col justify-center'>
        <h2 className='text-3xl font-sans text-center py-4'>Register User</h2>

        <form className='flex flex-col px-2' onSubmit={handleSubmit}>

          {/* Username */}
          <div className={`relative border rounded-lg px-2 py-3 mb-6 transition-all duration-200 ${isUsernameActive ? 'border-[#19A044]' : 'border-gray-400'}`}>
            <FaUser className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-all duration-200 ${isUsernameActive ? 'text-[#19A044]' : 'text-gray-600'}`} />
            <label
              htmlFor="username"
              className={`absolute left-10 transition-all duration-200 pointer-events-none bg-white px-1
              ${isUsernameActive ? 'text-xs -top-2 text-[#19A044]' : 'top-1/2 transform -translate-y-1/2 text-gray-400'}`}
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onFocus={() => setUsernameFocus(true)}
              onBlur={() => setUsernameFocus(false)}
              onChange={(e) => setUsername(e.target.value)}
              className='pl-10 pt-1 pb-1 w-full outline-none bg-transparent text-gray-800'
            />
          </div>

          {/* Name */}
          <div className={`relative border rounded-lg px-2 py-3 mb-6 transition-all duration-200 ${isNameActive ? 'border-[#19A044]' : 'border-gray-400'}`}>
            <FaUser className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-all duration-200 ${isNameActive ? 'text-[#19A044]' : 'text-gray-600'}`} />
            <label
              htmlFor="name"
              className={`absolute left-10 transition-all duration-200 pointer-events-none bg-white px-1
              ${isNameActive ? 'text-xs -top-2 text-[#19A044]' : 'top-1/2 transform -translate-y-1/2 text-gray-400'}`}
            >
              Name (optional)
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onFocus={() => setNameFocus(true)}
              onBlur={() => setNameFocus(false)}
              onChange={(e) => setName(e.target.value)}
              className='pl-10 pt-1 pb-1 w-full outline-none bg-transparent text-gray-800'
            />
          </div>

          {/* Email (required) */}
          <div className={`relative border rounded-lg px-2 py-3 mb-6 transition-all duration-200 ${isEmailActive ? 'border-[#19A044]' : 'border-gray-400'}`}>
            <MdEmail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-all duration-200 ${isEmailActive ? 'text-[#19A044]' : 'text-gray-600'}`} />
            <label
              htmlFor="email"
              className={`absolute left-10 transition-all duration-200 pointer-events-none bg-white px-1
              ${isEmailActive ? 'text-xs -top-2 text-[#19A044]' : 'top-1/2 transform -translate-y-1/2 text-gray-400'}`}
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onFocus={() => setEmailFocus(true)}
              onBlur={() => setEmailFocus(false)}
              onChange={(e) => setEmail(e.target.value)}
              className='pl-10 pt-1 pb-1 w-full outline-none bg-transparent text-gray-800'
            />
          </div>

          {/* Password */}
          <div className={`relative border rounded-lg px-2 py-3 mb-6 transition-all duration-200 ${isPasswordActive ? 'border-[#19A044]' : 'border-gray-400'}`}>
            <FaLock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-all duration-200 ${isPasswordActive ? 'text-[#19A044]' : 'text-gray-600'}`} />
            <label
              htmlFor="password"
              className={`absolute left-10 transition-all duration-200 pointer-events-none bg-white px-1
              ${isPasswordActive ? 'text-xs -top-2 text-[#19A044]' : 'top-1/2 transform -translate-y-1/2 text-gray-400'}`}
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onFocus={() => setPasswordFocus(true)}
              onBlur={() => setPasswordFocus(false)}
              onChange={(e) => setPassword(e.target.value)}
              className='pl-10 pt-1 pb-1 w-full outline-none bg-transparent text-gray-800'
            />
          </div>

          {/* Confirm Password */}
          <div className={`relative border rounded-lg px-2 py-3 mb-6 transition-all duration-200 ${isConfirmPasswordActive ? 'border-[#19A044]' : 'border-gray-400'}`}>
            <FaLock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-all duration-200 ${isConfirmPasswordActive ? 'text-[#19A044]' : 'text-gray-600'}`} />
            <label
              htmlFor="confirmPassword"
              className={`absolute left-10 transition-all duration-200 pointer-events-none bg-white px-1
              ${isConfirmPasswordActive ? 'text-xs -top-2 text-[#19A044]' : 'top-1/2 transform -translate-y-1/2 text-gray-400'}`}
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onFocus={() => setConfirmPasswordFocus(true)}
              onBlur={() => setConfirmPasswordFocus(false)}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className='pl-10 pt-1 pb-1 w-full outline-none bg-transparent text-gray-800'
            />
          </div>

          <button type="submit" disabled={isLoading} className='bg-[#19A044] text-white py-2 rounded disabled:opacity-70'>
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>

          <p className='text-center text-sm text-gray-600 mt-4'>
            Already registered?{' '}
            <span onClick={() => navigate('/login')} className='text-[#19A044] font-semibold cursor-pointer hover:underline'>
              Login
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
