// import React, { useState, useEffect } from 'react';
// import { IoIosArrowBack } from "react-icons/io";
// import { FaUser, FaLock } from "react-icons/fa";
// import { MdVerifiedUser } from "react-icons/md";
// import logo from '../../assets/logo.png';
// import { useNavigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { login, reset } from '../../features/auth/authSlice';
// import toast, { Toaster } from 'react-hot-toast';

// function Login() {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const [usernameFocus, setUsernameFocus] = useState(false);
//   const [passwordFocus, setPasswordFocus] = useState(false);
//   const [verificationCodeFocus, setVerificationCodeFocus] = useState(false);

//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [verificationCode, setVerificationCode] = useState('');
//   const [generatedCode, setGeneratedCode] = useState('');

//   const { user, isLoading, isError, isSuccess, message } = useSelector(
//     (state) => state.auth
//   );

//   useEffect(() => {
//     setGeneratedCode(Math.floor(1000 + Math.random() * 9000).toString());
//   }, []);

//   const isUsernameActive = usernameFocus || username;
//   const isPasswordActive = passwordFocus || password;
//   const isVerificationCodeActive = verificationCodeFocus || verificationCode;

//   useEffect(() => {
//     if (isError) {
//       toast.error(message);
//     }
//     if (isSuccess || user) {
//       navigate('/');
//     }
//     dispatch(reset());
//   }, [user, isError, isSuccess, message, navigate, dispatch]);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (verificationCode !== generatedCode) {
//       toast.error('Verification code does not match!');
//       return;
//     }
//     dispatch(login({ username, password, verificationCode }));
//   };

//   return (
//     <div className='min-h-screen bg-[url(/loginbg.jpg)] bg-cover bg-center bg-no-repeat flex flex-col'>
//       <Toaster position="top-center" reverseOrder={false} />

//       {/* Back Button */}
//       <div className='bg-white w-8 h-8 rounded-full flex justify-center items-center ml-2 mt-2'>
//         <IoIosArrowBack className='text-gray-600 w-6 h-6' />
//       </div>

//       {/* Logo */}
//       <div className='flex flex-col items-center justify-center mt-4'>
//         <img src={logo} alt="Logo" width={200} height={200} />
//       </div>

//       {/* Login Form Section */}
//       <div className='bg-white rounded-t-2xl shadow-lg p-4 mt-4 flex-1 flex flex-col justify-center'>
//         <h2 className='text-3xl font-sans text-center py-4'>Login</h2>

//         <form className='flex flex-col px-2' onSubmit={handleSubmit}>

//           {/* Username */}
//           <div className={`relative border rounded-lg px-2 py-3 mb-6 transition-all duration-200 ${isUsernameActive ? 'border-[#19A044]' : 'border-gray-400'}`}>
//             <FaUser className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-all duration-200 ${isUsernameActive ? 'text-[#19A044]' : 'text-gray-600'}`} />
//             <label
//               htmlFor="username"
//               className={`absolute left-10 transition-all duration-200 pointer-events-none bg-white px-1
//                 ${isUsernameActive
//                   ? 'text-xs -top-2 text-[#19A044]'
//                   : 'top-1/2 transform -translate-y-1/2 text-gray-400'}
//               `}
//             >
//               Username
//             </label>
//             <input
//               type="text"
//               id="username"
//               value={username}
//               onFocus={() => setUsernameFocus(true)}
//               onBlur={() => setUsernameFocus(false)}
//               onChange={(e) => setUsername(e.target.value)}
//               className='pl-10 pt-1 pb-1 w-full outline-none bg-transparent text-gray-800'
//             />
//           </div>

//           {/* Password */}
//           <div className={`relative border rounded-lg px-2 py-3 mb-6 transition-all duration-200 ${isPasswordActive ? 'border-[#19A044]' : 'border-gray-400'}`}>
//             <FaLock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-all duration-200 ${isPasswordActive ? 'text-[#19A044]' : 'text-gray-600'}`} />
//             <label
//               htmlFor="password"
//               className={`absolute left-10 transition-all duration-200 pointer-events-none bg-white px-1
//                 ${isPasswordActive
//                   ? 'text-xs -top-2 text-[#19A044]'
//                   : 'top-1/2 transform -translate-y-1/2 text-gray-400'}
//               `}
//             >
//               Password
//             </label>
//             <input
//               type="password"
//               id="password"
//               value={password}
//               onFocus={() => setPasswordFocus(true)}
//               onBlur={() => setPasswordFocus(false)}
//               onChange={(e) => setPassword(e.target.value)}
//               className='pl-10 pt-1 pb-1 w-full outline-none bg-transparent text-gray-800'
//             />
//           </div>

//           {/* Verification Code */}
//           <div className={`relative border rounded-lg px-2 py-3 mb-6 transition-all duration-200 ${isVerificationCodeActive ? 'border-[#19A044]' : 'border-gray-400'}`}>
//             <MdVerifiedUser className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-all duration-200 ${isVerificationCodeActive ? 'text-[#19A044]' : 'text-gray-600'}`} />
//             <label
//               htmlFor="verificationCode"
//               className={`absolute left-10 transition-all duration-200 pointer-events-none bg-white px-1
//                 ${isVerificationCodeActive
//                   ? 'text-xs -top-2 text-[#19A044]'
//                   : 'top-1/2 transform -translate-y-1/2 text-gray-400'}
//               `}
//             >
//               Verification Code
//             </label>
//             <input
//               type="text"
//               id="verificationCode"
//               value={verificationCode}
//               onFocus={() => setVerificationCodeFocus(true)}
//               onBlur={() => setVerificationCodeFocus(false)}
//               onChange={(e) => setVerificationCode(e.target.value)}
//               className='pl-10 pt-1 pb-1 w-full outline-none bg-transparent text-gray-800'
//             />
//             <span
//               className="absolute right-3 top-1/2 transform -translate-y-1/2  text-black px-3 py-1 rounded font-mono text-2xl font-semibold select-none"
//               style={{ letterSpacing: '2px' }}
//             >
//               {generatedCode}
//             </span>
//           </div>

//           <button type="submit" disabled={isLoading} className='bg-[#19A044] text-white py-2 rounded'>
//             {isLoading ? 'Logging in...' : 'Login'}
//           </button>

//           {/* <p className='text-center text-sm text-gray-600 mt-4'>
//             New user?{' '}
//             <span onClick={() => navigate('/register')} className='text-[#19A044] font-semibold cursor-pointer hover:underline'>
//               Register
//             </span>
//           </p> */}
//         </form>
//       </div>
//     </div>
//   );
// }

// export default Login;

import React, { useState, useEffect } from 'react';
import { IoIosArrowBack } from "react-icons/io";
import { FaUser, FaLock } from "react-icons/fa";
import { MdVerifiedUser } from "react-icons/md";
import logo from '../../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
// 👉 make sure this path matches where you saved the combined slice
import { login, reset } from '../../features/auth/authSlice'; 
import toast, { Toaster } from 'react-hot-toast';

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [usernameFocus, setUsernameFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [verificationCodeFocus, setVerificationCodeFocus] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    setGeneratedCode(Math.floor(1000 + Math.random() * 9000).toString());
  }, []);

  const isUsernameActive = usernameFocus || username;
  const isPasswordActive = passwordFocus || password;
  const isVerificationCodeActive = verificationCodeFocus || verificationCode;

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
    <div className='min-h-screen bg-[url(/loginbg.jpg)] bg-cover bg-center bg-no-repeat flex flex-col'>
      <Toaster position="top-center" reverseOrder={false} />

      {/* Back Button */}
      <div className='bg-white w-8 h-8 rounded-full flex justify-center items-center ml-2 mt-2'>
        <IoIosArrowBack className='text-gray-600 w-6 h-6' />
      </div>

      {/* Logo */}
      <div className='flex flex-col items-center justify-center mt-4'>
        <img src={logo} alt="Logo" width={200} height={200} />
      </div>

      {/* Login Form Section */}
      <div className='bg-white rounded-t-2xl shadow-lg p-4 mt-4 flex-1 flex flex-col justify-center'>
        <h2 className='text-3xl font-sans text-center py-4'>Login</h2>

        <form className='flex flex-col px-2' onSubmit={handleSubmit}>
          {/* Username */}
          <div className={`relative border rounded-lg px-2 py-3 mb-6 transition-all duration-200 ${isUsernameActive ? 'border-[#19A044]' : 'border-gray-400'}`}>
            <FaUser className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isUsernameActive ? 'text-[#19A044]' : 'text-gray-600'}`} />
            <label htmlFor="username"
              className={`absolute left-10 transition-all duration-200 pointer-events-none bg-white px-1
                ${isUsernameActive ? 'text-xs -top-2 text-[#19A044]' : 'top-1/2 transform -translate-y-1/2 text-gray-400'}
              `}
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

          {/* Password */}
          <div className={`relative border rounded-lg px-2 py-3 mb-6 transition-all duration-200 ${isPasswordActive ? 'border-[#19A044]' : 'border-gray-400'}`}>
            <FaLock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isPasswordActive ? 'text-[#19A044]' : 'text-gray-600'}`} />
            <label htmlFor="password"
              className={`absolute left-10 transition-all duration-200 pointer-events-none bg-white px-1
                ${isPasswordActive ? 'text-xs -top-2 text-[#19A044]' : 'top-1/2 transform -translate-y-1/2 text-gray-400'}
              `}
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

          {/* Verification Code */}
          <div className={`relative border rounded-lg px-2 py-3 mb-6 transition-all duration-200 ${isVerificationCodeActive ? 'border-[#19A044]' : 'border-gray-400'}`}>
            <MdVerifiedUser className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isVerificationCodeActive ? 'text-[#19A044]' : 'text-gray-600'}`} />
            <label htmlFor="verificationCode"
              className={`absolute left-10 transition-all duration-200 pointer-events-none bg-white px-1
                ${isVerificationCodeActive ? 'text-xs -top-2 text-[#19A044]' : 'top-1/2 transform -translate-y-1/2 text-gray-400'}
              `}
            >
              Verification Code
            </label>
            <input
              type="text"
              id="verificationCode"
              value={verificationCode}
              onFocus={() => setVerificationCodeFocus(true)}
              onBlur={() => setVerificationCodeFocus(false)}
              onChange={(e) => setVerificationCode(e.target.value)}
              className='pl-10 pt-1 pb-1 w-full outline-none bg-transparent text-gray-800'
            />
            <span
              className="absolute right-3 top-1/2 transform -translate-y-1/2  text-black px-3 py-1 rounded font-mono text-2xl font-semibold select-none"
              style={{ letterSpacing: '2px' }}
            >
              {generatedCode}
            </span>
          </div>

          <button type="submit" disabled={isLoading} className='bg-[#19A044] text-white py-2 rounded'>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>

          <p className='text-center text-sm text-gray-600 mt-4'>
            Don&apos;t have an account?{' '}
            <span
              onClick={() => navigate('/register')}
              className='text-[#19A044] font-semibold cursor-pointer hover:underline'
            >
              Sign Up
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
