-- ==============================================================================
-- DYNAMIC SUBSCRIPTION PLANS & ADMIN BROADCAST COMMUNICATIONS
-- ==============================================================================

-- 1. Create Subscription Plans Table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    price_monthly NUMERIC(10, 2) NOT NULL,
    price_yearly NUMERIC(10, 2) NOT NULL,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    max_restaurants INTEGER NOT NULL DEFAULT 1,
    max_qr_codes INTEGER NOT NULL DEFAULT 10,
    max_orders INTEGER NOT NULL DEFAULT 500,
    max_staff INTEGER NOT NULL DEFAULT 3,
    marketing_enabled BOOLEAN NOT NULL DEFAULT true,
    ai_enabled BOOLEAN NOT NULL DEFAULT false,
    analytics_enabled BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for ordering plans on pricing page
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active_sort 
ON public.subscription_plans(is_active, sort_order ASC);

-- 2. Seed Default Plans in Indian Rupees (₹)
INSERT INTO public.subscription_plans (
    id, name, slug, description, price_monthly, price_yearly, 
    features, max_restaurants, max_qr_codes, max_orders, max_staff, 
    marketing_enabled, ai_enabled, analytics_enabled, is_featured, is_active, sort_order
) VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    'Starter Bistro',
    'starter',
    'For boutique cafes, wine bars & quick-service food joints.',
    199.00,
    1999.00,
    '["Up to 12 QR table terminals", "Standard Single-Zone Floor Radar", "Instant KDS Kitchen Display", "Offline Cache Protection", "Public customer guest ordering"]'::jsonb,
    1, 12, 1000, 3,
    false, false, true, false, true, 1
),
(
    '00000000-0000-0000-0000-000000000002',
    'Pro Hospitality',
    'pro',
    'For high-cadence dining rooms requiring expanded pass sync and multiple zones.',
    499.00,
    4999.00,
    '["Unlimited floor terminals & reservations", "Architectural Multi-Zone Floor Radar", "Smart KDS Routing (Pass, Grill, Prep)", "Web Push Marketing Hub (RFC 8291)", "Sommelier & Course Pacing", "24/7 Dedicated Floor Support"]'::jsonb,
    3, 50, 5000, 10,
    true, true, true, true, true, 2
),
(
    '00000000-0000-0000-0000-000000000003',
    'Heritage Group',
    'enterprise',
    'For multi-property collections, boutique hotel dining groups, and legacy estates.',
    999.00,
    9999.00,
    '["Unlimited restaurants & table QR tents", "Enterprise Multi-Property Console", "Centralized Multi-Unit Accounting", "Dedicated Account Concierge", "Custom Domain & White-labeling", "Priority Feature Access & SLAs"]'::jsonb,
    10, 200, 50000, 50,
    true, true, true, false, true, 3
)
ON CONFLICT (slug) DO UPDATE SET 
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly;

-- 3. Create Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'normal', -- normal, important, critical
    target_audience TEXT NOT NULL DEFAULT 'all', -- all, trial, premium, expired, specific
    target_restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    image_url TEXT,
    cta_label TEXT,
    cta_url TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_announcements_created 
ON public.announcements(created_at DESC);

-- 4. Create Restaurant Notifications Table
CREATE TABLE IF NOT EXISTS public.restaurant_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    announcement_id UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
    read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT uq_restaurant_announcement UNIQUE (restaurant_id, announcement_id)
);

CREATE INDEX IF NOT EXISTS idx_resto_notifications_unread 
ON public.restaurant_notifications(restaurant_id, read);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_notifications ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
-- Public can read active subscription plans
CREATE POLICY "Allow public read active subscription plans"
ON public.subscription_plans FOR SELECT
USING (is_active = true);

-- Super admin full access to subscription plans
CREATE POLICY "Allow super admin full control of plans"
ON public.subscription_plans FOR ALL
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- Super admin full access to announcements
CREATE POLICY "Allow super admin full control of announcements"
ON public.announcements FOR ALL
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- Restaurant owners can read their own notifications
CREATE POLICY "Allow restaurant owners to view their notifications"
ON public.restaurant_notifications FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.restaurants 
        WHERE restaurants.id = restaurant_notifications.restaurant_id 
        AND restaurants.owner_id = auth.uid()
    )
);

-- Restaurant owners can update read status on their own notifications
CREATE POLICY "Allow restaurant owners to mark notifications read"
ON public.restaurant_notifications FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.restaurants 
        WHERE restaurants.id = restaurant_notifications.restaurant_id 
        AND restaurants.owner_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.restaurants 
        WHERE restaurants.id = restaurant_notifications.restaurant_id 
        AND restaurants.owner_id = auth.uid()
    )
);
