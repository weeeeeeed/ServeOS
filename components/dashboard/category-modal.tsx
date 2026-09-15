'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2, Tag, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Category } from '@/lib/types';
import { MenuService } from '@/lib/menu-service';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId: string;
  categories: Category[];
  onCategoryCreated: (newCat: Category) => void;
  onCategoryDeleted: (catId: string) => void;
}

export function CategoryModal({
  isOpen,
  onClose,
  restaurantId,
  categories,
  onCategoryCreated,
  onCategoryDeleted,
}: CategoryModalProps) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const created = await MenuService.createCategory(restaurantId, name.trim());
      onCategoryCreated(created);
      setName('');
    } catch (err: any) {
      setError(err?.message || 'Failed to create category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (catId: string) => {
    setDeletingId(catId);
    try {
      await MenuService.deleteCategory(catId, restaurantId);
      onCategoryDeleted(catId);
    } catch (err: any) {
      setError(err?.message || 'Failed to delete category');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-elevated overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Manage Menu Categories
              </h2>
              <p className="text-xs text-zinc-500">
                Organize your dishes for easy guest browsing
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
        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Add Category Form */}
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                label="New Category Name"
                placeholder="e.g. Chef's Specials, Mocktails..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <Button
              type="submit"
              size="md"
              isLoading={isLoading}
              className="gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </Button>
          </form>

          {/* Existing Categories List */}
          <div className="pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
              Existing Categories ({categories.length})
            </h3>

            {categories.length === 0 ? (
              <p className="text-xs text-zinc-400 py-4 text-center">
                No categories created yet. Add one above!
              </p>
            ) : (
              <div className="max-h-48 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-3 text-xs text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  >
                    <span className="font-medium">{cat.name}</span>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat.id)}
                      disabled={deletingId === cat.id}
                      className="text-zinc-400 hover:text-red-500 transition-colors p-1 rounded"
                      title="Delete Category"
                    >
                      {deletingId === cat.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-950/60 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
