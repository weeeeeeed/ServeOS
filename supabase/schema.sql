-- ==============================================================================
-- MULTI-TENANT RESTAURANT QR MENU SAAS - SUPABASE SCHEMA & RLS
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Users Table
-- Syncs with Supabase auth.users to store application-specific roles and metadata.
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'owner')) DEFAULT 'owner',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Restaurants Table
-- Stores tenant restaurant profiles, opening hours, descriptions, and subscription states.
CREATE TABLE IF NOT EXISTS public.restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo TEXT,
    address TEXT,
    phone TEXT,
    opening_hours TEXT DEFAULT 'Mon - Sun: 10:00 AM - 10:00 PM',
    description TEXT DEFAULT 'Welcome to our restaurant! Browse our digital QR menu below.',
    subscription_status TEXT NOT NULL CHECK (
        subscription_status IN ('trialing', 'active', 'past_due', 'canceled', 'inactive')
    ) DEFAULT 'trialing',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Categories Table
-- Stores menu categories for each individual restaurant.
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Menu Items Table
-- Stores individual food/beverage dishes with category, price, image, dietary flags, and availability.
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    image TEXT,
    is_veg BOOLEAN NOT NULL DEFAULT false,
    dietary_type TEXT NOT NULL CHECK (dietary_type IN ('veg', 'non-veg', 'vegan')) DEFAULT 'non-veg',
    available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create Orders Table
-- Stores incoming customer orders tagged with restaurant, table, and kitchen status.
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    table_number TEXT NOT NULL,
    customer_notes TEXT,
    status TEXT NOT NULL CHECK (
        status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')
    ) DEFAULT 'pending',
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create Order Items Table
-- Line items for each placed order.
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Create Feedback Table
-- Stores customer ratings (1-5 stars) and review comments after dining.
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    customer_name TEXT DEFAULT 'Diner',
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Create Subscriptions Table
-- Stores tenant SaaS subscription contracts, plans, and expiration timestamps.
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    plan TEXT NOT NULL CHECK (plan IN ('Starter', 'Pro', 'Enterprise', 'Growth')) DEFAULT 'Pro',
    start_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL CHECK (
        status IN ('trialing', 'active', 'past_due', 'canceled', 'inactive')
    ) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Create Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_restaurants_owner ON public.restaurants(owner_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON public.restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_restaurants_subscription ON public.restaurants(subscription_status);
CREATE INDEX IF NOT EXISTS idx_categories_restaurant ON public.categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON public.menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON public.menu_items(available);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON public.orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_feedback_restaurant ON public.feedback(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON public.feedback(rating);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON public.feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_restaurant ON public.subscriptions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- 11. Automatic updated_at Trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_restaurants_updated_at ON public.restaurants;
CREATE TRIGGER set_restaurants_updated_at
    BEFORE UPDATE ON public.restaurants FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_categories_updated_at ON public.categories;
CREATE TRIGGER set_categories_updated_at
    BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_menu_items_updated_at ON public.menu_items;
CREATE TRIGGER set_menu_items_updated_at
    BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
    BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER set_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 12. User Signup Sync Trigger (Auth -> Public Users Table)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT;
    user_name TEXT;
BEGIN
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'owner');
    user_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));

    IF user_role NOT IN ('admin', 'owner') THEN
        user_role := 'owner';
    END IF;

    INSERT INTO public.users (id, name, email, role)
    VALUES (NEW.id, user_name, NEW.email, user_role)
    ON CONFLICT (id) DO UPDATE
    SET name = EXCLUDED.name,
        email = EXCLUDED.email;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.owns_restaurant(target_restaurant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.restaurants
        WHERE id = target_restaurant_id AND owner_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users Policies
CREATE POLICY "Users can read own profile"
    ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can read all profiles"
    ON public.users FOR SELECT USING (public.is_admin());
CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can update any profile"
    ON public.users FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete users"
    ON public.users FOR DELETE USING (public.is_admin());

-- Restaurants Policies
CREATE POLICY "Public can view restaurant by slug"
    ON public.restaurants FOR SELECT USING (true);
CREATE POLICY "Owners can insert their restaurant"
    ON public.restaurants FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update their own restaurant"
    ON public.restaurants FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Admins can manage any restaurant"
    ON public.restaurants FOR ALL USING (public.is_admin());

-- Categories Policies
CREATE POLICY "Public can view restaurant categories"
    ON public.categories FOR SELECT USING (true);
CREATE POLICY "Owners can insert categories in their own restaurant"
    ON public.categories FOR INSERT
    WITH CHECK (public.owns_restaurant(restaurant_id) OR public.is_admin());
CREATE POLICY "Owners can update categories in their own restaurant"
    ON public.categories FOR UPDATE
    USING (public.owns_restaurant(restaurant_id) OR public.is_admin())
    WITH CHECK (public.owns_restaurant(restaurant_id) OR public.is_admin());
CREATE POLICY "Owners can delete categories in their own restaurant"
    ON public.categories FOR DELETE
    USING (public.owns_restaurant(restaurant_id) OR public.is_admin());

-- Menu Items Policies
CREATE POLICY "Public can view restaurant menu items"
    ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Owners can insert menu items in their own restaurant"
    ON public.menu_items FOR INSERT
    WITH CHECK (public.owns_restaurant(restaurant_id) OR public.is_admin());
CREATE POLICY "Owners can update menu items in their own restaurant"
    ON public.menu_items FOR UPDATE
    USING (public.owns_restaurant(restaurant_id) OR public.is_admin())
    WITH CHECK (public.owns_restaurant(restaurant_id) OR public.is_admin());
CREATE POLICY "Owners can delete menu items in their own restaurant"
    ON public.menu_items FOR DELETE
    USING (public.owns_restaurant(restaurant_id) OR public.is_admin());

-- Orders Policies
CREATE POLICY "Public can insert orders"
    ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "View orders"
    ON public.orders FOR SELECT
    USING (public.owns_restaurant(restaurant_id) OR public.is_admin() OR true);
CREATE POLICY "Owners can update order status"
    ON public.orders FOR UPDATE
    USING (public.owns_restaurant(restaurant_id) OR public.is_admin())
    WITH CHECK (public.owns_restaurant(restaurant_id) OR public.is_admin());

-- Order Items Policies
CREATE POLICY "Public can insert order items"
    ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "View order items"
    ON public.order_items FOR SELECT USING (true);

-- Feedback Policies
CREATE POLICY "Public can submit feedback"
    ON public.feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Owners can view restaurant feedback"
    ON public.feedback FOR SELECT
    USING (public.owns_restaurant(restaurant_id) OR public.is_admin());
CREATE POLICY "Admins can manage all feedback"
    ON public.feedback FOR ALL USING (public.is_admin());

-- Subscriptions Policies
CREATE POLICY "Admins can manage subscriptions"
    ON public.subscriptions FOR ALL
    USING (public.is_admin());
CREATE POLICY "Owners can view own subscription"
    ON public.subscriptions FOR SELECT
    USING (public.owns_restaurant(restaurant_id));
