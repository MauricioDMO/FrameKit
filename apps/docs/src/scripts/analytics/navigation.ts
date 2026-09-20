import { getDocsDestination, getExternalCategory, track } from './core';

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
    track('heading-anchor-click', {
      target: url.hash.replace(/^#/, '') || 'unknown',
    });
  }

  if (anchor.closest('starlight-toc, mobile-starlight-toc') && url.hash) {
    track('toc-click', {
      target: url.hash.replace(/^#/, ''),
    });
  }

  if (anchor.rel === 'prev' || anchor.rel === 'next') {
    track(anchor.rel === 'prev' ? 'docs-prev-click' : 'docs-next-click', {
      destination: url.pathname,
    });
  }

  if (isLandingPage && /\/users\/getting-started\/$/.test(url.pathname)) {
    track('get-started-click', { location: 'landing-hero' });
  }

  if (isLandingPage && url.hash === '#workflow') {
    track('workflow-click', { location: 'landing-hero' });
  }

  if (isLandingPage && /\/users\/getting-started\/create-project\/?$/.test(url.pathname)) {
    track('starting-path-click', { path: 'new-project' });
  }

  if (isLandingPage && /\/users\/getting-started\/existing-project\/?$/.test(url.pathname)) {
    track('starting-path-click', { path: 'existing-project' });
  }

  const docsDestination = getDocsDestination(url.pathname);
  if (docsDestination) {
    track('docs-section-open', docsDestination);

    if (docsDestination.audience === 'contributors') {
      track('contributor-docs-open', {
        section: docsDestination.section,
      });
    }
  }

  if (/\/users\/guides(?:\/|$)/.test(url.pathname)) {
    track('guide-open');
  }

  if (/\/users\/reference\/http-api(?:\/|$)/.test(url.pathname)) {
    track('api-reference-open');
  }

  if (/\/users\/troubleshooting(?:\/|$)/.test(url.pathname)) {
    track('troubleshooting-open');
  }
};

const trackExternalNavigation = (url: URL) => {
  const category = getExternalCategory(url.hostname);

  track('external-link-click', {
    category,
    hostname: url.hostname,
  });

  if (category === 'github') {
    const isFrameKitRepository = url.pathname.toLowerCase().startsWith('/mauriciodmo/framekit');
    track('github-click', {
      target: isFrameKitRepository ? 'framekit-repository' : 'github',
    });
  }

  if (category === 'npm') {
    const isFrameKitPackage = url.pathname.toLowerCase().includes('/package/@mauriciodmo/framekit');
    track('npm-click', {
      target: isFrameKitPackage ? 'framekit-package' : 'npm',
    });
  }
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
