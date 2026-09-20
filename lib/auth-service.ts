'use client';

import { createClient, isSupabaseConfigured } from './supabase/client';
import { User, Restaurant, TenantWithDetails, SubscriptionStatus } from './types';
import { INITIAL_USERS, INITIAL_RESTAURANTS } from './mock-data';
import { toValidUUID } from './uuid-utils';

const STORAGE_USERS_KEY = 'qr_saas_users_v1';
const STORAGE_RESTAURANTS_KEY = 'qr_saas_restaurants_v1';
const STORAGE_SESSION_KEY = 'qr_saas_current_session_v1';

// Helper to set cookie for Edge Middleware access
function setAuthCookie(user: User | null) {
  if (typeof document === 'undefined') return;
  if (!user) {
    document.cookie = 'qr_user_role=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'qr_user_id=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'qr_user_email=; path=/; max-age=0; SameSite=Lax';
  } else {
    const maxAge = 60 * 60 * 24 * 7; // 7 days
    document.cookie = `qr_user_role=${user.role}; path=/; max-age=${maxAge}; SameSite=Lax`;
    document.cookie = `qr_user_id=${user.id}; path=/; max-age=${maxAge}; SameSite=Lax`;
    document.cookie = `qr_user_email=${encodeURIComponent(user.email)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }
}

// Local mock store utilities for resilience
function getStoredUsers(): User[] {
  if (typeof window === 'undefined') return INITIAL_USERS;
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_USERS;
  }
}

function saveStoredUsers(users: User[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
}

function getStoredRestaurants(): Restaurant[] {
  if (typeof window === 'undefined') return INITIAL_RESTAURANTS;
  try {
    const raw = localStorage.getItem(STORAGE_RESTAURANTS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_RESTAURANTS_KEY, JSON.stringify(INITIAL_RESTAURANTS));
      return INITIAL_RESTAURANTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_RESTAURANTS;
  }
}

function saveStoredRestaurants(restaurants: Restaurant[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_RESTAURANTS_KEY, JSON.stringify(restaurants));
}

export const AuthService = {
  isConfigured(): boolean {
    return isSupabaseConfigured();
  },

  getCurrentSession(): { user: User | null; restaurant: Restaurant | null } {
    if (typeof window === 'undefined') {
      return { user: null, restaurant: null };
    }

    try {
      const raw = localStorage.getItem(STORAGE_SESSION_KEY);
      if (!raw) return { user: null, restaurant: null };
      const parsed = JSON.parse(raw);
      
      // If Supabase is configured and restaurant has a mock ID like rst-01, bridge it to UUID
      if (isSupabaseConfigured()) {
        if (parsed.restaurant?.id) {
          parsed.restaurant.id = toValidUUID(parsed.restaurant.id);
        }
        if (parsed.user?.id) {
          parsed.user.id = toValidUUID(parsed.user.id);
        }
      }

      // Sync cookie if session exists
      if (parsed.user) {
        setAuthCookie(parsed.user);
      }
      return parsed;
    } catch {
      return { user: null, restaurant: null };
    }
  },

  setSession(user: User | null, restaurant: Restaurant | null = null) {
    if (typeof window === 'undefined') return;
    if (!user) {
      localStorage.removeItem(STORAGE_SESSION_KEY);
      setAuthCookie(null);
    } else {
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify({ user, restaurant }));
      setAuthCookie(user);
    }
  },

  async login(email: string, password: string): Promise<{ user: User; restaurant: Restaurant | null }> {
    const cleanEmail = email.trim().toLowerCase();

    // If Supabase is configured and not using a quick demo test
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('No user returned from authentication');

        // Fetch user record from public.users
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .maybeSingle();

        const activeUser: User = userData || {
          id: authData.user.id,
          name: authData.user.user_metadata?.name || cleanEmail.split('@')[0],
          email: cleanEmail,
          role: (authData.user.user_metadata?.role as 'admin' | 'owner') || 'owner',
          created_at: new Date().toISOString(),
        };

        let restaurant: Restaurant | null = null;
        if (activeUser.role === 'owner') {
          const { data: rData } = await supabase
            .from('restaurants')
            .select('*')
            .eq('owner_id', activeUser.id)
            .maybeSingle();

          if (rData) {
            restaurant = rData;
          } else {
            // Check for demo or first available restaurant in database
            const { data: fallbackRest } = await supabase
              .from('restaurants')
              .select('*')
              .limit(1)
              .maybeSingle();
            restaurant = fallbackRest || null;
          }
        }

        this.setSession(activeUser, restaurant);
        return { user: activeUser, restaurant };
      } catch (err: any) {
        console.error('Supabase authentication failed:', err?.message || err);
        throw new Error(err?.message || 'Authentication failed. Please check your credentials.');
      }
    }

    // Local / Demo Mode Execution (Only when Supabase is not configured)
    const users = getStoredUsers();
    let user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      // If user typed any email, auto-create or check if admin
      const isAdmin = cleanEmail.includes('admin');
      user = {
        id: `usr-${Date.now()}`,
        name: cleanEmail.split('@')[0].replace('.', ' '),
        email: cleanEmail,
        role: isAdmin ? 'admin' : 'owner',
        created_at: new Date().toISOString(),
      };
      users.push(user);
      saveStoredUsers(users);
    }

    let restaurant: Restaurant | null = null;
    if (user.role === 'owner') {
      const restaurants = getStoredRestaurants();
      restaurant = restaurants.find((r) => r.owner_id === user!.id) || null;
      
      if (!restaurant) {
        // Create an initial restaurant for the new owner
        const slugName = user.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        restaurant = {
          id: `rst-${Date.now()}`,
          owner_id: user.id,
          name: `${user.name}'s Restaurant`,
          slug: slugName || `restaurant-${Date.now().toString().slice(-4)}`,
          logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80',
          address: '100 Main Street, Suite A',
          phone: '+1 (555) 019-2831',
          subscription_status: 'trialing',
          created_at: new Date().toISOString(),
        };
        restaurants.push(restaurant);
        saveStoredRestaurants(restaurants);
      }
    }

    this.setSession(user, restaurant);
    return { user, restaurant };
  },

  async registerOwner(params: {
    name: string;
    email: string;
    password?: string;
    restaurantName: string;
    slug: string;
    phone?: string;
    address?: string;
  }): Promise<{ user: User; restaurant: Restaurant }> {
    const cleanEmail = params.email.trim().toLowerCase();
    const cleanSlug = params.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();

        // 1. Pre-check if email already exists in public.users
        const { data: existingUser } = await supabase
          .from('users')
          .select('id, email')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (existingUser) {
          throw new Error('An account with this email address already exists. Please log in instead.');
        }

        // 2. Pre-check if restaurant slug is already taken
        const { data: existingSlug } = await supabase
          .from('restaurants')
          .select('id, slug')
          .eq('slug', cleanSlug)
          .maybeSingle();

        if (existingSlug) {
          throw new Error(`The URL slug "${cleanSlug}" is already taken by another restaurant. Please choose a different custom slug.`);
        }

        // 3. Register user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: params.password || 'TemporaryPass123!',
          options: {
            data: {
              name: params.name,
              role: 'owner',
            },
          },
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('Registration failed');

        // Check for GoTrue silent duplicate signup (empty identities array)
        if (authData.user.identities && authData.user.identities.length === 0) {
          throw new Error('An account with this email address already exists. Please log in instead.');
        }

        const userId = authData.user.id;

        // 4. Ensure active session if possible (or sign in)
        if (!authData.session && params.password) {
          try {
            await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password: params.password,
            });
          } catch {
            // Non-blocking: proceed with registration
          }
        }

        // 5. Ensure user record in public.users
        const userObj: User = {
          id: userId,
          name: params.name,
          email: cleanEmail,
          role: 'owner',
          created_at: new Date().toISOString(),
        };

        // Explicitly upsert user in public.users
        const { error: userError } = await supabase.from('users').upsert({
          id: userId,
          name: params.name,
          email: cleanEmail,
          role: 'owner',
        });
        if (userError) {
          console.warn('public.users upsert notice:', userError.message);
        }

        // 6. Insert restaurant
        const { data: restData, error: restError } = await supabase
          .from('restaurants')
          .insert({
            owner_id: userId,
            name: params.restaurantName,
            slug: cleanSlug,
            phone: params.phone || '',
            address: params.address || '',
            subscription_status: 'trialing',
          })
          .select()
          .single();

        if (restError) {
          if (restError.code === '23503' || restError.message?.includes('restaurants_owner_id_fkey')) {
            throw new Error('User account could not be linked. An account with this email may already exist — please log in instead.');
          }
          if (restError.code === '23505' || restError.message?.includes('restaurants_slug_key')) {
            throw new Error(`The URL slug "${cleanSlug}" is already taken. Please choose a different restaurant name or slug.`);
          }
          throw restError;
        }

        // 7. Auto-seed starter categories in Supabase for the new establishment
        const starterCategories = ['Chef Specials', 'Main Courses', 'Beverages'];
        for (const catName of starterCategories) {
          await supabase.from('categories').insert({
            restaurant_id: restData.id,
            name: catName,
          });
        }

        this.setSession(userObj, restData);
        return { user: userObj, restaurant: restData };
      } catch (err: any) {
        console.error('Supabase registration error:', err?.message || err);
        throw new Error(err?.message || 'Registration failed. Please check your details and try again.');
      }
    }

    // Local / Demo Mode Registration (Only when Supabase is not configured)
    const users = getStoredUsers();
    const existingUser = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existingUser) {
      throw new Error('An account with this email already exists. Please log in.');
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: params.name,
      email: cleanEmail,
      role: 'owner',
      created_at: new Date().toISOString(),
    };
    users.push(newUser);
    saveStoredUsers(users);

    const restaurants = getStoredRestaurants();
    const existingSlug = restaurants.find((r) => r.slug.toLowerCase() === cleanSlug);
    const finalSlug = existingSlug ? `${cleanSlug}-${Date.now().toString().slice(-3)}` : cleanSlug;

    const newRestaurant: Restaurant = {
      id: `rst-${Date.now()}`,
      owner_id: newUser.id,
      name: params.restaurantName,
      slug: finalSlug,
      logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150&auto=format&fit=crop&q=80',
      address: params.address || '742 Evergreen Terrace',
      phone: params.phone || '+1 (555) 012-3456',
      subscription_status: 'trialing',
      created_at: new Date().toISOString(),
    };
    restaurants.push(newRestaurant);
    saveStoredRestaurants(restaurants);

    this.setSession(newUser, newRestaurant);
    return { user: newUser, restaurant: newRestaurant };
  },

  async logout(): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Supabase signout error:', err);
      }
    }
    this.setSession(null, null);
  },

  async updateRestaurantProfile(
    restaurantId: string,
    updates: Partial<Restaurant>
  ): Promise<Restaurant> {
    const validRestaurantId = toValidUUID(restaurantId);

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const allowedCols = [
          'name',
          'address',
          'phone',
          'description',
          'logo',
          'opening_hours',
          'subscription_status',
          'marketing_enabled',
        ];
        const sanitizedUpdates: Record<string, any> = {};
        for (const [k, v] of Object.entries(updates)) {
          if (allowedCols.includes(k) && v !== undefined) {
            sanitizedUpdates[k] = v;
          }
        }
        sanitizedUpdates.updated_at = new Date().toISOString();

        const { data, error } = await supabase
          .from('restaurants')
          .update(sanitizedUpdates)
          .eq('id', validRestaurantId)
          .select()
          .single();

        if (error) throw error;
        
        // Update local session cache if it matches
        const current = this.getCurrentSession();
        if (current.restaurant?.id === restaurantId || current.restaurant?.id === validRestaurantId) {
          this.setSession(current.user, data);
        }
        return data;
      } catch (err: any) {
        console.error('Supabase restaurant update error:', err?.message || err);
        throw new Error(err?.message || 'Failed to update restaurant profile in database');
      }
    }

    const restaurants = getStoredRestaurants();
    const index = restaurants.findIndex((r) => r.id === restaurantId || r.id === validRestaurantId);
    if (index === -1) throw new Error('Restaurant not found');

    const updated: Restaurant = {
      ...restaurants[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    restaurants[index] = updated;
    saveStoredRestaurants(restaurants);

    const current = this.getCurrentSession();
    if (current.restaurant?.id === restaurantId || current.restaurant?.id === validRestaurantId) {
      this.setSession(current.user, updated);
    }

    return updated;
  },

  async getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
    const cleanSlug = slug.toLowerCase();
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('slug', cleanSlug)
          .maybeSingle();

        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase fetch by slug failed:', err);
      }
    }

    const restaurants = getStoredRestaurants();
    const found = restaurants.find((r) => r.slug.toLowerCase() === cleanSlug) || null;
    if (found && isSupabaseConfigured()) {
      return {
        ...found,
        id: toValidUUID(found.id),
      };
    }
    return found;
  },

  async getAllTenants(): Promise<TenantWithDetails[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data: rests, error: rError } = await supabase.from('restaurants').select('*');
        const { data: users, error: uError } = await supabase.from('users').select('*');

        if (!rError && rests) {
          const userMap = new Map(users?.map((u) => [u.id, u]) || []);
          return rests.map((r) => ({
            ...r,
            owner: userMap.get(r.owner_id)
              ? {
                  id: userMap.get(r.owner_id)!.id,
                  name: userMap.get(r.owner_id)!.name,
                  email: userMap.get(r.owner_id)!.email,
                }
              : undefined,
          }));
        }
      } catch (err) {
        console.warn('Supabase getAllTenants failed, using local store:', err);
      }
    }

    const restaurants = getStoredRestaurants();
    const users = getStoredUsers();
    const userMap = new Map(users.map((u) => [u.id, u]));

    return restaurants.map((r) => ({
      ...r,
      owner: userMap.get(r.owner_id)
        ? {
            id: userMap.get(r.owner_id)!.id,
            name: userMap.get(r.owner_id)!.name,
            email: userMap.get(r.owner_id)!.email,
          }
        : undefined,
    }));
  },

  async getAllUsers(): Promise<User[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase getAllUsers failed:', err);
      }
    }

    return getStoredUsers();
  },

  async updateSubscriptionStatus(
    restaurantId: string,
    subscription_status: SubscriptionStatus
  ): Promise<void> {
    const validRestaurantId = toValidUUID(restaurantId);
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from('restaurants')
          .update({ subscription_status, updated_at: new Date().toISOString() })
          .or(`id.eq.${validRestaurantId},id.eq.${restaurantId}`);
        if (error) throw error;
      } catch (err: any) {
        console.error('Supabase updateSubscriptionStatus failed:', err?.message || err);
      }
    }

    const restaurants = getStoredRestaurants();
    const index = restaurants.findIndex((r) => r.id === restaurantId || r.id === validRestaurantId);
    if (index !== -1) {
      restaurants[index].subscription_status = subscription_status;
      restaurants[index].updated_at = new Date().toISOString();
      saveStoredRestaurants(restaurants);
    }
  },
};
