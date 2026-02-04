import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export function LanguageToggle() {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
  };

  const currentLangLabel = i18n.language === 'zh' ? t('language.zh') : t('language.en');

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
      aria-label={t('language.toggle')}
    >
      <Globe className="h-4 w-4" aria-hidden="true" />
      <span>{currentLangLabel}</span>
    </button>
  );
}
