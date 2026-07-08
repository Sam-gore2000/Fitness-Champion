import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Camera, Barcode, Trash2, Droplets, Sparkles, Pencil } from 'lucide-react';
import { nutritionApi } from '@/api/nutritionApi';
import { aiApi } from '@/api/aiApi';
import GlassCard from '@/components/ui/GlassCard';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import type { Meal } from '@/types';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

const EMPTY_FORM = {
  name: '', mealType: 'lunch' as typeof MEAL_TYPES[number], quantityG: 100,
  calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0,
};

export default function Nutrition() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState<'manual' | 'image' | 'barcode' | 'voice' | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [analyzed, setAnalyzed] = useState(false); // has AI filled in the macros yet?
  const [manualOverride, setManualOverride] = useState(false); // user opted to type macros themselves
  const [analyzing, setAnalyzing] = useState(false);
  const [imageDesc, setImageDesc] = useState('');
  const [scanning, setScanning] = useState(false);

  const { data: mealsData } = useQuery({ queryKey: ['meals'], queryFn: () => nutritionApi.getMeals() });
  const meals = mealsData?.data.meals || [];

  const resetModal = () => {
    setModalOpen(null);
    setForm(EMPTY_FORM);
    setAnalyzed(false);
    setManualOverride(false);
  };

  const logMealMutation = useMutation({
    mutationFn: nutritionApi.logMeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      queryClient.invalidateQueries({ queryKey: ['daily-log'] });
      toast.success('Meal logged');
      resetModal();
    },
    onError: () => toast.error('Could not log meal'),
  });

  const deleteMealMutation = useMutation({
    mutationFn: nutritionApi.deleteMeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      queryClient.invalidateQueries({ queryKey: ['daily-log'] });
      toast.success('Removed');
    },
  });

  const logWaterMutation = useMutation({
    mutationFn: nutritionApi.logWater,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-log'] });
      toast.success('Water logged');
    },
  });

  // Core feature: user only types a food name + quantity, AI fills in the macros.
  const handleAnalyze = async () => {
    if (!form.name.trim() || !form.quantityG) {
      toast.error('Enter a food name and quantity first');
      return;
    }
    setAnalyzing(true);
    try {
      const { data } = await aiApi.estimateNutrition(form.name, form.quantityG);
      setForm((f) => ({ ...f, ...data.nutrition }));
      setAnalyzed(true);
      toast.success('Nutrition estimated — review and log it');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not estimate nutrition, try rewording the food name');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleImageRecognition = async () => {
    setScanning(true);
    try {
      const { data } = await aiApi.recognizeMeal({ description: imageDesc });
      const totals = data.result as any;
      if (totals?.totalCalories) {
        setForm({
          name: (totals.items?.map((i: any) => i.name).join(', ')) || 'AI-recognized meal',
          mealType: 'lunch',
          quantityG: 100,
          calories: totals.totalCalories,
          protein: totals.totalProtein,
          carbs: totals.totalCarbs,
          fat: totals.totalFat,
          fiber: 0,
          sugar: 0,
        });
        setAnalyzed(true);
        toast.success('AI identified your meal — review and log it');
        setModalOpen('manual');
      } else {
        toast.error('Could not identify the meal, try describing it differently');
      }
    } catch {
      toast.error('AI meal recognition failed');
    } finally {
      setScanning(false);
    }
  };

  const grouped = MEAL_TYPES.map((type) => ({
    type,
    items: meals.filter((m) => m.mealType === type),
  }));

  const showMacroFields = analyzed || manualOverride;
  const canLog = showMacroFields && form.name.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-display font-bold text-slate-800 dark:text-slate-100">Today's Nutrition</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setModalOpen('manual')}><Plus size={16} /> Add food</Button>
          <Button variant="secondary" onClick={() => setModalOpen('image')}><Camera size={16} /> Scan meal</Button>
          <Button variant="secondary" onClick={() => setModalOpen('barcode')}><Barcode size={16} /> Barcode</Button>
          <Button variant="secondary" onClick={() => logWaterMutation.mutate(250)}><Droplets size={16} /> +250ml water</Button>
        </div>
      </div>

      {meals.length === 0 && (
        <GlassCard>
          <EmptyState
            icon={<Plus size={22} />}
            title="No meals logged yet today"
            description="Add a food manually, scan a barcode, snap a photo, or use voice logging to get started."
            action={<Button onClick={() => setModalOpen('manual')}>Log your first meal</Button>}
          />
        </GlassCard>
      )}

      {meals.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {grouped.map(({ type, items }) => items.length > 0 && (
            <GlassCard key={type}>
              <h3 className="font-display font-bold capitalize text-slate-800 dark:text-slate-100 mb-3">{type}</h3>
              <div className="space-y-2">
                {items.map((m: Meal) => (
                  <div key={m._id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{m.name}</p>
                      <p className="text-xs text-slate-400">{m.calories} kcal &middot; P{m.protein}g C{m.carbs}g F{m.fat}g</p>
                    </div>
                    <button onClick={() => deleteMealMutation.mutate(m._id)} className="p-2 text-slate-400 hover:text-danger-500 rounded-xl hover:bg-danger-50 dark:hover:bg-danger-500/10">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Log a meal: user types food + quantity, AI fills in the macros */}
      <Modal open={modalOpen === 'manual'} onClose={resetModal} title="Log a meal">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            logMealMutation.mutate({ ...form, source: manualOverride ? 'manual' : 'search' });
          }}
          className="space-y-3"
        >
          <input
            required
            placeholder="Food name (e.g. Grilled chicken breast)"
            className="input-field"
            value={form.name}
            onChange={(e) => { setForm({ ...form, name: e.target.value }); setAnalyzed(false); }}
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Quantity (g)"
              className="input-field"
              value={form.quantityG || ''}
              onChange={(e) => { setForm({ ...form, quantityG: Number(e.target.value) }); setAnalyzed(false); }}
            />
            <select className="input-field" value={form.mealType} onChange={(e) => setForm({ ...form, mealType: e.target.value as any })}>
              {MEAL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {!showMacroFields && (
            <Button type="button" onClick={handleAnalyze} loading={analyzing} className="w-full">
              <Sparkles size={16} /> Analyze with AI
            </Button>
          )}

          {showMacroFields && (
            <div className="space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <p className="label-text mb-0">
                  {manualOverride ? 'Enter macros manually' : 'AI estimate — adjust if needed'}
                </p>
                {analyzed && !manualOverride && (
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    className="text-xs text-brand-600 dark:text-brand-400 font-medium hover:underline"
                  >
                    Re-analyze
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Calories" className="input-field" value={form.calories || ''} onChange={(e) => setForm({ ...form, calories: Number(e.target.value) })} />
                <input type="number" placeholder="Protein (g)" className="input-field" value={form.protein || ''} onChange={(e) => setForm({ ...form, protein: Number(e.target.value) })} />
                <input type="number" placeholder="Carbs (g)" className="input-field" value={form.carbs || ''} onChange={(e) => setForm({ ...form, carbs: Number(e.target.value) })} />
                <input type="number" placeholder="Fat (g)" className="input-field" value={form.fat || ''} onChange={(e) => setForm({ ...form, fat: Number(e.target.value) })} />
              </div>
            </div>
          )}

          {!manualOverride && (
            <button
              type="button"
              onClick={() => { setManualOverride(true); setAnalyzed(false); }}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1"
            >
              <Pencil size={12} /> Enter macros manually instead
            </button>
          )}

          <Button type="submit" loading={logMealMutation.isPending} disabled={!canLog} className="w-full">
            Log meal
          </Button>
        </form>
      </Modal>

      <Modal open={modalOpen === 'image'} onClose={() => setModalOpen(null)} title="AI meal recognition">
        <div className="space-y-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Upload wiring connects to Cloudinary; for now, describe the meal and the AI vision model backend will estimate macros
            (or pass an image URL once upload is wired up).
          </p>
          <textarea
            className="input-field min-h-[80px]"
            placeholder="e.g. grilled chicken breast with a cup of rice and steamed broccoli"
            value={imageDesc}
            onChange={(e) => setImageDesc(e.target.value)}
          />
          <Button onClick={handleImageRecognition} loading={scanning} className="w-full"><Camera size={16} /> Identify meal</Button>
        </div>
      </Modal>

      <Modal open={modalOpen === 'barcode'} onClose={() => setModalOpen(null)} title="Scan barcode">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Barcode scanning uses the device camera (via a library like <code>react-qr-barcode-scanner</code>) to read a UPC,
          then looks it up against <code>/api/nutrition/foods/search</code>. Wire up the camera component here — the backend
          endpoint already supports barcode-sourced entries via <code>source: "barcode"</code>.
        </p>
      </Modal>
    </div>
  );
}
