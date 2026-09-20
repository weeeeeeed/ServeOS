'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  DollarSign,
  Utensils,
  AlertCircle,
  Check,
  Sparkles,
  Leaf,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Category, MenuItem, DietaryType } from '@/lib/types';
import { MenuService } from '@/lib/menu-service';
import { CURRENCY_SYMBOL, CURRENCY_CODE } from '@/lib/currency';

interface MenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId: string;
  categories: Category[];
  itemToEdit?: MenuItem | null;
  onItemSaved: (item: MenuItem) => void;
}

const FOOD_PRESETS = [
  { name: 'Pizza', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80' },
  { name: 'Pasta', url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&auto=format&fit=crop&q=80' },
  { name: 'Burger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80' },
  { name: 'Salad', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=80' },
  { name: 'Sushi', url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&auto=format&fit=crop&q=80' },
  { name: 'Dessert', url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format&fit=crop&q=80' },
  { name: 'Cocktail/Drink', url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=500&auto=format&fit=crop&q=80' },
];

export function MenuItemModal({
  isOpen,
  onClose,
  restaurantId,
  categories,
  itemToEdit,
  onItemSaved,
}: MenuItemModalProps) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [available, setAvailable] = useState(true);
  const [dietaryType, setDietaryType] = useState<DietaryType>('veg');

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name);
      setCategoryId(itemToEdit.category_id);
      setPrice(itemToEdit.price.toString());
      setDescription(itemToEdit.description || '');
      setImage(itemToEdit.image || '');
      setAvailable(itemToEdit.available);
      setDietaryType(itemToEdit.dietary_type || (itemToEdit.is_veg ? 'veg' : 'non-veg'));
    } else {
      setName('');
      setCategoryId(categories[0]?.id || '');
      setPrice('');
      setDescription('');
      setImage(FOOD_PRESETS[0].url);
      setAvailable(true);
      setDietaryType('veg');
    }
    setError(null);
  }, [itemToEdit, categories, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const uploadedUrl = await MenuService.uploadImage(file, 'menu-items');
      setImage(uploadedUrl);
    } catch (err: any) {
      setError(err?.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Item name is required');
      return;
    }
    if (!categoryId) {
      setError('Please select a category (or create one first)');
      return;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setError('Please enter a valid price (e.g. 14.50)');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (itemToEdit) {
        const updated = await MenuService.updateMenuItem(
          itemToEdit.id,
          {
            name: name.trim(),
            category_id: categoryId,
            price: numPrice,
            description: description.trim(),
            image: image || null,
            available,
            dietary_type: dietaryType,
            is_veg: dietaryType === 'veg' || dietaryType === 'vegan',
          },
          restaurantId
        );
        onItemSaved(updated);
      } else {
        const created = await MenuService.createMenuItem({
          restaurant_id: restaurantId,
          category_id: categoryId,
          name: name.trim(),
          price: numPrice,
          description: description.trim(),
          image: image || null,
          available,
          dietary_type: dietaryType,
          is_veg: dietaryType === 'veg' || dietaryType === 'vegan',
        });
        onItemSaved(created);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save menu item');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-elevated overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {itemToEdit ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
              <p className="text-xs text-zinc-500">
                {itemToEdit ? 'Update dish details, price, or photo' : 'Add a delicious new dish to your digital menu'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Dish / Item Name *"
              placeholder="e.g. Truffle Gnocchi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                required
              >
                {categories.length === 0 ? (
                  <option value="">No categories yet (Create one first)</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label={`Price (${CURRENCY_CODE} ${CURRENCY_SYMBOL}) *`}
              type="number"
              step="1"
              min="0"
              placeholder="350"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              leftIcon={<span className="font-bold text-xs">{CURRENCY_SYMBOL}</span>}
              required
            />

            {/* Dietary Type Selector */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Dietary Indicator
              </label>
              <select
                value={dietaryType}
                onChange={(e) => setDietaryType(e.target.value as DietaryType)}
                className="w-full h-10 px-3 py-2 text-xs bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 font-medium"
              >
                <option value="veg">🟢 Vegetarian (Veg)</option>
                <option value="non-veg">🔴 Non-Vegetarian (Non-Veg)</option>
                <option value="vegan">🌱 100% Vegan</option>
              </select>
            </div>

            {/* Availability Toggle */}
            <div className="flex flex-col justify-end">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Availability Status
              </label>
              <label className="flex items-center gap-2 h-10 px-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={available}
                  onChange={(e) => setAvailable(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 rounded-sm"
                />
                <span className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                  {available ? '🟢 In Stock' : '🔴 Sold Out'}
                </span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Dish Description & Ingredients
            </label>
            <textarea
              rows={2}
              placeholder="Fresh homemade potato gnocchi with creamy black truffle sauce and shaved parmesan..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>

          {/* Image Upload & Presets */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Dish Photo (Upload or Preset)
            </label>

            <div className="flex items-start gap-4">
              {/* Preview Thumbnail */}
              <div className="w-20 h-20 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden flex items-center justify-center shrink-0">
                {image ? (
                  <img src={image} alt="Dish preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-zinc-400" />
                )}
              </div>

              {/* Upload Action & URL */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    isLoading={isUploading}
                    className="text-xs"
                  >
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    Upload Image
                  </Button>
                  <span className="text-[11px] text-zinc-400">
                    PNG, JPG, WebP
                  </span>
                </div>

                <Input
                  placeholder="Or paste direct image URL"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="text-xs h-8"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="mt-3">
              <span className="text-[11px] text-zinc-500 font-medium">Quick Food Presets:</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {FOOD_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setImage(preset.url)}
                    className={`text-[11px] px-2 py-0.5 rounded-full border transition-all ${
                      image === preset.url
                        ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 font-semibold'
                        : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isLoading} className="gap-1.5">
              <span>{itemToEdit ? 'Update Item' : 'Add Item'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
