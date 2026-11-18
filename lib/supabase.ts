import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://your-project.supabase.co';
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

type BroadcastChannel = ReturnType<typeof supabase.channel> & {
  sendBroadcastMessage?: (event: string, payload: Record<string, unknown>) => Promise<void>;
};

export async function sendTripAlert(tripId: string, message: string) {
  const text = message.trim();
  if (!tripId || !text) {
    throw new Error('Trip ID and message are required.');
  }

  const channelName = `trip-${tripId}`;
  console.log('Sending to channel:', channelName);

  const channel = supabase.channel(channelName);

  // Key: wait for the subscription to actually complete before sending
  await new Promise<void>((resolve, reject) => {
    channel.subscribe((status, err) => {
      console.log('Channel status:', status);
      if (status === 'SUBSCRIBED') resolve();
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        reject(err ?? new Error('Channel subscribe failed'));
      }
    });
  });

  // Send the message
  await channel.send({
    type: 'broadcast',
    event: 'question',
    payload: { text, timestamp: new Date().toISOString() },
  });

  console.log('Broadcast sent successfully');

  // Key: do NOT removeChannel immediately; give the server time to deliver
  // For demo purposes, delay 2 seconds before cleanup (or don't clean up at all, reuse the channel)
  await new Promise((r) => setTimeout(r, 2000));
  supabase.removeChannel(channel);
}

