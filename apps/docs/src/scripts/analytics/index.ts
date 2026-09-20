import { isProductionAnalytics } from './core';
import { initCopyTracking } from './copy';
import { initLocaleTracking } from './locale';
import { initNavigationTracking } from './navigation';
import { initPageTracking } from './page';
import { initSearchTracking } from './search';

if (isProductionAnalytics()) {
  const init = () => {
    initLocaleTracking();
    initPageTracking();
    initCopyTracking();
    initNavigationTracking();
    initSearchTracking();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
}
