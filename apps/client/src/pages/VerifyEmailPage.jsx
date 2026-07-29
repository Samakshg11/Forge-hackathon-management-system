import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { RiveMascot } from '../components/ui/RiveMascot';
import { Button } from '../components/ui/Button';

export function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function verify() {
      try {
        await apiClient.post('/auth/verify-email', { token });
        setStatus('success');
        setMessage('Your email address has been verified successfully!');
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'Verification failed or token expired.');
      }
    }
    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface border border-border-subtle rounded-xl p-8 text-center space-y-6 glass-panel shadow-2xl">
        <RiveMascot state={status === 'loading' ? 'loading' : status === 'success' ? 'celebrate' : 'error'} className="w-24 h-24 mx-auto" />
        
        <h2 className="text-2xl font-bold font-display text-text-primary">
          {status === 'loading' && 'Verifying Email...'}
          {status === 'success' && 'Email Verified!'}
          {status === 'error' && 'Verification Failed'}
        </h2>

        <p className="text-sm text-text-secondary">{message}</p>

        {status !== 'loading' && (
          <Link to="/login" className="inline-block w-full">
            <Button className="w-full">Continue to Login</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
