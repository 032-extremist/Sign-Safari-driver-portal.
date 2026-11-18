'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { sendTripAlert, supabase } from '@/lib/supabase';
import { getTripName, setTripName as saveTripNameToStorage } from '@/lib/tripStorage';

type Trip = {
  id: string;
  code: string;
  is_active: boolean;
  created_at: string;
};

const PRESET_ALERTS = [
  'Are you seated?',
  'Ready to move?',
  'Look left!',
  'Photo stop in 2 minutes',
  'Stay seated — animals nearby',
];

export default function TripPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [tripName, setTripNameValue] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadTrip = async () => {
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
        .eq('id', params.id)
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        router.replace('/dashboard');
        return;
      }

      setTrip(data);
      const storedName = getTripName(data.id);
      setTripNameValue(storedName);
      setIsLoading(false);
    };

    loadTrip();
  }, [params.id, router]);

  const qrValue = useMemo(() => {
    if (!trip) return '';
    return trip.code;
  }, [trip]);

  const persistTripName = () => {
    if (!trip) return;

    const nextName = tripName.trim() || getTripName(trip.id);
    setTripNameValue(nextName);
    saveTripNameToStorage(trip.id, nextName);
  };

  const sendAlert = async (message: string) => {
    if (!trip || !message.trim()) return;

    setIsSending(true);
    setErrorMessage('');

    try {
      await sendTripAlert(trip.id, message.trim());
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to send alert');
    } finally {
      setIsSending(false);
    }
  };

  const endTrip = async () => {
    if (!trip) return;

    const confirmed = window.confirm('End this trip and stop sending alerts?');
    if (!confirmed) return;

    const { error } = await supabase.from('trips').update({ is_active: false }).eq('id', trip.id);

    if (!error) {
      router.push('/dashboard');
      return;
    }

    setErrorMessage(error.message);
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-safari-cream px-4">
        <div className="rounded-2xl border border-safari-green/10 bg-white/80 px-8 py-6 text-lg font-semibold text-safari-green shadow-soft">
          Loading trip…
        </div>
      </main>
    );
  }

  if (!trip) {
    return null;
  }

  const displayName = tripName.trim() || getTripName(trip.id);

  return (
    <main className="min-h-screen bg-safari-cream px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-safari-green/10 bg-white/80 p-6 shadow-soft md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-safari-green/70">Active trip</p>
            <h1 className="mt-2 text-3xl font-bold text-safari-green">{displayName}</h1>
            <p className="mt-1 text-safari-green/70">Created {new Date(trip.created_at).toLocaleString()}</p>
          </div>

          <button
            type="button"
            onClick={endTrip}
            className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 font-semibold text-red-700 transition hover:bg-red-100"
          >
            End Trip
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-safari-green/10 bg-white/80 p-6 shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-safari-green/70">Trip code</p>
            <div className="mt-4 rounded-2xl bg-safari-cream px-5 py-6 text-center">
              <p className="text-4xl font-black tracking-[0.2em] text-safari-green">{trip.code}</p>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="trip-name" className="mb-2 block text-sm font-medium text-safari-green">
                  Trip name
                </label>
                <input
                  id="trip-name"
                  type="text"
                  value={tripName}
                  onChange={(event) => setTripNameValue(event.target.value)}
                  className="w-full rounded-xl border border-safari-green/20 bg-white px-4 py-3 text-safari-green outline-none transition focus:border-safari-green/60 focus:ring-2 focus:ring-safari-green/10"
                />
              </div>

              <button
                type="button"
                onClick={persistTripName}
                className="rounded-xl border border-safari-green/20 bg-safari-cream px-4 py-2 font-medium text-safari-green transition hover:bg-safari-meadow"
              >
                Save trip name
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-safari-green/10 bg-white/80 p-6 shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-safari-green/70">Passenger QR</p>
            <div className="mt-4 flex justify-center rounded-2xl bg-safari-cream p-4">
              {qrValue ? <QRCodeSVG value={qrValue} size={220} /> : null}
            </div>
            <p className="mt-4 text-center text-xs text-safari-green/60">Scan to enter code {trip.code} in the passenger app.</p>
          </section>
        </div>

        <section className="rounded-3xl border border-safari-green/10 bg-white/80 p-6 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-safari-green/70">Send alert</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PRESET_ALERTS.map((alert) => (
              <button
                key={alert}
                type="button"
                onClick={() => sendAlert(alert)}
                disabled={isSending}
                className="rounded-2xl border border-safari-green/15 bg-safari-cream px-4 py-4 text-left font-medium text-safari-green transition hover:border-safari-green/40 hover:bg-safari-meadow disabled:cursor-not-allowed disabled:opacity-60"
              >
                {alert}
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={customMessage}
              onChange={(event) => setCustomMessage(event.target.value)}
              placeholder="Custom alert message"
              className="flex-1 rounded-xl border border-safari-green/20 bg-white px-4 py-3 text-safari-green outline-none transition focus:border-safari-green/60 focus:ring-2 focus:ring-safari-green/10"
            />
            <button
              type="button"
              onClick={async () => {
                const value = customMessage.trim();
                if (!value) return;
                await sendAlert(value);
                setCustomMessage('');
              }}
              disabled={isSending || !customMessage.trim()}
              className="rounded-xl bg-safari-green px-5 py-3 font-semibold text-white transition hover:bg-safari-greenSoft disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSending ? 'Sending…' : 'Send'}
            </button>
          </div>

          {errorMessage ? (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
          ) : null}
        </section>
      </div>
    </main>
  );
}