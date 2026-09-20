-- ==============================================================================
-- MARKETING PUSH NOTIFICATION SYSTEM SCHEMA & RLS POLICIES
-- ==============================================================================

-- 1. Create Notification Subscriptions Table
CREATE TABLE IF NOT EXISTS public.notification_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    browser TEXT,
    device TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT uq_restaurant_endpoint UNIQUE (restaurant_id, endpoint)
);

-- Index for fast restaurant subscriber lookups
CREATE INDEX IF NOT EXISTS idx_notification_subs_restaurant_active 
ON public.notification_subscriptions(restaurant_id, active);

-- 2. Create Marketing Campaigns Table
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    image_url TEXT,
    cta_url TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    total_targeted INTEGER NOT NULL DEFAULT 0,
    total_sent INTEGER NOT NULL DEFAULT 0,
    total_failed INTEGER NOT NULL DEFAULT 0
);

-- Index for listing restaurant campaigns chronologically
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_restaurant 
ON public.marketing_campaigns(restaurant_id, sent_at DESC);

-- 3. Add marketing_enabled flag to restaurants if not exists
DO  
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'restaurants' AND column_name = 'marketing_enabled'
    ) THEN
        ALTER TABLE public.restaurants ADD COLUMN marketing_enabled BOOLEAN NOT NULL DEFAULT true;
    END IF;
END ;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.notification_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for Notification Subscriptions
-- Customers/diners (anonymous or auth) can insert their own push subscription for a restaurant
CREATE POLICY  Allow public customer push subscription registration
ON public.notification_subscriptions
FOR INSERT
WITH CHECK (true);

-- Restaurant owners can view and manage subscriptions for their own restaurant
CREATE POLICY Owners can view their restaurant subscriptions
ON public.notification_subscriptions
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.restaurants r
        WHERE r.id = notification_subscriptions.restaurant_id
        AND r.owner_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid() AND u.role = 'admin'
    )
);

CREATE POLICY Owners can update their restaurant subscriptions
ON public.notification_subscriptions
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.restaurants r
        WHERE r.id = notification_subscriptions.restaurant_id
        AND r.owner_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid() AND u.role = 'admin'
    )
);

CREATE POLICY Owners can delete their restaurant subscriptions
ON public.notification_subscriptions
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.restaurants r
        WHERE r.id = notification_subscriptions.restaurant_id
        AND r.owner_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid() AND u.role = 'admin'
    )
);

-- 6. RLS Policies for Marketing Campaigns
CREATE POLICY Owners can view their restaurant marketing campaigns
ON public.marketing_campaigns
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.restaurants r
        WHERE r.id = marketing_campaigns.restaurant_id
        AND r.owner_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid() AND u.role = 'admin'
    )
);

CREATE POLICY Owners can insert campaigns for their restaurant
ON public.marketing_campaigns
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.restaurants r
        WHERE r.id = marketing_campaigns.restaurant_id
        AND r.owner_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid() AND u.role = 'admin'
    )
);
