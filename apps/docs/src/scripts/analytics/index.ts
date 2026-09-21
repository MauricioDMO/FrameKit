import { isProductionAnalytics } from './core';
import { initCopyTracking } from './copy';
import { initNavigationTracking } from './navigation';
import { initPageTracking } from './page';
import { initSearchTracking } from './search';

if (isProductionAnalytics()) {
  const init = () => {
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
