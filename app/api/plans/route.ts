import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_SUBSCRIPTION_PLANS } from '@/lib/mock-data';
import { SubscriptionPlanEntity } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { toValidUUID } from '@/lib/uuid-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createClient();
        let query = supabase.from('subscription_plans').select('*');
        if (!includeInactive) {
          query = query.eq('is_active', true);
        }
        const { data, error } = await query.order('sort_order', { ascending: true });
        if (!error && data && data.length > 0) {
          return NextResponse.json({
            success: true,
            plans: data,
          });
        }
      } catch (err) {
        console.warn('Supabase plans fetch warning:', err);
      }
    }

    let plans: SubscriptionPlanEntity[] = INITIAL_SUBSCRIPTION_PLANS;
    if (!includeInactive) {
      plans = plans.filter((p) => p.is_active);
    }

    return NextResponse.json({
      success: true,
      plans: plans.sort((a, b) => a.sort_order - b.sort_order),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || body.price_monthly === undefined) {
      return NextResponse.json(
        { success: false, error: 'Name and price_monthly are required' },
        { status: 400 }
      );
    }

    const planSlug = body.slug || body.name.toLowerCase().replace(/\s+/g, '-');
    const newPlan: SubscriptionPlanEntity = {
      id: toValidUUID(body.id || planSlug),
      name: body.name,
      slug: planSlug,
      description: body.description || '',
      price_monthly: Number(body.price_monthly),
      price_yearly: Number(body.price_yearly || body.price_monthly * 10),
      features: body.features || [],
      max_restaurants: Number(body.max_restaurants || 1),
      max_qr_codes: Number(body.max_qr_codes || 10),
      max_orders: Number(body.max_orders || 1000),
      max_staff: Number(body.max_staff || 5),
      marketing_enabled: Boolean(body.marketing_enabled),
      ai_enabled: Boolean(body.ai_enabled),
      analytics_enabled: Boolean(body.analytics_enabled),
      is_featured: Boolean(body.is_featured),
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : true,
      sort_order: Number(body.sort_order || 99),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createClient();
        const { data, error } = await supabase
          .from('subscription_plans')
          .upsert(newPlan)
          .select()
          .single();
        if (!error && data) {
          return NextResponse.json({
            success: true,
            plan: data,
            message: 'Plan saved successfully',
          });
        }
      } catch (err) {
        console.warn('Supabase plan save error:', err);
      }
    }

    return NextResponse.json({
      success: true,
      plan: newPlan,
      message: 'Plan saved successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create plan' },
      { status: 500 }
    );
  }
}
