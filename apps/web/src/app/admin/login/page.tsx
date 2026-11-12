'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('azonubigoodnews@gmail.com');
  const [password, setPassword] = useState('AdminPassword');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Invalid credentials');
      }

      const data = await res.json();
      localStorage.setItem('shortlet_admin_token', data.accessToken);
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-auto bg-space-950/80 backdrop-blur-xl">
      <div className="glass-panel rounded-glass-lg p-8 max-w-md w-full shadow-2xl">
        <div className="text-center mb-6">
          <span className="w-3 h-3 rounded-full bg-brand-gold shadow-glow inline-block mb-2" />
          <h1 className="text-2xl font-bold tracking-tight text-white uppercase">
            Admin Portal
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Luxury Property & Experience Management
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">
              Admin Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-brand-gold"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-brand-gold"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 rounded-xl bg-brand-gold hover:bg-white text-black text-xs font-bold uppercase tracking-wider transition-all shadow-glow"
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-white/10 text-center text-[10px] text-white/40">
          Default seed: admin@shortlet3d.com / AdminPassword123!
        </div>
      </div>
    </div>
  );
}
