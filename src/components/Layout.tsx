import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Plus, AlertTriangle, FileDown, Calendar, Baby } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from './LanguageToggle';

export function Layout() {
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { to: '/', icon: Home, labelKey: 'nav.home' },
    { to: '/baby', icon: Baby, labelKey: 'nav.babyLog' },
    { to: '/calendar', icon: Calendar, labelKey: 'nav.calendar' },
    { to: '/add-trial', icon: Plus, labelKey: 'nav.addTrial' },
    { to: '/add-reaction', icon: AlertTriangle, labelKey: 'nav.reaction' },
    { to: '/export', icon: FileDown, labelKey: 'nav.export' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 sm:pb-0">
      {/* Skip Link for Accessibility */}
      <a href="#main-content" className="skip-link">
        {t('app.skipToContent')}
      </a>

      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl" role="img" aria-label="Baby bottle">
                🍼
              </span>
              <span className="font-bold text-gray-900">{t('app.name')}</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden sm:flex items-center gap-1" aria-label="Main navigation">
              {navItems.map(({ to, icon: Icon, labelKey }) => {
                const isActive =
                  to === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(to);

                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    <span>{t(labelKey)}</span>
                  </Link>
                );
              })}
              <LanguageToggle />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="max-w-3xl mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white border-t sm:hidden z-40"
        aria-label="Main navigation"
      >
        <div className="flex justify-around">
          {navItems.map(({ to, icon: Icon, labelKey }) => {
            const isActive =
              to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(to);

            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center py-3 px-4 min-w-[64px] ${
                  isActive
                    ? 'text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="text-xs mt-1">{t(labelKey)}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Language Toggle - Fixed position */}
      <div className="fixed top-3 right-3 sm:hidden z-50">
        <LanguageToggle />
      </div>
    </div>
  );
}
