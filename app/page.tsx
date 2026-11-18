'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { supabase } from '@/lib/supabase';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const go = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      router.replace(session ? '/dashboard' : '/login');
    };

    go();
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-safari-cream text-safari-green">
      <div className="rounded-2xl border border-safari-green/10 bg-white/70 px-8 py-6 text-center shadow-soft backdrop-blur-sm">
        <p className="text-lg font-semibold">Loading SignSafari portal…</p>
      </div>
    </main>
  );
}
