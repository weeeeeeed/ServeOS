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
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { Category, MenuItem, DietaryType } from '@/lib/types';
import { MenuService } from '@/lib/menu-service';
import { formatCurrency } from '@/lib/currency';
import { MenuItemModal } from './menu-item-modal';
import { CategoryModal } from './category-modal';
import { BotanicalLeafBranch, HandwrittenNote } from '@/components/ui/botanical-decorations';

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
        updated.available ? 'Dish Available' : 'Marked Sold Out',
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
    } catch (err: any) {
      console.error('Failed to delete item:', err);
      toast.error('Delete Failed', err?.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesCat =
      selectedCategoryId === 'all' || item.category_id === selectedCategoryId;
    const matchesSearch =
      !searchTerm ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesDiet = true;
    if (dietaryFilter === 'veg') {
      matchesDiet = item.dietary_type === 'veg' || item.is_veg === true;
    } else if (dietaryFilter === 'vegan') {
      matchesDiet = item.dietary_type === 'vegan';
    } else if (dietaryFilter === 'non-veg') {
      matchesDiet = item.dietary_type === 'non-veg' || (!item.is_veg && item.dietary_type !== 'vegan');
    }

    return matchesCat && matchesSearch && matchesDiet;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6e2da]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-serif font-bold text-[#1b3b2f] tracking-tight">
              Culinary Menu Catalog
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#eef4f0] text-[#1b3b2f] border border-[#d2ded6]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3a7d5c]" />
              {menuItems.length} Dishes Live
            </span>
          </div>
          <p className="text-xs lg:text-[13px] text-[#556960] mt-1 font-sans">
            Manage seasonal dishes, botanical beverages, dietary symbols, and live pricing in INR
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-1.5 rounded-2xl text-xs font-semibold px-4 py-2 border-[#dcd7ce] text-[#1b3b2f]"
          >
            <FolderPlus className="w-4 h-4 text-[#3a7d5c]" />
            <span>Add Category</span>
          </Button>

          <Button
            onClick={() => {
              setEditingItem(null);
              setIsItemModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#1b3b2f] hover:bg-[#122820] text-[#f8faf7] font-semibold text-xs shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Dish</span>
          </Button>
        </div>
      </header>

      {/* Categories Horizontal Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#f4f1eb] text-xs font-semibold text-[#556960] overflow-x-auto">
        <button
          onClick={() => setSelectedCategoryId('all')}
          className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
            selectedCategoryId === 'all'
              ? 'bg-[#1b3b2f] text-white font-bold shadow-xs'
              : 'hover:text-[#1b3b2f] hover:bg-white/60'
          }`}
          type="button"
        >
          All Dishes ({menuItems.length})
        </button>

        {categories.map((c) => {
          const itemCount = menuItems.filter((i) => i.category_id === c.id).length;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCategoryId(c.id)}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                selectedCategoryId === c.id
                  ? 'bg-[#1b3b2f] text-white font-bold shadow-xs'
                  : 'hover:text-[#1b3b2f] hover:bg-white/60'
              }`}
              type="button"
            >
              <span>{c.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCategoryId === c.id ? 'bg-[#3a7d5c] text-white' : 'bg-[#e6e2da] text-[#556960]'
                }`}
              >
                {itemCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#85988e] pointer-events-none" />
          <input
            type="text"
            placeholder="Search dishes by name or ingredients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-2xl border border-[#dcd7ce] bg-white text-[#162820] placeholder-[#85988e] focus:outline-none focus:ring-2 focus:ring-[#3a7d5c] shadow-2xs"
          />
        </div>

        {/* Dietary Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto text-xs font-semibold">
          {[
            { id: 'all', label: 'All Diets' },
            { id: 'veg', label: '🌿 Veg Only' },
            { id: 'vegan', label: '🌱 100% Vegan' },
            { id: 'non-veg', label: '🥩 Non-Veg' },
          ].map((df) => (
            <button
              key={df.id}
              onClick={() => setDietaryFilter(df.id as any)}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                dietaryFilter === df.id
                  ? 'bg-[#eef4f0] text-[#1b3b2f] border border-[#d2ded6] font-bold'
                  : 'text-[#556960] hover:text-[#1b3b2f] bg-white/70 border border-[#e6e2da]'
              }`}
              type="button"
            >
              {df.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dishes Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white/90 rounded-3xl p-12 text-center border border-[#e6e2da] shadow-2xs space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-[#eef4f0] text-[#1b3b2f] flex items-center justify-center">
            <Utensils className="w-6 h-6 text-[#3a7d5c]" />
          </div>
          <h3 className="font-serif font-bold text-lg text-[#1b3b2f]">No Dishes Found</h3>
          <p className="text-xs text-[#556960] max-w-xs mx-auto">
            Try adjusting your search query or dietary filters, or click &quot;Add New Dish&quot; to expand your menu.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const isVeg = item.dietary_type === 'veg' || item.is_veg;
            const isVegan = item.dietary_type === 'vegan';

            return (
              <div
                key={item.id}
                className={`bg-white/95 rounded-3xl p-4 border transition-all duration-150 flex flex-col justify-between shadow-2xs hover:shadow-xs ${
                  !item.available ? 'opacity-70 border-dashed border-[#dcd7ce]' : 'border-[#e6e2da]'
                }`}
              >
                <div>
                  {/* Image / Fallback frame */}
                  <div className="relative h-36 rounded-2xl overflow-hidden bg-[#f4f1eb] mb-3 flex items-center justify-center border border-[#f0ede6]">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-[#85988e]">
                        <Utensils className="w-8 h-8 text-[#a9b9b0]" />
                        <span className="text-[10px] uppercase font-semibold tracking-wider">Artisan Plate</span>
                      </div>
                    )}

                    {/* Dietary badge overlay */}
                    <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-full border border-[#e6e2da] text-[10px] font-bold flex items-center gap-1">
                      {isVegan ? (
                        <>
                          <Leaf className="w-2.5 h-2.5 text-[#3a7d5c]" />
                          <span className="text-[#1b3b2f]">VEGAN</span>
                        </>
                      ) : isVeg ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-[#3a7d5c]" />
                          <span className="text-[#1b3b2f]">VEG</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-rose-600" />
                          <span className="text-rose-900">NON-VEG</span>
                        </>
                      )}
                    </div>

                    {!item.available && (
                      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-2xs flex items-center justify-center">
                        <span className="bg-white/95 text-[#b84232] font-bold text-xs px-3 py-1 rounded-full shadow-xs">
                          Sold Out Today
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Title & Price */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-serif font-bold text-base text-[#1b3b2f] leading-snug">
                      {item.name}
                    </h3>
                    <span className="font-serif font-bold text-base text-[#1b3b2f] shrink-0">
                      {formatCurrency(item.price)}
                    </span>
                  </div>

                  <p className="text-xs text-[#556960] mt-1 line-clamp-2 leading-relaxed">
                    {item.description || 'Crafted fresh daily with locally sourced organic ingredients.'}
                  </p>
                </div>

                {/* Bottom Item Controls */}
                <div className="mt-4 pt-3 border-t border-[#f0ede6] flex items-center justify-between">
                  <button
                    onClick={() => handleToggleAvailability(item)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl border transition-colors flex items-center gap-1.5 ${
                      item.available
                        ? 'bg-[#eef4f0] text-[#1b3b2f] border-[#cbe0d3] hover:bg-[#dbe8e0]'
                        : 'bg-[#f4f1eb] text-[#85988e] border-[#e6e2da] hover:bg-white'
                    }`}
                    type="button"
                  >
                    {item.available ? <Eye className="w-3 h-3 text-[#3a7d5c]" /> : <EyeOff className="w-3 h-3 text-[#85988e]" />}
                    <span>{item.available ? 'In Stock' : 'Sold Out'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setIsItemModalOpen(true);
                      }}
                      className="p-1.5 rounded-xl hover:bg-[#eef4f0] text-[#556960] hover:text-[#1b3b2f] transition-colors"
                      title="Edit Dish"
                      type="button"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setItemToDelete(item)}
                      className="p-1.5 rounded-xl hover:bg-rose-50 text-[#85988e] hover:text-[#b84232] transition-colors"
                      title="Delete Dish"
                      type="button"
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
      {isItemModalOpen && (
        <MenuItemModal
          restaurantId={restaurantId}
          categories={categories}
          itemToEdit={editingItem}
          isOpen={isItemModalOpen}
          onClose={() => setIsItemModalOpen(false)}
          onItemSaved={() => {
            loadData();
            if (onStatsChange) onStatsChange();
          }}
        />
      )}

      {isCategoryModalOpen && (
        <CategoryModal
          restaurantId={restaurantId}
          categories={categories}
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          onCategoryCreated={() => {
            loadData();
            if (onStatsChange) onStatsChange();
          }}
          onCategoryDeleted={() => {
            loadData();
            if (onStatsChange) onStatsChange();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-[#faf8f5] rounded-3xl p-6 max-w-sm w-full border border-[#e6e2da] shadow-xl">
            <h3 className="font-serif font-bold text-lg text-[#1b3b2f]">Remove Dish?</h3>
            <p className="text-xs text-[#556960] mt-1">
              Are you sure you want to remove &quot;{itemToDelete.name}&quot; from the menu? This cannot be undone.
            </p>
            <div className="flex gap-2 mt-5 justify-end">
              <Button
                variant="outline"
                className="rounded-xl text-xs"
                onClick={() => setItemToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                disabled={isDeleting}
                className="bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-semibold"
                onClick={handleDeleteItem}
              >
                {isDeleting ? 'Removing...' : 'Delete Dish'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
