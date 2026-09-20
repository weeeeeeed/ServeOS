'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Check,
  X,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Power,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SubscriptionPlanEntity } from '@/lib/types';
import { SubscriptionPlanService } from '@/lib/subscription-plan-service';
import { formatCurrency, CURRENCY_SYMBOL } from '@/lib/currency';
import { useToast } from '@/components/ui/toast';

export function PlanManagement() {
  const { success, error, warning } = useToast();

  const [plans, setPlans] = useState<SubscriptionPlanEntity[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlanEntity | null>(null);
  const [previewPlan, setPreviewPlan] = useState<SubscriptionPlanEntity | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<SubscriptionPlanEntity | null>(null);

  // Form Fields State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [priceMonthly, setPriceMonthly] = useState<number>(199);
  const [priceYearly, setPriceYearly] = useState<number>(1999);
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState('');
  const [maxRestaurants, setMaxRestaurants] = useState<number>(1);
  const [maxQrCodes, setMaxQrCodes] = useState<number>(12);
  const [maxOrders, setMaxOrders] = useState<number>(1000);
  const [maxStaff, setMaxStaff] = useState<number>(3);
  const [marketingEnabled, setMarketingEnabled] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const loadPlans = async () => {
    try {
      const data = await SubscriptionPlanService.getPlans(true);
      setPlans(data);
    } catch (err) {
      console.error('Failed to load plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();

    const handleUpdated = () => loadPlans();
    window.addEventListener('qr_plans_updated', handleUpdated);
    return () => window.removeEventListener('qr_plans_updated', handleUpdated);
  }, []);

  const openCreateModal = () => {
    setEditingPlan(null);
    setName('');
    setSlug('');
    setDescription('');
    setPriceMonthly(299);
    setPriceYearly(2999);
    setFeatures([
      'Up to 20 table QR codes',
      'Instant KDS Kitchen Flow',
      'Digital Customer Menu',
      'Basic Sales Analytics',
    ]);
    setFeatureInput('');
    setMaxRestaurants(1);
    setMaxQrCodes(20);
    setMaxOrders(2500);
    setMaxStaff(5);
    setMarketingEnabled(false);
    setAiEnabled(false);
    setAnalyticsEnabled(true);
    setIsFeatured(false);
    setIsActive(true);
    setIsFormOpen(true);
  };

  const openEditModal = (plan: SubscriptionPlanEntity) => {
    setEditingPlan(plan);
    setName(plan.name);
    setSlug(plan.slug);
    setDescription(plan.description);
    setPriceMonthly(plan.price_monthly);
    setPriceYearly(plan.price_yearly);
    setFeatures([...plan.features]);
    setFeatureInput('');
    setMaxRestaurants(plan.max_restaurants);
    setMaxQrCodes(plan.max_qr_codes);
    setMaxOrders(plan.max_orders);
    setMaxStaff(plan.max_staff);
    setMarketingEnabled(plan.marketing_enabled);
    setAiEnabled(plan.ai_enabled);
    setAnalyticsEnabled(plan.analytics_enabled);
    setIsFeatured(plan.is_featured);
    setIsActive(plan.is_active);
    setIsFormOpen(true);
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFeatures([...features, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (idx: number) => {
    setFeatures(features.filter((_, i) => i !== idx));
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error('Plan name required', 'Please provide a plan name.');
      return;
    }
    const computedSlug = slug.trim() || name.toLowerCase().replace(/[^a-z0-9]/g, '-');

    try {
      if (editingPlan) {
        await SubscriptionPlanService.updatePlan(editingPlan.id, {
          name: name.trim(),
          slug: computedSlug,
          description: description.trim(),
          price_monthly: Number(priceMonthly),
          price_yearly: Number(priceYearly),
          features,
          max_restaurants: Number(maxRestaurants),
          max_qr_codes: Number(maxQrCodes),
          max_orders: Number(maxOrders),
          max_staff: Number(maxStaff),
          marketing_enabled: marketingEnabled,
          ai_enabled: aiEnabled,
          analytics_enabled: analyticsEnabled,
          is_featured: isFeatured,
          is_active: isActive,
        });
        success('Plan Updated', `${name} pricing & limits updated successfully.`);
      } else {
        await SubscriptionPlanService.createPlan({
          name: name.trim(),
          slug: computedSlug,
          description: description.trim(),
          price_monthly: Number(priceMonthly),
          price_yearly: Number(priceYearly),
          features,
          max_restaurants: Number(maxRestaurants),
          max_qr_codes: Number(maxQrCodes),
          max_orders: Number(maxOrders),
          max_staff: Number(maxStaff),
          marketing_enabled: marketingEnabled,
          ai_enabled: aiEnabled,
          analytics_enabled: analyticsEnabled,
          is_featured: isFeatured,
          is_active: isActive,
          sort_order: plans.length + 1,
        });
        success('Plan Created', `New plan ${name} added to catalog.`);
      }

      setIsFormOpen(false);
      await loadPlans();
    } catch (err: any) {
      error('Save Failed', err?.message || 'Could not save subscription plan.');
    }
  };

  const handleToggleStatus = async (plan: SubscriptionPlanEntity) => {
    try {
      const next = !plan.is_active;
      await SubscriptionPlanService.togglePlanStatus(plan.id, next);
      success('Status Changed', `${plan.name} is now ${next ? 'Active' : 'Disabled'}.`);
      await loadPlans();
    } catch (err: any) {
      error('Toggle Failed', err?.message);
    }
  };

  const handleDelete = async () => {
    if (!deletingPlan) return;
    try {
      await SubscriptionPlanService.deletePlan(deletingPlan.id);
      success('Plan Deleted', `${deletingPlan.name} has been removed from catalog.`);
      setDeletingPlan(null);
      await loadPlans();
    } catch (err: any) {
      error('Delete Failed', err?.message);
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= plans.length) return;

    const newPlans = [...plans];
    const [moved] = newPlans.splice(index, 1);
    newPlans.splice(targetIdx, 0, moved);

    const orderedIds = newPlans.map((p) => p.id);
    await SubscriptionPlanService.reorderPlans(orderedIds);
    setPlans(newPlans);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-stone-900">
              Subscription Plans Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
              {CURRENCY_SYMBOL} INR Pricing
            </span>
          </div>
          <p className="text-sm text-stone-500 mt-1">
            Configure pricing tiers, features, and quotas. Changes immediately reflect on the public pricing page.
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          className="rounded-2xl bg-[#1f4e47] hover:bg-[#183e38] text-white font-bold text-xs gap-2 shadow-sm h-11 px-5"
        >
          <Plus className="w-4 h-4 text-[#efa736]" />
          <span>Create New Plan</span>
        </Button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <div
            key={plan.id}
            className={`rounded-[28px] bg-white border p-6 flex flex-col justify-between transition-all relative ${
              plan.is_featured
                ? 'border-2 border-[#1f4e47] shadow-lg'
                : 'border-stone-200 shadow-xs hover:border-stone-300'
            } ${!plan.is_active ? 'opacity-70 bg-stone-50/60' : ''}`}
          >
            {/* Featured Badge */}
            {plan.is_featured && (
              <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-[#1f4e47] text-[#efa736] text-[10px] font-black uppercase tracking-wider shadow-xs">
                FEATURED PLAN
              </div>
            )}

            <div>
              {/* Top Controls: Reorder & Status Toggle */}
              <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-stone-100">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Position #{index + 1}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveOrder(index, 'up')}
                      className="p-1 rounded text-stone-400 hover:text-stone-800 disabled:opacity-30"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === plans.length - 1}
                      onClick={() => handleMoveOrder(index, 'down')}
                      className="p-1 rounded text-stone-400 hover:text-stone-800 disabled:opacity-30"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(plan)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                      plan.is_active
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        plan.is_active ? 'bg-emerald-600' : 'bg-stone-400'
                      }`}
                    />
                    {plan.is_active ? 'Active' : 'Disabled'}
                  </button>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-xl font-bold text-stone-900">{plan.name}</h3>
              <p className="text-xs text-stone-500 mt-1 min-h-[32px] line-clamp-2">
                {plan.description}
              </p>

              {/* Price Display in INR */}
              <div className="mt-4 pt-4 border-t border-stone-100 flex items-baseline gap-1">
                <span className="text-3xl font-black text-stone-900">
                  {formatCurrency(plan.price_monthly)}
                </span>
                <span className="text-xs text-stone-500 font-medium">/month</span>
                <span className="text-[11px] text-stone-400 ml-2">
                  ({formatCurrency(plan.price_yearly)}/yr)
                </span>
              </div>

              {/* Quotas Breakdown */}
              <div className="mt-4 p-3 rounded-2xl bg-stone-50 border border-stone-100 text-[11px] text-stone-600 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">QR Terminals</span>
                  <span className="font-bold text-stone-900">{plan.max_qr_codes} Tables</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Monthly Orders</span>
                  <span className="font-bold text-stone-900">{plan.max_orders.toLocaleString()} Max</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Staff Logins</span>
                  <span className="font-bold text-stone-900">{plan.max_staff} Members</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Marketing Push</span>
                  <span className={`font-bold ${plan.marketing_enabled ? 'text-emerald-700' : 'text-stone-400'}`}>
                    {plan.marketing_enabled ? 'Enabled' : 'No'}
                  </span>
                </div>
              </div>

              {/* Features List */}
              <ul className="mt-5 space-y-2 text-xs text-stone-600">
                {plan.features.slice(0, 5).map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#1f4e47] shrink-0" />
                    <span className="truncate">{f}</span>
                  </li>
                ))}
                {plan.features.length > 5 && (
                  <li className="text-[11px] text-stone-400 pl-5">
                    +{plan.features.length - 5} more features
                  </li>
                )}
              </ul>
            </div>

            {/* Actions Card Footer */}
            <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewPlan(plan)}
                className="text-xs font-bold text-stone-600 hover:text-stone-900 gap-1 rounded-xl"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </Button>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(plan)}
                  className="text-xs font-bold text-stone-700 hover:bg-stone-100 rounded-xl gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </Button>

                <button
                  type="button"
                  onClick={() => setDeletingPlan(plan)}
                  className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Delete Plan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: CREATE / EDIT PLAN */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-stone-200 space-y-6 animate-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-stone-900">
                  {editingPlan ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Define pricing in Indian Rupees ({CURRENCY_SYMBOL}), feature limits, and public visibility
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Plan Name */}
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Plan Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Pro Hospitality"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Plan Slug */}
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Identifier Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. pro-hospitality"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Target audience & primary value proposition..."
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              {/* Pricing in INR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                <div>
                  <label className="text-xs font-bold text-amber-900 block mb-1">
                    Monthly Price ({CURRENCY_SYMBOL} INR) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-stone-500 font-bold text-sm">
                      {CURRENCY_SYMBOL}
                    </span>
                    <input
                      type="number"
                      required
                      min={0}
                      step={1}
                      value={priceMonthly}
                      onChange={(e) => setPriceMonthly(Number(e.target.value))}
                      className="w-full pl-8 pr-3.5 py-2 rounded-xl bg-white border border-stone-200 text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-amber-900 block mb-1">
                    Yearly Price ({CURRENCY_SYMBOL} INR) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-stone-500 font-bold text-sm">
                      {CURRENCY_SYMBOL}
                    </span>
                    <input
                      type="number"
                      required
                      min={0}
                      step={1}
                      value={priceYearly}
                      onChange={(e) => setPriceYearly(Number(e.target.value))}
                      className="w-full pl-8 pr-3.5 py-2 rounded-xl bg-white border border-stone-200 text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Feature Quotas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">
                    Max Outlets
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={maxRestaurants}
                    onChange={(e) => setMaxRestaurants(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">
                    Max QR Tables
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={maxQrCodes}
                    onChange={(e) => setMaxQrCodes(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">
                    Max Orders/mo
                  </label>
                  <input
                    type="number"
                    min={100}
                    value={maxOrders}
                    onChange={(e) => setMaxOrders(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">
                    Staff Seats
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={maxStaff}
                    onChange={(e) => setMaxStaff(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-stone-100">
                <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer p-2 rounded-xl bg-stone-50 hover:bg-stone-100">
                  <input
                    type="checkbox"
                    checked={marketingEnabled}
                    onChange={(e) => setMarketingEnabled(e.target.checked)}
                    className="rounded text-[#1f4e47]"
                  />
                  <span>Marketing Push</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer p-2 rounded-xl bg-stone-50 hover:bg-stone-100">
                  <input
                    type="checkbox"
                    checked={aiEnabled}
                    onChange={(e) => setAiEnabled(e.target.checked)}
                    className="rounded text-[#1f4e47]"
                  />
                  <span>AI Features</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer p-2 rounded-xl bg-stone-50 hover:bg-stone-100">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-[#1f4e47]"
                  />
                  <span>Featured Plan</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer p-2 rounded-xl bg-stone-50 hover:bg-stone-100">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-[#1f4e47]"
                  />
                  <span>Active (Live)</span>
                </label>
              </div>

              {/* Feature Bullet Points */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <label className="text-xs font-bold text-stone-700 block">
                  Included Feature Bullet Points
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    placeholder="e.g. 24/7 Priority Floor Support"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddFeature}
                    className="text-xs font-bold rounded-xl"
                  >
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-stone-100 text-stone-800 text-xs font-medium"
                    >
                      <span>{feat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-stone-400 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-xl font-bold text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl bg-[#1f4e47] hover:bg-[#183e38] text-white font-bold text-xs px-6"
                >
                  {editingPlan ? 'Save Changes' : 'Create Plan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PREVIEW PLAN (MATCHING PUBLIC PRICING) */}
      {previewPlan && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl border border-stone-200 space-y-6 animate-in zoom-in-95 duration-200 relative">
            <button
              type="button"
              onClick={() => setPreviewPlan(null)}
              className="absolute top-4 right-4 p-1 text-stone-400 hover:text-stone-700 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                Public Card Preview
              </span>
              <h3 className="text-2xl font-serif font-bold text-stone-900 mt-2">
                {previewPlan.name}
              </h3>
              <p className="text-xs text-stone-500 mt-1">{previewPlan.description}</p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-serif font-bold text-[#1f4e47]">
                  {formatCurrency(previewPlan.price_monthly)}
                </span>
                <span className="text-xs text-stone-500">/month billed annually</span>
              </div>

              <ul className="mt-6 space-y-2.5 text-xs text-stone-700">
                {previewPlan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-6 border-t border-stone-100">
                <Button className="w-full rounded-xl bg-[#efa736] hover:bg-[#e09827] text-stone-950 text-xs font-bold py-2.5">
                  Subscribe for {formatCurrency(previewPlan.price_monthly)}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deletingPlan && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-stone-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-stone-900">Delete Plan?</h3>
              <p className="text-xs text-stone-500 mt-1">
                Are you sure you want to remove <strong>{deletingPlan.name}</strong>? Existing subscribed restaurants will continue their current billing cycle.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setDeletingPlan(null)}
                className="flex-1 rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                Yes, Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
