import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { useToast } from '../components/ui/Toast';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const showToast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email });
      setSent(true);
      showToast('Password reset link sent to your email', 'success');
    } catch (err) {
      showToast(err.message || 'Request failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface border border-border-subtle rounded-xl p-8 space-y-6 glass-panel shadow-2xl">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold font-display text-text-primary">Reset Password</h1>
          <p className="text-xs text-text-secondary">Enter your email and we'll send a password reset link</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-status-success">
              If an account exists for {email}, a reset link has been sent. Check your inbox!
            </p>
            <Link to="/login" className="inline-block">
              <Button variant="secondary" size="sm">Back to Login</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" isLoading={loading} className="w-full">
              Send Reset Link
            </Button>
          </form>
        )}

        <div className="text-center text-xs text-text-secondary">
          <Link to="/login" className="text-accent-secondary hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
