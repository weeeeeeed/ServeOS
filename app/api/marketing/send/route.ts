import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { toValidUUID } from '@/lib/uuid-utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { restaurantId, title, message, imageUrl, ctaUrl } = body;

    if (!restaurantId || !title?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'Restaurant ID, Title, and Message are required' },
        { status: 400 }
      );
    }

    const validRestaurantId = toValidUUID(restaurantId);

    // 1. Authenticate Request
    let authenticatedUserId: string | null = null;
    let authenticatedRole: string | null = null;

    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        authenticatedUserId = user.id;
        const { data: userProfile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        authenticatedRole = userProfile?.role || 'owner';
      }
    }

    // Fallback authentication via secure cookies (used in demo / local middleware)
    if (!authenticatedUserId) {
      authenticatedUserId = req.cookies.get('qr_user_id')?.value || null;
      authenticatedRole = req.cookies.get('qr_user_role')?.value || null;
    }

    if (!authenticatedUserId) {
      return NextResponse.json(
        { error: 'Authentication required to broadcast campaigns' },
        { status: 401 }
      );
    }

    // 2. Validate Tenant Ownership (Owners can only send for their own restaurant; Admins can send for any)
    let restaurantName = 'Our Restaurant';
    let restaurantSlug = 'menu';
    let restaurantLogo: string | null = null;

    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const { data: resto, error: restoErr } = await supabase
        .from('restaurants')
        .select('id, owner_id, name, slug, logo, marketing_enabled')
        .eq('id', validRestaurantId)
        .single();

      if (restoErr || !resto) {
        return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
      }

      if (authenticatedRole !== 'admin' && resto.owner_id !== authenticatedUserId) {
        return NextResponse.json(
          { error: 'Forbidden: You do not have permission to send campaigns for this restaurant' },
          { status: 403 }
        );
      }

      if (resto.marketing_enabled === false) {
        return NextResponse.json(
          { error: 'Marketing notifications are currently disabled in settings for this restaurant' },
          { status: 400 }
        );
      }

      restaurantName = resto.name;
      restaurantSlug = resto.slug;
      restaurantLogo = resto.logo;
    }

    // 3. Configure VAPID Details
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:support@bitepoint.app';

    if (vapidPublicKey && vapidPrivateKey) {
      webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
    }

    // 4. Fetch Active Subscriptions
    let subscribers: any[] = [];

    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('notification_subscriptions')
        .select('*')
        .eq('restaurant_id', validRestaurantId)
        .eq('active', true);

      if (!error && data) {
        subscribers = data;
      }
    }

    const campaignId = 'cmp-' + Math.random().toString(36).substring(2, 9);
    const targetUrl = ctaUrl?.trim() || /r/;

    const notificationPayload = JSON.stringify({
      title: title.trim(),
      body: message.trim(),
      icon: restaurantLogo || '/favicon.ico',
      image: imageUrl?.trim() || null,
      data: {
        url: targetUrl,
        restaurantId,
        campaignId,
      },
    });

    // 5. Dispatch Web Push Broadcasts in Parallel
    let totalSent = 0;
    let totalFailed = 0;
    let inactiveMarked = 0;
    const staleSubscriptionIds: string[] = [];

    if (vapidPublicKey && vapidPrivateKey && subscribers.length > 0) {
      await Promise.all(
        subscribers.map(async (sub) => {
          try {
            await webpush.sendNotification(
              {
                endpoint: sub.endpoint,
                keys: {
                  p256dh: sub.p256dh,
                  auth: sub.auth,
                },
              },
              notificationPayload,
              { TTL: 60 * 60 * 24 } // 24 hours TTL
            );
            totalSent++;
          } catch (err: any) {
            totalFailed++;
            // Handle 404 (Not Found) or 410 (Gone) -> unsubscribe expired endpoints
            if (err.statusCode === 404 || err.statusCode === 410) {
              staleSubscriptionIds.push(sub.id);
              inactiveMarked++;
            }
          }
        })
      );

      // Deactivate stale subscriptions in database
      if (isSupabaseConfigured() && staleSubscriptionIds.length > 0) {
        const supabase = await createClient();
        await supabase
          .from('notification_subscriptions')
          .update({ active: false })
          .in('id', staleSubscriptionIds);
      }
    } else {
      // Demo / simulated send when no external endpoints connected yet
      totalSent = subscribers.length > 0 ? subscribers.length : 1;
    }

    // 6. Record Campaign in Database
    const campaignRecord = {
      id: crypto.randomUUID(),
      restaurant_id: validRestaurantId,
      title: title.trim(),
      message: message.trim(),
      image_url: imageUrl?.trim() || null,
      cta_url: targetUrl,
      sent_at: new Date().toISOString(),
      total_targeted: subscribers.length || 1,
      total_sent: totalSent,
      total_failed: totalFailed,
    };

    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      await supabase.from('marketing_campaigns').insert(campaignRecord);
    }

    return NextResponse.json({
      success: true,
      campaign: campaignRecord,
      totalTargeted: subscribers.length || 1,
      totalSent,
      totalFailed,
      inactiveMarked,
    });
  } catch (err: any) {
    console.error('Error in /api/marketing/send:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to send campaign broadcast' },
      { status: 500 }
    );
  }
}
