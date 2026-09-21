import { getExternalCategory, track } from './core';

const trackPackageManagerTab = (target: Element) => {
  const tab = target.closest('[role="tab"]');
  if (!tab) return;

  const label = tab.textContent?.trim().toLowerCase() || '';
  const packageManager = ['pnpm', 'npm', 'yarn', 'bun'].find((manager) => label.includes(manager));

  if (packageManager) {
    track('package-manager-select', { packageManager });
  }
};

const trackInternalNavigation = (anchor: HTMLAnchorElement, url: URL) => {
  const isLandingPage = /^\/(?:en|es)\/$/.test(window.location.pathname);

  if (anchor.matches('.sl-anchor-link')) {
    track('docs-anchor-click', {
      source: 'heading',
      target: url.hash.replace(/^#/, '') || 'unknown',
    });
  } else if (anchor.closest('starlight-toc, mobile-starlight-toc') && url.hash) {
    track('docs-anchor-click', {
      source: 'toc',
      target: url.hash.replace(/^#/, ''),
    });
  }

  if (anchor.rel === 'prev' || anchor.rel === 'next') {
    track('docs-pagination-click', {
      direction: anchor.rel,
      destination: url.pathname,
    });
  }

  if (isLandingPage && /\/users\/getting-started\/$/.test(url.pathname)) {
    track('get-started-click', { location: 'landing-hero' });
  }

  if (isLandingPage && /\/users\/getting-started\/create-project\/?$/.test(url.pathname)) {
    track('starting-path-click', { path: 'new-project' });
  }

  if (isLandingPage && /\/users\/getting-started\/existing-project\/?$/.test(url.pathname)) {
    track('starting-path-click', { path: 'existing-project' });
  }
};

const trackExternalNavigation = (url: URL) => {
  const category = getExternalCategory(url.hostname);

  track('external-link-click', {
    category,
    hostname: url.hostname,
  });
};

export const initNavigationTracking = () => {
  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;

    trackPackageManagerTab(event.target);

    const anchor = event.target.closest('a[href]');
    if (!(anchor instanceof HTMLAnchorElement)) return;

    const url = new URL(anchor.href, window.location.href);

    const searchResult = anchor.closest('#starlight__search .pagefind-ui__result');
    if (searchResult) {
      const resultLinks = [...document.querySelectorAll<HTMLAnchorElement>('#starlight__search .pagefind-ui__result a[href]')];
      const position = Math.max(1, resultLinks.indexOf(anchor) + 1);

      track('search-result-click', {
        destination: url.pathname,
        position,
      });
    }

    if (url.origin !== window.location.origin) {
      trackExternalNavigation(url);
      return;
    }

    trackInternalNavigation(anchor, url);
  });
};
