import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { toValidUUID } from '@/lib/uuid-utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { restaurant_id, endpoint, p256dh, auth, browser, device } = body;

    if (!restaurant_id || !endpoint || !p256dh || !auth) {
      return NextResponse.json(
        { error: 'Missing required push subscription fields' },
        { status: 400 }
      );
    }

    const validRestaurantId = toValidUUID(restaurant_id);

    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const { error } = await supabase
        .from('notification_subscriptions')
        .upsert(
          {
            restaurant_id: validRestaurantId,
            endpoint,
            p256dh,
            auth,
            browser: browser || 'Unknown',
            device: device || 'Desktop',
            active: true,
            last_seen: new Date().toISOString(),
          },
          { onConflict: 'restaurant_id,endpoint' }
        );

      if (error) {
        console.error('Supabase subscription upsert error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: 'Push subscription stored successfully' });
  } catch (err: any) {
    console.error('Error in /api/marketing/subscribe:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
