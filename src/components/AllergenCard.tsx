import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from './StatusBadge';
import { useAllergyStore } from '../stores/allergyStore';
import type { Allergen } from '../types';

interface AllergenCardProps {
  allergen: Allergen;
}

export function AllergenCard({ allergen }: AllergenCardProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const { 
    getAllergenStatus, 
    getTrialCount, 
    getSubItems, 
    getParentStatus, 
    getParentTrialCount 
  } = useAllergyStore();
  
  // Memoize expensive computations to prevent recalculation on every render
  const { subItems, hasSubItems, status, trialCount } = useMemo(() => {
    const items = getSubItems(allergen.id);
    const hasItems = items.length > 0;
    return {
      subItems: items,
      hasSubItems: hasItems,
      status: hasItems ? getParentStatus(allergen.id) : getAllergenStatus(allergen.id),
      trialCount: hasItems ? getParentTrialCount(allergen.id) : getTrialCount(allergen.id),
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allergen.id]);

  const bgColors = {
    safe: 'bg-status-safe-light border-status-safe/20',
    testing: 'bg-status-testing-light border-status-testing/20',
    reaction: 'bg-status-reaction-light border-status-reaction/20',
  };

  const statusDotColors = {
    safe: 'bg-status-safe',
    testing: 'bg-status-testing',
    reaction: 'bg-status-reaction',
  };

  // Show first 2 sub-items when collapsed, all when expanded
  const visibleSubItems = isExpanded ? subItems : subItems.slice(0, 2);
  const hiddenCount = subItems.length - 2;

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={`allergen-card block rounded-xl border-2 ${bgColors[status]} overflow-hidden`}
    >
      {/* Main card header - links to parent allergen detail */}
      <Link
        to={`/allergen/${allergen.id}`}
        className="block p-4 focus:outline-none hover:bg-black/5 transition-colors"
        aria-label={`${allergen.name}: ${t(`status.${status}Desc`)}. ${t('trial.trialCount', { count: trialCount })}.`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            {allergen.icon && typeof allergen.icon === 'string' && (
              <span className="text-3xl" role="img" aria-hidden="true">
                {allergen.icon}
              </span>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">{allergen.name}</h3>
              <p className="text-sm text-gray-600 mt-0.5">
                {t('trial.trialCount', { count: trialCount })}
              </p>
            </div>
          </div>
          <StatusBadge status={status} size="sm" />
        </div>
        
        {/* Progress indicator for testing status (only if no sub-items) */}
        {!hasSubItems && status === 'testing' && trialCount < 3 && (
          <div className="mt-3" aria-label={`${trialCount} of 3 trials completed`}>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${
                    i < trialCount ? 'bg-status-testing' : 'bg-gray-200'
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {t('trial.moreTrialsToSafe', { count: 3 - trialCount })}
            </p>
          </div>
        )}
      </Link>

      {/* Sub-items section */}
      {hasSubItems && (
        <div className="border-t border-gray-200/50">
          <div className="px-4 py-2 space-y-1">
            {visibleSubItems.map((subItem) => {
              const subStatus = getAllergenStatus(subItem.id);
              const subTrialCount = getTrialCount(subItem.id);
              
              return (
                <Link
                  key={subItem.id}
                  to={`/allergen/${subItem.id}`}
                  className="flex items-center justify-between py-1.5 px-2 -mx-2 rounded-lg hover:bg-black/5 transition-colors group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div 
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDotColors[subStatus]}`}
                      aria-hidden="true"
                    />
                    <span className="text-sm text-gray-700 truncate group-hover:text-gray-900">
                      {subItem.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                    {t('trial.trialCount', { count: subTrialCount })}
                  </span>
                </Link>
              );
            })}
          </div>
          
          {/* Expand/collapse button */}
          {subItems.length > 2 && (
            <button
              onClick={handleToggleExpand}
              className="w-full px-4 py-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-black/5 transition-colors flex items-center justify-center gap-1 border-t border-gray-200/50"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3 h-3" />
                  {t('trial.showLess')}
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" />
                  {t('trial.moreItems', { count: hiddenCount })}
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
