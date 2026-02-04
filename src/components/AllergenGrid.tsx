import { useTranslation } from 'react-i18next';
import { AllergenCard } from './AllergenCard';
import { useAllergyStore } from '../stores/allergyStore';

export function AllergenGrid() {
  const { t } = useTranslation();
  const { isLoading, getParentAllergens } = useAllergyStore();
  
  // Get only parent-level allergens (sub-items are shown within cards)
  const parentAllergens = getParentAllergens();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-busy="true">
        {[...Array(9)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-xl bg-gray-100 animate-pulse"
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  // Separate Big 9 allergens from custom ones (only parent-level)
  const big9 = parentAllergens.filter((a) => !a.isCustom);
  const custom = parentAllergens.filter((a) => a.isCustom && !a.parentId);

  return (
    <div className="space-y-8">
      {/* Big 9 Allergens */}
      <section aria-labelledby="big9-heading">
        <h2 id="big9-heading" className="text-lg font-semibold text-gray-900 mb-4">
          {t('allergens.big9')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {big9.map((allergen) => (
            <AllergenCard key={allergen.id} allergen={allergen} />
          ))}
        </div>
      </section>

      {/* Custom Allergens */}
      {custom.length > 0 && (
        <section aria-labelledby="custom-heading">
          <h2 id="custom-heading" className="text-lg font-semibold text-gray-900 mb-4">
            {t('allergens.custom')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {custom.map((allergen) => (
              <AllergenCard key={allergen.id} allergen={allergen} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
