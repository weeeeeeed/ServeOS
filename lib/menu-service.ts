'use client';

import { createClient, isSupabaseConfigured } from './supabase/client';
import { Category, MenuItem, DietaryType, OwnerMenuStats } from './types';
import { INITIAL_CATEGORIES, INITIAL_MENU_ITEMS } from './mock-data';
import { toValidUUID } from './uuid-utils';

const STORAGE_CATEGORIES_KEY = 'qr_saas_categories_v2';
const STORAGE_MENU_ITEMS_KEY = 'qr_saas_menu_items_v2';

function getStoredCategories(): Category[] {
  if (typeof window === 'undefined') return INITIAL_CATEGORIES;
  try {
    const raw = localStorage.getItem(STORAGE_CATEGORIES_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_CATEGORIES_KEY, JSON.stringify(INITIAL_CATEGORIES));
      return INITIAL_CATEGORIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CATEGORIES;
  }
}

function saveStoredCategories(categories: Category[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_CATEGORIES_KEY, JSON.stringify(categories));
  window.dispatchEvent(new CustomEvent('qr_categories_updated'));
}

function getStoredMenuItems(): MenuItem[] {
  if (typeof window === 'undefined') return INITIAL_MENU_ITEMS;
  try {
    const raw = localStorage.getItem(STORAGE_MENU_ITEMS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_MENU_ITEMS_KEY, JSON.stringify(INITIAL_MENU_ITEMS));
      return INITIAL_MENU_ITEMS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MENU_ITEMS;
  }
}

function saveStoredMenuItems(items: MenuItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_MENU_ITEMS_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('qr_menu_updated'));
}

export const MenuService = {
  // ==========================================
  // IMAGE UPLOAD (Supabase Storage + DataURL Fallback)
  // ==========================================
  async uploadImage(file: File, bucket: string = 'menu-items'): Promise<string> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file);

        if (!uploadError) {
          const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
          return data.publicUrl;
        }
      } catch (err) {
        console.warn('Supabase storage upload failed, using data URL fallback:', err);
      }
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  },

  // ==========================================
  // CATEGORIES
  // ==========================================
  async getCategories(restaurantId: string): Promise<Category[]> {
    if (!restaurantId) return [];

    const validRestaurantId = toValidUUID(restaurantId);

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .or(`restaurant_id.eq.${validRestaurantId},restaurant_id.eq.${restaurantId}`)
          .order('created_at', { ascending: true });

        if (!error && data) {
          saveStoredCategories(data);
          return data;
        }
      } catch (err) {
        console.warn('Supabase getCategories failed, using local store:', err);
      }
    }

    const all = getStoredCategories();
    return all.filter((c) => c.restaurant_id === restaurantId || c.restaurant_id === validRestaurantId);
  },

  async createCategory(restaurantId: string, name: string): Promise<Category> {
    if (!name.trim()) throw new Error('Category name is required');
    if (!restaurantId) throw new Error('Restaurant ID is required');

    const validRestaurantId = toValidUUID(restaurantId);

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('categories')
          .insert({
            restaurant_id: validRestaurantId,
            name: name.trim(),
          })
          .select()
          .single();

        if (error) throw error;

        const all = getStoredCategories();
        all.push(data);
        saveStoredCategories(all);
        return data;
      } catch (err: any) {
        console.error('Supabase createCategory error:', err?.message || err);
        throw new Error(err?.message || 'Failed to create category in database');
      }
    }

    const all = getStoredCategories();
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      restaurant_id: restaurantId,
      name: name.trim(),
      created_at: new Date().toISOString(),
    };

    all.push(newCategory);
    saveStoredCategories(all);
    return newCategory;
  },

  async updateCategory(
    categoryId: string,
    name: string,
    restaurantId?: string
  ): Promise<Category> {
    if (!name.trim()) throw new Error('Category name is required');
    const validCategoryId = toValidUUID(categoryId);
    const validRestaurantId = restaurantId ? toValidUUID(restaurantId) : undefined;

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        let query = supabase
          .from('categories')
          .update({ name: name.trim(), updated_at: new Date().toISOString() })
          .or(`id.eq.${validCategoryId},id.eq.${categoryId}`);

        if (validRestaurantId) {
          query = query.or(`restaurant_id.eq.${validRestaurantId},restaurant_id.eq.${restaurantId}`);
        }

        const { data, error } = await query.select().single();
        if (error) throw error;

        const all = getStoredCategories();
        const idx = all.findIndex((c) => c.id === categoryId || c.id === validCategoryId);
        if (idx !== -1) {
          all[idx] = data;
          saveStoredCategories(all);
        }
        return data;
      } catch (err: any) {
        console.error('Supabase updateCategory error:', err?.message || err);
        throw new Error(err?.message || 'Failed to update category in database');
      }
    }

    const all = getStoredCategories();
    const index = all.findIndex((c) => (c.id === categoryId || c.id === validCategoryId) && (!restaurantId || c.restaurant_id === restaurantId || c.restaurant_id === validRestaurantId));
    if (index === -1) throw new Error('Category not found or unauthorized');

    const updated: Category = {
      ...all[index],
      name: name.trim(),
      updated_at: new Date().toISOString(),
    };
    all[index] = updated;
    saveStoredCategories(all);
    return updated;
  },

  async deleteCategory(categoryId: string, restaurantId?: string): Promise<void> {
    const validCategoryId = toValidUUID(categoryId);
    const validRestaurantId = restaurantId ? toValidUUID(restaurantId) : undefined;

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        let query = supabase
          .from('categories')
          .delete()
          .or(`id.eq.${validCategoryId},id.eq.${categoryId}`);

        if (validRestaurantId) {
          query = query.or(`restaurant_id.eq.${validRestaurantId},restaurant_id.eq.${restaurantId}`);
        }

        const { error } = await query;
        if (error) throw error;
      } catch (err: any) {
        console.error('Supabase deleteCategory error:', err?.message || err);
        throw new Error(err?.message || 'Failed to delete category from database');
      }
    }

    const all = getStoredCategories().filter(
      (c) => !( (c.id === categoryId || c.id === validCategoryId) && (!restaurantId || c.restaurant_id === restaurantId || c.restaurant_id === validRestaurantId) )
    );
    saveStoredCategories(all);

    // Cascade delete local menu items
    const items = getStoredMenuItems().filter(
      (i) => !( (i.category_id === categoryId || i.category_id === validCategoryId) && (!restaurantId || i.restaurant_id === restaurantId || i.restaurant_id === validRestaurantId) )
    );
    saveStoredMenuItems(items);
  },

  // ==========================================
  // MENU ITEMS
  // ==========================================
  async getMenuItems(
    restaurantId: string,
    categoryId?: string | 'all'
  ): Promise<MenuItem[]> {
    if (!restaurantId) return [];

    const validRestaurantId = toValidUUID(restaurantId);

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        let query = supabase
          .from('menu_items')
          .select('*')
          .or(`restaurant_id.eq.${validRestaurantId},restaurant_id.eq.${restaurantId}`)
          .order('created_at', { ascending: true });

        if (categoryId && categoryId !== 'all') {
          const validCatId = toValidUUID(categoryId);
          query = query.or(`category_id.eq.${validCatId},category_id.eq.${categoryId}`);
        }

        const { data, error } = await query;
        if (!error && data) {
          saveStoredMenuItems(data);
          return data;
        }
      } catch (err) {
        console.warn('Supabase getMenuItems failed, using local store:', err);
      }
    }

    const all = getStoredMenuItems();
    let filtered = all.filter((i) => i.restaurant_id === restaurantId || i.restaurant_id === validRestaurantId);
    if (categoryId && categoryId !== 'all') {
      const validCatId = toValidUUID(categoryId);
      filtered = filtered.filter((i) => i.category_id === categoryId || i.category_id === validCatId);
    }
    return filtered;
  },

  async createMenuItem(data: {
    restaurant_id: string;
    category_id: string;
    name: string;
    description?: string | null;
    price: number;
    image?: string | null;
    available?: boolean;
    is_veg?: boolean;
    dietary_type?: DietaryType;
  }): Promise<MenuItem> {
    if (!data.name.trim()) throw new Error('Menu item name is required');
    if (!data.category_id) throw new Error('Please select a category for this item');
    if (data.price < 0) throw new Error('Price cannot be negative');

    const dietaryType = data.dietary_type || (data.is_veg ? 'veg' : 'non-veg');
    const isVeg = dietaryType === 'veg' || dietaryType === 'vegan';

    const validRestaurantId = toValidUUID(data.restaurant_id);
    const validCategoryId = toValidUUID(data.category_id);

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data: itemData, error } = await supabase
          .from('menu_items')
          .insert({
            restaurant_id: validRestaurantId,
            category_id: validCategoryId,
            name: data.name.trim(),
            description: data.description?.trim() || null,
            price: data.price,
            image: data.image || null,
            is_veg: isVeg,
            dietary_type: dietaryType,
            available: data.available ?? true,
          })
          .select()
          .single();

        if (error) throw error;

        const all = getStoredMenuItems();
        all.push(itemData);
        saveStoredMenuItems(all);
        return itemData;
      } catch (err: any) {
        console.error('Supabase createMenuItem error:', err?.message || err);
        throw new Error(err?.message || 'Failed to create menu item in database');
      }
    }

    const all = getStoredMenuItems();
    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      restaurant_id: data.restaurant_id,
      category_id: data.category_id,
      name: data.name.trim(),
      description: data.description?.trim() || null,
      price: data.price,
      image: data.image || null,
      available: data.available ?? true,
      is_veg: isVeg,
      dietary_type: dietaryType,
      created_at: new Date().toISOString(),
    };

    all.push(newItem);
    saveStoredMenuItems(all);
    return newItem;
  },

  async updateMenuItem(
    itemId: string,
    updates: Partial<Omit<MenuItem, 'id' | 'restaurant_id' | 'created_at'>>,
    restaurantId?: string
  ): Promise<MenuItem> {
    const validItemId = toValidUUID(itemId);
    const validRestaurantId = restaurantId ? toValidUUID(restaurantId) : undefined;

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const sanitizedUpdates: any = { ...updates };
        if (sanitizedUpdates.category_id) {
          sanitizedUpdates.category_id = toValidUUID(sanitizedUpdates.category_id);
        }
        if (sanitizedUpdates.dietary_type) {
          sanitizedUpdates.is_veg = sanitizedUpdates.dietary_type === 'veg' || sanitizedUpdates.dietary_type === 'vegan';
        }
        sanitizedUpdates.updated_at = new Date().toISOString();

        let query = supabase
          .from('menu_items')
          .update(sanitizedUpdates)
          .or(`id.eq.${validItemId},id.eq.${itemId}`);

        if (validRestaurantId) {
          query = query.or(`restaurant_id.eq.${validRestaurantId},restaurant_id.eq.${restaurantId}`);
        }

        const { data, error } = await query.select().single();
        if (error) throw error;

        const all = getStoredMenuItems();
        const idx = all.findIndex((i) => i.id === itemId || i.id === validItemId);
        if (idx !== -1) {
          all[idx] = data;
          saveStoredMenuItems(all);
        }
        return data;
      } catch (err: any) {
        console.error('Supabase updateMenuItem error:', err?.message || err);
        throw new Error(err?.message || 'Failed to update menu item in database');
      }
    }

    const all = getStoredMenuItems();
    const index = all.findIndex((i) => (i.id === itemId || i.id === validItemId) && (!restaurantId || i.restaurant_id === restaurantId || i.restaurant_id === validRestaurantId));
    if (index === -1) throw new Error('Menu item not found or unauthorized');

    const updated: MenuItem = {
      ...all[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    all[index] = updated;
    saveStoredMenuItems(all);
    return updated;
  },

  async deleteMenuItem(itemId: string, restaurantId?: string): Promise<void> {
    const validItemId = toValidUUID(itemId);
    const validRestaurantId = restaurantId ? toValidUUID(restaurantId) : undefined;

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        let query = supabase
          .from('menu_items')
          .delete()
          .or(`id.eq.${validItemId},id.eq.${itemId}`);

        if (validRestaurantId) {
          query = query.or(`restaurant_id.eq.${validRestaurantId},restaurant_id.eq.${restaurantId}`);
        }

        const { error } = await query;
        if (error) throw error;
      } catch (err: any) {
        console.error('Supabase deleteMenuItem error:', err?.message || err);
        throw new Error(err?.message || 'Failed to delete menu item from database');
      }
    }

    const all = getStoredMenuItems().filter(
      (i) => !( (i.id === itemId || i.id === validItemId) && (!restaurantId || i.restaurant_id === restaurantId || i.restaurant_id === validRestaurantId) )
    );
    saveStoredMenuItems(all);
  },

  async toggleItemAvailability(
    itemId: string,
    available: boolean,
    restaurantId?: string
  ): Promise<MenuItem> {
    return this.updateMenuItem(itemId, { available }, restaurantId);
  },

  // ==========================================
  // OWNER METRICS
  // ==========================================
  async getOwnerMenuStats(restaurantId: string): Promise<OwnerMenuStats> {
    const [categories, items] = await Promise.all([
      this.getCategories(restaurantId),
      this.getMenuItems(restaurantId),
    ]);

    const totalItems = items.length;
    const availableItems = items.filter((i) => i.available).length;
    const unavailableItems = totalItems - availableItems;
    const totalCategories = categories.length;

    return {
      totalItems,
      availableItems,
      unavailableItems,
      totalCategories,
    };
  },
};
