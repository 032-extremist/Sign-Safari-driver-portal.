'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsSubmitting(false);

    if (error) {
      const message = error.message.toLowerCase();

      if (message.includes('email not confirmed') || message.includes('confirm your email')) {
        setErrorMessage('Please confirm your email address before logging in. Check your inbox for the confirmation email.');
        return;
      }

      if (message.includes('invalid login credentials')) {
        setErrorMessage('Invalid login credentials. Please make sure you used the exact email and password from sign-up.');
        return;
      }

      setErrorMessage(error.message);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-safari-cream px-4">
      <div className="w-full max-w-md rounded-3xl border border-safari-green/10 bg-white/80 p-8 shadow-soft backdrop-blur-sm">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-safari-green/70">SignSafari</p>
          <h1 className="mt-3 text-3xl font-bold text-safari-green">Driver Portal</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-safari-green">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-xl border border-safari-green/20 bg-white px-4 py-3 text-safari-green outline-none transition focus:border-safari-green/60 focus:ring-2 focus:ring-safari-green/10"
              placeholder="driver@safaris.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-safari-green">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-xl border border-safari-green/20 bg-white px-4 py-3 text-safari-green outline-none transition focus:border-safari-green/60 focus:ring-2 focus:ring-safari-green/10"
              placeholder="••••••••"
            />
          </div>

          {errorMessage ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-safari-green px-4 py-3 font-semibold text-white transition hover:bg-safari-greenSoft disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Signing in…' : 'Login'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-safari-green/70">
          Need an account?{' '}
          <Link href="/signup" className="font-semibold text-safari-green underline-offset-2 hover:underline">
            Create driver account
          </Link>
        </p>
      </div>
    </main>
  );
}
