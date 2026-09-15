'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Utensils,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Sparkles,
  FolderPlus,
  Layers,
  Leaf,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { Category, MenuItem, DietaryType } from '@/lib/types';
import { MenuService } from '@/lib/menu-service';
import { MenuItemModal } from './menu-item-modal';
import { CategoryModal } from './category-modal';

interface MenuManagementProps {
  restaurantId: string;
  onStatsChange?: () => void;
}

export function MenuManagement({ restaurantId, onStatsChange }: MenuManagementProps) {
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'non-veg' | 'vegan'>('all');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Deletion state
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    if (!restaurantId) return;
    try {
      const [cats, items] = await Promise.all([
        MenuService.getCategories(restaurantId),
        MenuService.getMenuItems(restaurantId),
      ]);
      setCategories(cats);
      setMenuItems(items);
    } catch (err) {
      console.error('Failed to load menu data:', err);
      toast.error('Error loading menu', 'Could not sync items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [restaurantId]);

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const updated = await MenuService.toggleItemAvailability(item.id, !item.available);
      setMenuItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, available: updated.available } : i))
      );
      if (onStatsChange) onStatsChange();
      toast.info(
        updated.available ? 'Dish Available' : 'Dish Marked Sold Out',
        `${item.name} is now ${updated.available ? 'in stock' : 'unavailable'}`
      );
    } catch (err) {
      console.error('Failed to toggle availability:', err);
      toast.error('Failed to toggle status');
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await MenuService.deleteMenuItem(itemToDelete.id);
      setMenuItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
      setItemToDelete(null);
      if (onStatsChange) onStatsChange();
      toast.success('Dish Deleted', `${itemToDelete.name} was removed from menu`);
    } catch (err) {
      console.error('Failed to delete item:', err);
      toast.error('Failed to delete dish');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleItemSaved = () => {
    loadData();
    if (onStatsChange) onStatsChange();
    toast.success(editingItem ? 'Dish Updated' : 'Dish Added to Menu');
  };

  const handleCategorySaved = () => {
    loadData();
    if (onStatsChange) onStatsChange();
    toast.success('Category Created');
  };

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  // Filtered Menu Items
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategoryId === 'all' || item.category_id === selectedCategoryId;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesDietary = true;
    const itemDietary = item.dietary_type || (item.is_veg ? 'veg' : 'non-veg');
    if (dietaryFilter === 'veg') {
      matchesDietary = itemDietary === 'veg' || itemDietary === 'vegan';
    } else if (dietaryFilter === 'vegan') {
      matchesDietary = itemDietary === 'vegan';
    } else if (dietaryFilter === 'non-veg') {
      matchesDietary = itemDietary === 'non-veg';
    }

    return matchesCategory && matchesSearch && matchesDietary;
  });

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Menu Catalog & Categories
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Organize dishes into sections, manage pricing, availability, and food images
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCategoryModalOpen(true)}
            className="text-xs gap-1.5"
          >
            <FolderPlus className="w-4 h-4" />
            <span>New Category</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingItem(null);
              setIsItemModalOpen(true);
            }}
            className="text-xs gap-1.5 font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Add Menu Item</span>
          </Button>
        </div>
      </div>

      {/* Categories Horizontal Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-zinc-200/80 dark:border-zinc-800">
        <button
          onClick={() => setSelectedCategoryId('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
            selectedCategoryId === 'all'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
              : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50'
          }`}
        >
          <span>All Dishes</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            selectedCategoryId === 'all'
              ? 'bg-zinc-700 text-zinc-100 dark:bg-zinc-300 dark:text-zinc-900'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
          }`}>
            {menuItems.length}
          </span>
        </button>

        {categories.map((cat) => {
          const count = menuItems.filter((i) => i.category_id === cat.id).length;
          const isSelected = selectedCategoryId === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                isSelected
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                  : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50'
              }`}
            >
              <span>{cat.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isSelected
                  ? 'bg-zinc-700 text-zinc-100 dark:bg-zinc-300 dark:text-zinc-900'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search menu items by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
          />
        </div>

        {/* Dietary Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          <button
            onClick={() => setDietaryFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              dietaryFilter === 'all'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50'
            }`}
          >
            All Diets
          </button>
          <button
            onClick={() => setDietaryFilter(dietaryFilter === 'veg' ? 'all' : 'veg')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              dietaryFilter === 'veg'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Veg</span>
          </button>
          <button
            onClick={() => setDietaryFilter(dietaryFilter === 'non-veg' ? 'all' : 'non-veg')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              dietaryFilter === 'non-veg'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Non-Veg</span>
          </button>
        </div>
      </div>

      {/* Menu Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-12 text-center shadow-card space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
            <Utensils className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            No Menu Items Found
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {searchTerm
              ? 'No dishes match your search query.'
              : 'Add your first menu item or create categories to build your digital QR menu.'}
          </p>
          {!searchTerm && (
            <div className="pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setEditingItem(null);
                  setIsItemModalOpen(true);
                }}
                className="text-xs gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Item</span>
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const catName = categoryMap.get(item.category_id) || 'Specialty';
            const dietary = item.dietary_type || (item.is_veg ? 'veg' : 'non-veg');

            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-zinc-900 border rounded-2xl p-4 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between space-y-3 ${
                  item.available
                    ? 'border-zinc-200/80 dark:border-zinc-800'
                    : 'border-zinc-200/60 dark:border-zinc-800/60 opacity-75 bg-zinc-50/50 dark:bg-zinc-900/50'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex gap-3 items-start justify-between">
                    <div className="w-16 h-16 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden relative shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                          <Utensils className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider truncate">
                          {catName}
                        </span>
                        {dietary === 'veg' && (
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" title="Vegetarian" />
                        )}
                        {dietary === 'vegan' && (
                          <span title="Vegan" className="inline-flex">
                            <Leaf className="w-3 h-3 text-emerald-600 shrink-0" />
                          </span>
                        )}
                        {dietary === 'non-veg' && (
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" title="Non-Vegetarian" />
                        )}
                      </div>

                      <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate mt-0.5">
                        {item.name}
                      </h3>

                      <span className="text-sm font-black text-zinc-900 dark:text-zinc-100 block font-mono mt-0.5">
                        ${Number(item.price).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {item.description && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleAvailability(item)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-colors ${
                      item.available
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'
                    }`}
                  >
                    {item.available ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>In Stock</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Sold Out</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setIsItemModalOpen(true);
                      }}
                      className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                      title="Edit Dish"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setItemToDelete(item)}
                      className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                      title="Delete Dish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <MenuItemModal
        isOpen={isItemModalOpen}
        restaurantId={restaurantId}
        categories={categories}
        itemToEdit={editingItem}
        onClose={() => {
          setIsItemModalOpen(false);
          setEditingItem(null);
        }}
        onItemSaved={handleItemSaved}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        restaurantId={restaurantId}
        categories={categories}
        onClose={() => setIsCategoryModalOpen(false)}
        onCategoryCreated={handleCategorySaved}
        onCategoryDeleted={handleCategorySaved}
      />

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-sm w-full shadow-elevated border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Delete Menu Item?
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Are you sure you want to permanently delete <strong>{itemToDelete.name}</strong> from your menu catalog?
              </p>
            </div>
            <div className="pt-2 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setItemToDelete(null)}
                className="flex-1 text-xs"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDeleteItem}
                isLoading={isDeleting}
                className="flex-1 text-xs bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
