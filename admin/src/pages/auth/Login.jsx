import React, { useState,useEffect } from 'react';
import Logo from '../../assets/logo.png';
import { BiLogIn } from "react-icons/bi";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginAsync } from '../../store/authSlice';
import toast, { Toaster } from 'react-hot-toast';
function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.auth);
  const [formData, setFormData] = useState({ username: '', password: '', validateCode: '' });
  const [generatedCode, setGeneratedCode] = useState('');

  useEffect(() => {
      setGeneratedCode(Math.floor(1000 + Math.random() * 9000).toString());
    }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.validateCode !== generatedCode) {
      toast.error('Verification code does not match!');
      return;
    }
    const resultAction = await dispatch(loginAsync({
      username: formData.username,
      password: formData.password,
    }));
    if (loginAsync.fulfilled.match(resultAction)) {
      navigate('/');
    }
    // Optionally handle error here if needed
  };

  return (
    <div className='min-h-screen bg-[url(/adminloginbg.jpg)] bg-cover bg-center bg-no-repeat flex justify-center items-center'>
      <div className='md:flex'>
        <div className='flex pl-5'>
          <img src={Logo} alt="Logo" className='w-70' />
        </div>
        <div className='border-l border-l-[#ffffff4d] pl-5'>
          <div className='text-white mb-2 font-sans text-xl'>Agent Login</div>
          <form className='flex flex-col w-70' onSubmit={handleSubmit}>
            <div className='mb-2'>
              <input
                type="text"
                placeholder='Username'
                name='username'
                value={formData.username}
                onChange={handleChange}
                className='bg-white p-2 border border-[#aaa] text-sm w-full'
                required
              />
            </div>
            <div className='mb-2'>
              <input
                type="password"
                placeholder='Password'
                name='password'
                value={formData.password}
                onChange={handleChange}
                className='bg-white p-2 border border-[#aaa] text-sm w-full'
                required
              />
            </div>
            <div className='mb-2 relative'>
              <input
                type="text"
                placeholder='Validate Code'
                name='validateCode'
                value={formData.validateCode}
                onChange={handleChange}
                className='bg-white p-2 border border-[#aaa] text-sm w-full'
                required
              />
              <span className='absolute font-sans right-1 top-1/2 -translate-y-1/2'>{generatedCode}</span>
            </div>
            {error && (
              <div className="text-red-500 text-sm mb-2">{error}</div>
            )}
            <div>
              <button
                type='submit'
                className='bg-[#ffcc2f] border border-[#cb8009] p-2 flex justify-center items-center w-full text-sm font-semibold hover:bg-[#ffc800e6]'
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
                <span><BiLogIn className='text-lg font-semibold ml-1' /></span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;