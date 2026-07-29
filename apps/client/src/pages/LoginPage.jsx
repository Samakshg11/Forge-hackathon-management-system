import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/app/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      showToast('Welcome back!', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface border border-border-subtle rounded-xl p-6 sm:p-8 space-y-6 glass-panel shadow-2xl">
        <div className="space-y-2 text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded bg-accent-primary text-white font-bold text-lg flex items-center justify-center">
              F
            </div>
            <span className="font-display font-bold text-xl uppercase tracking-wider text-text-primary">
              FORGE
            </span>
          </Link>
          <h1 className="text-2xl font-bold font-display text-text-primary">Log in to your account</h1>
          <p className="text-xs text-text-secondary">Enter your credentials to access your workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex items-center justify-end">
            <Link to="/forgot-password" className="text-xs text-accent-secondary hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" isLoading={loading} className="w-full">
            Log In
          </Button>
        </form>

        <div className="text-center text-xs text-text-secondary pt-2">
          Don't have an account?{' '}
          <Link to="/signup" className="text-accent-primary hover:underline font-semibold">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
