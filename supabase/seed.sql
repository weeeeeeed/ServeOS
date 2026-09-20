-- ==============================================================================
-- SERVEOS: DATABASE SEED & PERMISSIVE RLS CONFIGURATION SCRIPT
-- Run this in your Supabase Project -> SQL Editor -> New Query -> Run
-- Seeds demo owners, restaurants, categories, dishes, and ensures public QR ordering works.
-- ==============================================================================

-- 1. Ensure Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Seed Demo Auth Users (Supabase auth.users)
-- Allows login with email: owner@demo.com / password: password123
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role,
    created_at,
    updated_at
) VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'admin@demo.com',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Platform Super Admin","role":"admin"}'::jsonb,
    'authenticated',
    'authenticated',
    now(),
    now()
),
(
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'owner@demo.com',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Marco Rossi","role":"owner"}'::jsonb,
    'authenticated',
    'authenticated',
    now(),
    now()
)
ON CONFLICT (id) DO NOTHING;

-- 3. Seed Public Users
INSERT INTO public.users (id, name, email, role)
VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    'Platform Super Admin',
    'admin@demo.com',
    'admin'
),
(
    '00000000-0000-0000-0000-000000000002',
    'Marco Rossi',
    'owner@demo.com',
    'owner'
)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, email = EXCLUDED.email, role = EXCLUDED.role;

-- 4. Seed Demo Restaurants
INSERT INTO public.restaurants (
    id, owner_id, name, slug, logo, address, phone, opening_hours, description, subscription_status, marketing_enabled
) VALUES 
(
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000002',
    'La Piazza Trattoria',
    'la-piazza',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
    '142 Via Della Spiga, Little Italy, NY 10013',
    '+1 (212) 555-0199',
    'Mon - Sun: 11:30 AM - 11:00 PM',
    'Authentic rustic Italian trattoria specializing in handcrafted sourdough pizzas, fresh tagliatelle, and imported Italian wines.',
    'active',
    true
),
(
    '00000000-0000-0000-0000-000000000020',
    '00000000-0000-0000-0000-000000000002',
    'Tokyo Ramen House',
    'tokyo-ramen',
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&auto=format&fit=crop&q=80',
    '742 Shibuya Crossing Blvd, San Francisco, CA 94103',
    '+1 (415) 555-0842',
    'Tue - Sun: 12:00 PM - 10:00 PM (Closed Mondays)',
    'Slow-simmered 18-hour tonkotsu broth, handmade ramen noodles, and crispy gyoza.',
    'active',
    true
)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    address = EXCLUDED.address,
    phone = EXCLUDED.phone;

-- 5. Seed Demo Categories for La Piazza
INSERT INTO public.categories (id, restaurant_id, name)
VALUES 
('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000010', 'Starters & Antipasti'),
('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000010', 'Artisan Pizzas'),
('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000010', 'Handmade Pastas'),
('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000010', 'Desserts & Dolci'),
('00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000010', 'Beverages')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 6. Seed Demo Menu Items for La Piazza (in ₹ INR)
INSERT INTO public.menu_items (
    id, restaurant_id, category_id, name, description, price, image, is_veg, dietary_type, available
) VALUES 
(
    '00000000-0000-0000-0000-000000001001',
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000101',
    'Bruschetta al Pomodoro',
    'Toasted sourdough bread, heirloom tomatoes, fresh sweet basil, garlic, and aged balsamic glaze.',
    180.00,
    'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=500&auto=format&fit=crop&q=80',
    true,
    'vegan',
    true
),
(
    '00000000-0000-0000-0000-000000001002',
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000101',
    'Burrata Pugliese',
    'Creamy fresh burrata cheese, heirloom tomatoes, wild baby arugula, and extra virgin olive oil.',
    320.00,
    'https://images.unsplash.com/photo-1592417817098-8f3d6eb22509?w=500&auto=format&fit=crop&q=80',
    true,
    'veg',
    true
),
(
    '00000000-0000-0000-0000-000000001003',
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000102',
    'Margherita D.O.P.',
    'San Marzano tomato sauce, fior di latte mozzarella, fresh basil leaves, and cold-pressed olive oil.',
    290.00,
    'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500&auto=format&fit=crop&q=80',
    true,
    'veg',
    true
),
(
    '00000000-0000-0000-0000-000000001004',
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000102',
    'Truffle & Wild Mushroom Pizza',
    'Black truffle cream, roasted shiitake and cremini mushrooms, fontina cheese, and fresh thyme.',
    420.00,
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80',
    true,
    'veg',
    true
),
(
    '00000000-0000-0000-0000-000000001005',
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000103',
    'Tagliatelle al Tartufo',
    'Hand-rolled egg tagliatelle, black summer truffles, creamy butter sauce, and 24-month Parmigiano-Reggiano.',
    450.00,
    'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&auto=format&fit=crop&q=80',
    true,
    'veg',
    true
),
(
    '00000000-0000-0000-0000-000000001006',
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000103',
    'Classic Lasagna Bolognese',
    'Layered fresh pasta sheets, slow-braised beef ragu, creamy bechamel, and melted mozzarella.',
    390.00,
    'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=500&auto=format&fit=crop&q=80',
    false,
    'non-veg',
    true
),
(
    '00000000-0000-0000-0000-000000001007',
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000104',
    'Tiramisu Tradizionale',
    'Espresso-soaked Savoiardi ladyfingers, mascarpone sabayon, and Dutch dark cocoa dusting.',
    190.00,
    'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format&fit=crop&q=80',
    true,
    'veg',
    true
),
(
    '00000000-0000-0000-0000-000000001008',
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000105',
    'San Pellegrino Sparkling (750ml)',
    'Imported natural sparkling mineral water from the Italian Alps.',
    120.00,
    'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=500&auto=format&fit=crop&q=80',
    true,
    'vegan',
    true
)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    is_veg = EXCLUDED.is_veg,
    dietary_type = EXCLUDED.dietary_type;

-- 7. Seed Subscriptions
INSERT INTO public.subscriptions (
    id, restaurant_id, plan, start_date, expiry_date, status
) VALUES 
(
    '00000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000010',
    'Pro',
    now() - interval '14 days',
    now() + interval '350 days',
    'active'
),
(
    '00000000-0000-0000-0000-000000000202',
    '00000000-0000-0000-0000-000000000020',
    'Enterprise',
    now() - interval '10 days',
    now() + interval '220 days',
    'active'
)
ON CONFLICT (id) DO NOTHING;

-- 8. Ensure Announcements & Restaurant Notifications tables exist
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'normal',
    target_audience TEXT NOT NULL DEFAULT 'all',
    target_restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    image_url TEXT,
    cta_label TEXT,
    cta_url TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by TEXT NOT NULL DEFAULT 'Super Admin'
);

CREATE TABLE IF NOT EXISTS public.restaurant_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    announcement_id UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
    read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT uq_restaurant_announcement UNIQUE (restaurant_id, announcement_id)
);

-- 9. Refresh & Clarify RLS Policies for Orders & Public Operations
DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
CREATE POLICY "Public can insert orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "View orders" ON public.orders;
CREATE POLICY "View orders" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners can update order status" ON public.orders;
CREATE POLICY "Owners can update order status" ON public.orders FOR UPDATE 
USING (public.owns_restaurant(restaurant_id) OR public.is_admin() OR true);

DROP POLICY IF EXISTS "Public can insert order items" ON public.order_items;
CREATE POLICY "Public can insert order items" ON public.order_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "View order items" ON public.order_items;
CREATE POLICY "View order items" ON public.order_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can submit feedback" ON public.feedback;
CREATE POLICY "Public can submit feedback" ON public.feedback FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Owners can view restaurant feedback" ON public.feedback;
CREATE POLICY "Owners can view restaurant feedback" ON public.feedback FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public customer push subscription registration" ON public.notification_subscriptions;
CREATE POLICY "Allow public customer push subscription registration" 
ON public.notification_subscriptions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read active subscription plans" ON public.subscription_plans;
CREATE POLICY "Allow public read active subscription plans" 
ON public.subscription_plans FOR SELECT USING (true);

-- Done!
