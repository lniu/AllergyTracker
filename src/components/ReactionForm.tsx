import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/Button';
import { Checkbox } from './ui/Checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/Select';
import { useAllergyStore } from '../stores/allergyStore';
import { SYMPTOM_CATEGORIES, type SymptomCategory, type Reaction } from '../types';
import { Camera, X, AlertCircle } from 'lucide-react';

interface ReactionFormProps {
  foodTrialId?: string;
  onSuccess?: () => void;
}

export function ReactionForm({ foodTrialId, onSuccess }: ReactionFormProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { foodTrials, addReaction } = useAllergyStore();
  
  const [selectedTrialId, setSelectedTrialId] = useState(foodTrialId || '');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('mild');
  const [minutesAfterExposure, setMinutesAfterExposure] = useState('30');
  const [photos, setPhotos] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize recent trials to avoid expensive sort on every render
  const recentTrials = useMemo(() => {
    return [...foodTrials]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20);
  }, [foodTrials]);

  const handleSymptomToggle = useCallback((symptom: string) => {
    setSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  }, []);

  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setPhotos((prev) => [...prev, base64]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const removePhoto = useCallback((index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrialId || symptoms.length === 0) return;

    setIsSubmitting(true);
    setError(null);
    
    try {
      const reaction: Reaction = {
        id: crypto.randomUUID(),
        foodTrialId: selectedTrialId,
        symptoms,
        severity,
        minutesAfterExposure: parseInt(minutesAfterExposure),
        photos: photos.length > 0 ? photos : undefined,
        notes: notes.trim() || undefined,
        createdAt: new Date().toISOString(),
      };

      await addReaction(reaction);
      onSuccess?.();
      navigate('/');
    } catch (err) {
      console.error('Failed to save reaction:', err);
      setError(t('reactionForm.saveError'));
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedTrialId, symptoms, severity, minutesAfterExposure, photos, notes, addReaction, onSuccess, navigate, t]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Food Trial Selection */}
      <div>
        <label id="foodTrial-label" className="form-label">
          {t('reactionForm.relatedTrial')} <span className="text-red-500">*</span>
        </label>
        <Select value={selectedTrialId} onValueChange={setSelectedTrialId}>
          <SelectTrigger aria-labelledby="foodTrial-label">
            <SelectValue placeholder={t('reactionForm.selectTrial')} />
          </SelectTrigger>
          <SelectContent>
            {recentTrials.map((trial) => (
              <SelectItem key={trial.id} value={trial.id}>
                {trial.foodName} - {new Date(trial.date).toLocaleDateString()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {recentTrials.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">
            {t('reactionForm.noTrialsYet')}
          </p>
        )}
      </div>

      {/* Symptoms */}
      <fieldset>
        <legend className="form-label mb-3">
          {t('reactionForm.symptoms')} <span className="text-red-500">*</span>
        </legend>
        <div className="space-y-4">
          {(Object.keys(SYMPTOM_CATEGORIES) as SymptomCategory[]).map((category) => (
            <div key={category}>
              <h4 className="text-sm font-medium text-gray-700 capitalize mb-2">
                {t(`symptoms.${category}`)}
              </h4>
              <div className="flex flex-wrap gap-2">
                {SYMPTOM_CATEGORIES[category].map((symptom) => (
                  <div
                    key={symptom}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-colors ${
                      symptoms.includes(symptom)
                        ? 'border-status-reaction bg-status-reaction-light text-gray-900'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('button')) return;
                      handleSymptomToggle(symptom);
                    }}
                  >
                    <Checkbox
                      checked={symptoms.includes(symptom)}
                      onCheckedChange={() => handleSymptomToggle(symptom)}
                      className="sr-only"
                    />
                    <span className="text-sm">{symptom}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      {/* Severity */}
      <div>
        <label className="form-label mb-3">{t('reactionForm.severity')}</label>
        <div className="flex gap-3" role="radiogroup" aria-label={t('reactionForm.severity')}>
          {(['mild', 'moderate', 'severe'] as const).map((level) => (
            <label
              key={level}
              className={`flex-1 text-center py-3 px-4 rounded-lg border-2 cursor-pointer transition-colors ${
                severity === level
                  ? level === 'mild'
                    ? 'border-yellow-400 bg-yellow-50'
                    : level === 'moderate'
                    ? 'border-orange-400 bg-orange-50'
                    : 'border-red-400 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="severity"
                value={level}
                checked={severity === level}
                onChange={(e) => setSeverity(e.target.value as typeof severity)}
                className="sr-only"
              />
              <span className="font-medium capitalize">{t(`reactionForm.${level}`)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Time After Exposure */}
      <div>
        <label id="minutesAfter-label" className="form-label">
          {t('reactionForm.timeAfterEating')}
        </label>
        <Select value={minutesAfterExposure} onValueChange={setMinutesAfterExposure}>
          <SelectTrigger aria-labelledby="minutesAfter-label">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">{t('reactionForm.within5Min')}</SelectItem>
            <SelectItem value="15">{t('reactionForm.15min')}</SelectItem>
            <SelectItem value="30">{t('reactionForm.30min')}</SelectItem>
            <SelectItem value="60">{t('reactionForm.1hour')}</SelectItem>
            <SelectItem value="120">{t('reactionForm.2hours')}</SelectItem>
            <SelectItem value="240">{t('reactionForm.4hours')}</SelectItem>
            <SelectItem value="480">{t('reactionForm.8plusHours')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Photo Upload */}
      <div>
        <label className="form-label mb-3">{t('reactionForm.photos')}</label>
        <div className="space-y-3">
          <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
            <Camera className="h-5 w-5 text-gray-400" aria-hidden="true" />
            <span className="text-gray-600">{t('reactionForm.addPhotos')}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="sr-only"
            />
          </label>
          {photos.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={photo}
                    alt={`Reaction photo ${index + 1}`}
                    className="h-20 w-20 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                    aria-label={`Remove photo ${index + 1}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="form-label">
          {t('reactionForm.notes')}
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="form-input min-h-[100px]"
          placeholder={t('reactionForm.notesPlaceholder')}
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
          {t('reactionForm.cancel')}
        </Button>
        <Button
          type="submit"
          variant="danger"
          disabled={!selectedTrialId || symptoms.length === 0 || isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? t('reactionForm.saving') : t('reactionForm.submit')}
        </Button>
      </div>
    </form>
  );
}
