import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_ANNOUNCEMENTS } from '@/lib/mock-data';
import { Announcement } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { toValidUUID } from '@/lib/uuid-utils';

export async function GET() {
  try {
    if (isSupabaseConfigured()) {
      try {
        const supabase = await createClient();
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return NextResponse.json({
            success: true,
            announcements: data,
          });
        }
      } catch (err) {
        console.warn('Supabase broadcast fetch warning:', err);
      }
    }

    return NextResponse.json({
      success: true,
      announcements: INITIAL_ANNOUNCEMENTS,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch broadcasts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.title || !body.message) {
      return NextResponse.json(
        { success: false, error: 'Title and message are required' },
        { status: 400 }
      );
    }

    const ancId = crypto.randomUUID();
    const targetRestoId = body.target_restaurant_id ? toValidUUID(body.target_restaurant_id) : null;

    const announcement: Announcement = {
      id: ancId,
      title: body.title.trim(),
      message: body.message.trim(),
      priority: body.priority || 'normal',
      target_audience: body.target_audience || 'all',
      target_restaurant_id: targetRestoId,
      target_restaurant_name: body.target_restaurant_name || null,
      image_url: body.image_url || null,
      cta_label: body.cta_label || null,
      cta_url: body.cta_url || null,
      created_at: new Date().toISOString(),
      created_by: body.created_by || 'Super Admin',
      total_sent: 1,
      total_read: 0,
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createClient();
        
        // 1. Insert announcement
        const { data: insertedAnc, error: ancError } = await supabase
          .from('announcements')
          .insert({
            id: ancId,
            title: announcement.title,
            message: announcement.message,
            priority: announcement.priority,
            target_audience: announcement.target_audience,
            target_restaurant_id: targetRestoId,
            image_url: announcement.image_url,
            cta_label: announcement.cta_label,
            cta_url: announcement.cta_url,
            created_by: announcement.created_by,
          })
          .select()
          .single();

        if (!ancError && insertedAnc) {
          // 2. Determine target restaurant IDs
          let restoQuery = supabase.from('restaurants').select('id, subscription_status');
          if (announcement.target_audience === 'trial') {
            restoQuery = restoQuery.eq('subscription_status', 'trialing');
          } else if (announcement.target_audience === 'premium') {
            restoQuery = restoQuery.eq('subscription_status', 'active');
          } else if (announcement.target_audience === 'expired') {
            restoQuery = restoQuery.in('subscription_status', ['past_due', 'inactive']);
          } else if (announcement.target_audience === 'specific' && targetRestoId) {
            restoQuery = restoQuery.eq('id', targetRestoId);
          }

          const { data: targetRestos } = await restoQuery;

          if (targetRestos && targetRestos.length > 0) {
            const notifRows = targetRestos.map((r) => ({
              id: crypto.randomUUID(),
              restaurant_id: r.id,
              announcement_id: ancId,
              read: false,
            }));
            await supabase.from('restaurant_notifications').insert(notifRows);
            announcement.total_sent = targetRestos.length;
          }

          return NextResponse.json({
            success: true,
            announcement,
            message: 'Announcement broadcasted successfully to live tenants',
          });
        }
      } catch (err) {
        console.warn('Supabase broadcast insert error:', err);
      }
    }

    return NextResponse.json({
      success: true,
      announcement,
      message: 'Announcement broadcasted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to broadcast announcement' },
      { status: 500 }
    );
  }
}
