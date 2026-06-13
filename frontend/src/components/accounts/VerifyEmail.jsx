import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api/client';

const VerifyEmail = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your email...');
  const hasAttempted = useRef(false);

  useEffect(() => {
    const verifyAccount = async () => {
      if (hasAttempted.current) return;
      hasAttempted.current = true;

      try {
        const data = await apiRequest(`/verify-email/${uid}/${token}/`);
        setStatus('success');
        setMessage(data.message || 'Your email has been verified successfully!');
        
        // Automatically redirect to login after a few seconds
        setTimeout(() => navigate('/login'), 4000);
      } catch (error) {
        setStatus('error');
        setMessage(error.message || 'Verification link is invalid or has expired.');
      }
    };

    if (uid && token) {
      verifyAccount();
    }
  }, [uid, token, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12 bg-slate-50">
      <div className="bg-white p-8 rounded-xl border border-slate-200 max-w-md w-full text-center shadow-lg">
        {status === 'verifying' && (
          <div className="text-blue-600 text-xl font-medium animate-pulse">⏳ {message}</div>
        )}
        {status === 'success' && (
          <div>
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Verified!</h2>
            <p className="text-slate-600 mb-6">{message}</p>
            <p className="text-sm text-slate-400 mb-4">Redirecting to login...</p>
            <Link to="/login" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg transition">Login Now</Link>
          </div>
        )}
        {status === 'error' && (
          <div>
            <div className="text-red-500 text-6xl mb-4">✕</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Verification Failed</h2>
            <p className="text-slate-600 mb-6">{message}</p>
            <Link to="/register" className="inline-block bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold py-2.5 px-6 rounded-lg transition">Back to Registration</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;