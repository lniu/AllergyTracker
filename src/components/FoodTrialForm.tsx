import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/Button';
import { Checkbox } from './ui/Checkbox';
import { useAllergyStore } from '../stores/allergyStore';
import type { FoodTrial } from '../types';

interface FoodTrialFormProps {
  onSuccess?: () => void;
  preselectedAllergenId?: string;
}

export function FoodTrialForm({ onSuccess, preselectedAllergenId }: FoodTrialFormProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { allergens, addFoodTrial, getParentAllergens, getSubItems, getParentForSubItem } = useAllergyStore();
  
  const [foodName, setFoodName] = useState('');
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(
    preselectedAllergenId ? [preselectedAllergenId] : []
  );
  const [expandedParents, setExpandedParents] = useState<string[]>(() => {
    // Auto-expand parent of preselected allergen
    if (preselectedAllergenId) {
      const parent = allergens.find(a => a.id === preselectedAllergenId)?.parentId;
      if (parent) return [parent];
      // If preselected is a parent with sub-items, expand it
      const subItems = allergens.filter(a => a.parentId === preselectedAllergenId);
      if (subItems.length > 0) return [preselectedAllergenId];
    }
    return [];
  });
  const [date, setDate] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  });
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parentAllergens = getParentAllergens();

  const handleAllergenToggle = useCallback((allergenId: string) => {
    setSelectedAllergens((prev) =>
      prev.includes(allergenId)
        ? prev.filter((id) => id !== allergenId)
        : [...prev, allergenId]
    );
  }, []);

  const toggleParentExpanded = useCallback((parentId: string) => {
    setExpandedParents((prev) =>
      prev.includes(parentId)
        ? prev.filter((id) => id !== parentId)
        : [...prev, parentId]
    );
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim() || selectedAllergens.length === 0) return;

    setIsSubmitting(true);
    setError(null);
    
    try {
      const trial: FoodTrial = {
        id: crypto.randomUUID(),
        foodName: foodName.trim(),
        allergenIds: selectedAllergens,
        date: new Date(date).toISOString(),
        amount: amount.trim() || undefined,
        notes: notes.trim() || undefined,
        createdAt: new Date().toISOString(),
      };

      await addFoodTrial(trial);
      onSuccess?.();
      navigate('/');
    } catch (err) {
      console.error('Failed to save food trial:', err);
      setError(t('foodTrialForm.saveError'));
    } finally {
      setIsSubmitting(false);
    }
  }, [foodName, selectedAllergens, date, amount, notes, addFoodTrial, onSuccess, navigate, t]);

  // Get count of selected sub-items for a parent
  const getSelectedSubItemCount = useCallback((parentId: string) => {
    const subItems = getSubItems(parentId);
    return subItems.filter(sub => selectedAllergens.includes(sub.id)).length;
  }, [getSubItems, selectedAllergens]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Food Name */}
      <div>
        <label htmlFor="foodName" className="form-label">
          {t('foodTrialForm.foodName')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="foodName"
          value={foodName}
          onChange={(e) => setFoodName(e.target.value)}
          className="form-input"
          placeholder={t('foodTrialForm.foodNamePlaceholder')}
          required
          autoFocus
        />
      </div>

      {/* Allergen Selection */}
      <fieldset>
        <legend className="form-label mb-3">
          {t('foodTrialForm.allergensInFood')} <span className="text-red-500">*</span>
        </legend>
        <div className="space-y-2">
          {parentAllergens.map((parent) => {
            const subItems = getSubItems(parent.id);
            const hasSubItems = subItems.length > 0;
            const isExpanded = expandedParents.includes(parent.id);
            const selectedSubCount = getSelectedSubItemCount(parent.id);
            
            return (
              <div key={parent.id} className="border rounded-lg overflow-hidden">
                {/* Parent allergen row */}
                <div
                  className={`flex items-center gap-3 p-3 ${
                    hasSubItems ? 'cursor-pointer hover:bg-gray-50' : ''
                  } ${selectedSubCount > 0 ? 'bg-primary-50 border-primary-200' : 'bg-white'}`}
                  onClick={hasSubItems ? () => toggleParentExpanded(parent.id) : undefined}
                >
                  {hasSubItems ? (
                    <button
                      type="button"
                      className="p-0.5 -ml-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleParentExpanded(parent.id);
                      }}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  ) : (
                    <Checkbox
                      checked={selectedAllergens.includes(parent.id)}
                      onCheckedChange={() => handleAllergenToggle(parent.id)}
                      aria-describedby={`allergen-${parent.id}-label`}
                    />
                  )}
                  <span id={`allergen-${parent.id}-label`} className="flex items-center gap-2 flex-1">
                    {parent.icon && <span aria-hidden="true">{parent.icon}</span>}
                    <span className="text-sm font-medium">{parent.name}</span>
                    {hasSubItems && selectedSubCount > 0 && (
                      <span className="text-xs bg-primary-500 text-white px-2 py-0.5 rounded-full">
                        {selectedSubCount} {t('trial.selected')}
                      </span>
                    )}
                  </span>
                  {hasSubItems && (
                    <span className="text-xs text-gray-500">
                      {subItems.length} {t('trial.items')}
                    </span>
                  )}
                </div>
                
                {/* Sub-items */}
                {hasSubItems && isExpanded && (
                  <div className="border-t bg-gray-50">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3">
                      {subItems.map((subItem) => (
                        <label
                          key={subItem.id}
                          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                            selectedAllergens.includes(subItem.id)
                              ? 'bg-primary-100 border border-primary-300'
                              : 'bg-white border border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Checkbox
                            checked={selectedAllergens.includes(subItem.id)}
                            onCheckedChange={() => handleAllergenToggle(subItem.id)}
                            aria-describedby={`allergen-${subItem.id}-label`}
                          />
                          <span 
                            id={`allergen-${subItem.id}-label`} 
                            className="text-sm truncate"
                          >
                            {subItem.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {selectedAllergens.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">
            {t('foodTrialForm.selectAtLeastOne')}
          </p>
        )}
        {selectedAllergens.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">{t('foodTrialForm.selectedLabel')}</span>
            {selectedAllergens.map((id) => {
              const allergen = allergens.find(a => a.id === id);
              const parent = getParentForSubItem(id);
              if (!allergen) return null;
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                >
                  {parent && <span className="text-primary-500">{parent.icon}</span>}
                  {allergen.name}
                  <button
                    type="button"
                    onClick={() => handleAllergenToggle(id)}
                    className="ml-1 hover:text-primary-900"
                  >
                    &times;
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </fieldset>

      {/* Date & Time */}
      <div>
        <label htmlFor="date" className="form-label">
          {t('foodTrialForm.dateTime')}
        </label>
        <input
          type="datetime-local"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="form-input"
        />
      </div>

      {/* Amount */}
      <div>
        <label htmlFor="amount" className="form-label">
          {t('foodTrialForm.amount')}
        </label>
        <input
          type="text"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="form-input"
          placeholder={t('foodTrialForm.amountPlaceholder')}
        />
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="form-label">
          {t('foodTrialForm.notes')}
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="form-input min-h-[100px]"
          placeholder={t('foodTrialForm.notesPlaceholder')}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Submit */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate(-1)}
          className="flex-1"
        >
          {t('foodTrialForm.cancel')}
        </Button>
        <Button
          type="submit"
          disabled={!foodName.trim() || selectedAllergens.length === 0 || isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? t('foodTrialForm.saving') : t('foodTrialForm.submit')}
        </Button>
      </div>
    </form>
  );
}
