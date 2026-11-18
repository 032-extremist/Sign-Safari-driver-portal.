'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import { getTripName } from '@/lib/tripStorage';

type Trip = {
  id: string;
  code: string;
  is_active: boolean;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [tripName, setTripName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    const fetchTrip = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace('/login');
        return;
      }

      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setTrip(data);
        setTripName(getTripName(data.id));
      }

      setIsLoading(false);
    };

    fetchTrip();
  }, [router]);

  const createTrip = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const generatedId = crypto.randomUUID();
    const code = Array.from({ length: 6 }, () =>
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]
    ).join('');

    const tripLabel = name.trim() || `Safari trip ${code}`;

    const { data, error } = await supabase
      .from('trips')
      .insert([
        {
          id: generatedId,
          code,
          is_active: true,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    setIsSubmitting(false);

    if (error || !data) {
      console.error(error);
      return;
    }

    const stored = localStorage.getItem('signsafari-trip-names');
    const entries = stored ? (JSON.parse(stored) as Record<string, string>) : {};
    entries[data.id] = tripLabel;
    localStorage.setItem('signsafari-trip-names', JSON.stringify(entries));

    router.push(`/trip/${data.id}`);
  };

  const endTrip = async () => {
    if (!trip) return;

    const { error } = await supabase.from('trips').update({ is_active: false }).eq('id', trip.id);

    if (!error) {
      setTrip(null);
      setTripName('');
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-safari-cream px-4">
        <div className="rounded-2xl border border-safari-green/10 bg-white/80 px-8 py-6 text-lg font-semibold text-safari-green shadow-soft">
          Loading dashboard…
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-safari-cream px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-safari-green/70">SignSafari</p>
            <h1 className="mt-2 text-3xl font-bold text-safari-green">Driver dashboard</h1>
          </div>

          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/login');
            }}
            className="rounded-xl border border-safari-green/20 bg-white px-4 py-2 font-medium text-safari-green transition hover:bg-safari-green/5"
          >
            Logout
          </button>
        </div>

        {!trip ? (
          <section className="rounded-3xl border border-safari-green/10 bg-white/80 p-6 shadow-soft">
            <h2 className="text-2xl font-bold text-safari-green">Create trip</h2>
            <p className="mt-2 text-safari-green/70">Start a safari trip and generate a boarding code for passengers.</p>

            <form onSubmit={createTrip} className="mt-6 space-y-4">
              <div>
                <label htmlFor="tripName" className="mb-2 block text-sm font-medium text-safari-green">
                  Trip name
                </label>
                <input
                  id="tripName"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Maasai Mara Morning"
                  className="w-full rounded-xl border border-safari-green/20 bg-white px-4 py-3 text-safari-green outline-none transition focus:border-safari-green/60 focus:ring-2 focus:ring-safari-green/10"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-safari-green px-5 py-3 font-semibold text-white transition hover:bg-safari-greenSoft disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Creating trip…' : 'Create Trip'}
              </button>
            </form>
          </section>
        ) : (
          <section className="rounded-3xl border border-safari-green/10 bg-white/80 p-6 shadow-soft">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-safari-green/70">Active trip</p>
                <h2 className="mt-2 text-2xl font-bold text-safari-green">{tripName || 'Current trip'}</h2>
              </div>

              <div className="flex gap-3">
                <Link
                  href={`/trip/${trip.id}`}
                  className="rounded-xl bg-safari-green px-5 py-3 font-semibold text-white transition hover:bg-safari-greenSoft"
                >
                  Resume Trip
                </Link>
                <button
                  type="button"
                  onClick={endTrip}
                  className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 font-semibold text-red-700 transition hover:bg-red-100"
                >
                  End Trip
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
