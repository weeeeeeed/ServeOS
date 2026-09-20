import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { toValidUUID } from '@/lib/uuid-utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { restaurantId } = body;

    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant ID is required' }, { status: 400 });
    }

    const validRestaurantId = toValidUUID(restaurantId);

    // Authenticate Request
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

    if (!authenticatedUserId) {
      authenticatedUserId = req.cookies.get('qr_user_id')?.value || null;
      authenticatedRole = req.cookies.get('qr_user_role')?.value || null;
    }

    if (!authenticatedUserId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (isSupabaseConfigured()) {
      const supabase = await createClient();

      // Verify ownership
      const { data: resto } = await supabase
        .from('restaurants')
        .select('owner_id')
        .eq('id', validRestaurantId)
        .single();

      if (!resto || (authenticatedRole !== 'admin' && resto.owner_id !== authenticatedUserId)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const { error } = await supabase
        .from('notification_subscriptions')
        .delete()
        .eq('restaurant_id', validRestaurantId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: 'All subscribers cleared successfully' });
  } catch (err: any) {
    console.error('Error in /api/marketing/delete-subscribers:', err);
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}
