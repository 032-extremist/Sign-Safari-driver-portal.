'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

import { supabase } from '@/lib/supabase';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined,
        },
      });

      if (error) {
        setStatus({ type: 'error', message: error.message });
        return;
      }

      if (!data.user) {
        setStatus({
          type: 'error',
          message:
            'Supabase did not confirm that an account was created. Check that this portal is connected to the correct Supabase project, then try again.',
        });
        return;
      }

      if (data.user.identities?.length === 0) {
        setStatus({
          type: 'error',
          message:
            'Supabase did not create a new account for this email. It may already be registered; try logging in instead.',
        });
        return;
      }

      setStatus({
        type: 'success',
        message: data.session
          ? 'Account created. You can now log in with your email and password.'
          : 'Account created. Please confirm your email address before logging in.',
      });
      setEmail('');
      setPassword('');
    } catch (error) {
      setStatus({
        type: 'error',
        message:
          error instanceof Error
            ? `Could not contact Supabase: ${error.message}`
            : 'Could not contact Supabase. Please check your connection and try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-safari-cream px-4">
      <div className="w-full max-w-md rounded-3xl border border-safari-green/10 bg-white/80 p-8 shadow-soft backdrop-blur-sm">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-safari-green/70">SignSafari</p>
          <h1 className="mt-3 text-3xl font-bold text-safari-green">Create Driver Account</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="signup-email" className="mb-2 block text-sm font-medium text-safari-green">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-xl border border-safari-green/20 bg-white px-4 py-3 text-safari-green outline-none transition focus:border-safari-green/60 focus:ring-2 focus:ring-safari-green/10"
              placeholder="driver@safaris.com"
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="mb-2 block text-sm font-medium text-safari-green">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              className="w-full rounded-xl border border-safari-green/20 bg-white px-4 py-3 text-safari-green outline-none transition focus:border-safari-green/60 focus:ring-2 focus:ring-safari-green/10"
              placeholder="••••••••"
            />
          </div>

          {status ? (
            <p
              className={`rounded-xl border px-3 py-2 text-sm ${
                status.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {status.message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-safari-green px-4 py-3 font-semibold text-white transition hover:bg-safari-greenSoft disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-safari-green/70">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-safari-green underline-offset-2 hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </main>
  );
}
