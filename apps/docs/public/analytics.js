(() => {
  const PRODUCTION_HOST = 'framekit.mauriciodmo.com';
  const LOCALE_STORAGE_KEY = 'framekit:docs-locale';
  const GETTING_STARTED_STORAGE_KEY = 'framekit:getting-started-progress';

  if (window.location.hostname !== PRODUCTION_HOST) return;

  const getLocale = () => {
    const htmlLocale = document.documentElement.lang?.split('-')[0];
    if (htmlLocale) return htmlLocale;

    return window.location.pathname.split('/').filter(Boolean)[0] || 'unknown';
  };

  const track = (eventName, data = {}) => {
    if (!window.umami?.track) return;

    window.umami.track(eventName, {
      locale: getLocale(),
      ...data,
    });
  };

  const getSessionJson = (key) => {
    try {
      return JSON.parse(window.sessionStorage.getItem(key) || '{}');
    } catch {
      return {};
    }
  };

  const setSessionJson = (key, value) => {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  };

  const detectPackageManager = (code) => {
    const command = code
      .split('\n')
      .map((line) => line.trim())
      .find((line) => /^(pnpm|npm|npx|yarn|bun|bunx)\b/.test(line));

    if (!command) return 'other';
    if (/^pnpm\b/.test(command)) return 'pnpm';
    if (/^(npm|npx)\b/.test(command)) return 'npm';
    if (/^yarn\b/.test(command)) return 'yarn';
    if (/^(bun|bunx)\b/.test(command)) return 'bun';

    return 'other';
  };

  const detectCommandKind = (code) => {
    if (/@mauriciodmo\/create-framekit|\bcreate-framekit\b/.test(code)) {
      return 'create-project';
    }

    if (/(?:pnpm\s+add|npm\s+(?:i|install)|yarn\s+add|bun\s+add)\s+@mauriciodmo\/framekit\b/.test(code)) {
      return 'install-package';
    }

    if (/\bframekit\s+(?:check|generate|dev|build|render)\b/.test(code)) {
      return 'framekit-cli';
    }

    if (/\b(?:pnpm|npm|yarn|bun)\s+(?:run\s+)?dev\b/.test(code)) {
      return 'development';
    }

    return 'other';
  };

  const getCopiedCode = (button) => {
    if (button.dataset.code) return button.dataset.code.replace(/\u007f/g, '\n');

    return button.closest('.expressive-code')?.querySelector('pre code')?.textContent || '';
  };

  const getDocsDestination = (pathname) => {
    const match = pathname.match(/^\/(?:en|es)\/(users|contributors)(?:\/([^/]+))?(?:\/|$)/);
    if (!match) return null;

    return {
      audience: match[1],
      section: match[2] || 'index',
    };
  };

  const getExternalCategory = (hostname) => {
    if (hostname === 'github.com') return 'github';
    if (hostname === 'npmjs.com' || hostname === 'www.npmjs.com') return 'npm';
    if (hostname === 'nextjs.org' || hostname.endsWith('.nextjs.org')) return 'nextjs';
    if (hostname === 'astro.build' || hostname.endsWith('.astro.build')) return 'astro';
    if (hostname === 'nodejs.org' || hostname.endsWith('.nodejs.org')) return 'nodejs';
    if (hostname === 'docker.com' || hostname.endsWith('.docker.com')) return 'docker';

    return 'other';
  };

  const waitForCopySuccess = (button, onSuccess) => {
    const container = button.parentElement;
    if (!container || container.querySelector('.feedback')) return;

    let settled = false;
    let timeout;

    const observer = new MutationObserver(() => {
      if (settled || !container.querySelector('.feedback')) return;

      settled = true;
      observer.disconnect();
      window.clearTimeout(timeout);
      onSuccess();
    });

    observer.observe(container, { childList: true, subtree: true });
    timeout = window.setTimeout(() => {
      settled = true;
      observer.disconnect();
    }, 2000);
  };

  const recordSuccessfulCopy = (button) => {
    const code = getCopiedCode(button);
    const commandKind = detectCommandKind(code);
    const packageManager = detectPackageManager(code);
    const eventName = ['create-project', 'install-package'].includes(commandKind)
      ? 'install-command-copy'
      : 'code-copy';

    waitForCopySuccess(button, () => {
      track(eventName, {
        commandKind,
        packageManager,
      });

      if (eventName === 'install-command-copy') {
        const progress = getSessionJson(GETTING_STARTED_STORAGE_KEY);
        setSessionJson(GETTING_STARTED_STORAGE_KEY, {
          ...progress,
          installed: true,
          commandKind,
          packageManager,
        });
      }
    });
  };

  const trackPageSignals = () => {
    const pathname = window.location.pathname;
    const heading = document.querySelector('h1')?.textContent?.trim();

    if (heading === '404') {
      const referrer = document.referrer
        ? new URL(document.referrer).origin === window.location.origin
          ? 'internal'
          : 'external'
        : 'direct';

      track('404-view', {
        path: pathname,
        referrer,
      });
    }

    const gettingStartedMatch = pathname.match(/^\/(?:en|es)\/users\/getting-started(?:\/([^/]+))?\/?$/);
    if (gettingStartedMatch) {
      const step = gettingStartedMatch[1] || 'index';
      track('getting-started-step-view', { step });

      if (step === 'first-template') {
        track('first-template-open');

        const progress = getSessionJson(GETTING_STARTED_STORAGE_KEY);
        if (progress.installed && !progress.completed) {
          track('getting-started-complete', {
            method: 'install-to-first-template',
            commandKind: progress.commandKind || 'unknown',
            packageManager: progress.packageManager || 'unknown',
          });

          setSessionJson(GETTING_STARTED_STORAGE_KEY, {
            ...progress,
            completed: true,
          });
        }
      }
    }

    const migrationMatch = pathname.match(/^\/(?:en|es)\/users\/migrations(?:\/([^/]+))?\/?$/);
    if (migrationMatch) {
      track('migration-open', {
        version: migrationMatch[1] || 'index',
      });
    }
  };

  const isHighValueScrollPage = () => {
    const pathname = window.location.pathname;

    return (
      /^\/(?:en|es)\/$/.test(pathname) ||
      /^\/(?:en|es)\/users\/getting-started(?:\/|$)/.test(pathname) ||
      /^\/(?:en|es)\/users\/guides(?:\/|$)/.test(pathname) ||
      /^\/(?:en|es)\/users\/reference\/http-api(?:\/|$)/.test(pathname)
    );
  };

  const initScrollDepth = () => {
    if (!isHighValueScrollPage()) return;

    const milestones = [50, 90];
    const reached = new Set();

    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;

      const depth = Math.min(100, Math.round((window.scrollY / scrollable) * 100));

      for (const milestone of milestones) {
        if (depth >= milestone && !reached.has(milestone)) {
          reached.add(milestone);
          track('scroll-depth', { depth: milestone });
        }
      }

      if (reached.size === milestones.length) {
        window.removeEventListener('scroll', onScroll);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
  };

  const initSearchQualityTracking = () => {
    const searchRoot = document.querySelector('#starlight__search');
    if (!searchRoot) return;

    let lastNoResultsQuery = '';
    let timer;

    const inspectResults = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const input = searchRoot.querySelector('.pagefind-ui__search-input, input[type="search"]');
        if (!(input instanceof HTMLInputElement)) return;

        const query = input.value.trim();
        if (!query || query === lastNoResultsQuery) return;

        const results = searchRoot.querySelectorAll('.pagefind-ui__result');
        const message = searchRoot.querySelector('.pagefind-ui__message');

        if (message && results.length === 0) {
          lastNoResultsQuery = query;
          track('search-no-results', {
            queryLength: query.length,
          });
        }
      }, 300);
    };

    const observer = new MutationObserver(inspectResults);
    observer.observe(searchRoot, { childList: true, subtree: true, characterData: true });
  };

  const currentLocale = getLocale();
  const previousLocale = window.sessionStorage.getItem(LOCALE_STORAGE_KEY);

  if (previousLocale && previousLocale !== currentLocale) {
    track('language-change', {
      from: previousLocale,
      to: currentLocale,
    });
  }

  window.sessionStorage.setItem(LOCALE_STORAGE_KEY, currentLocale);

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;

    const copyButton = event.target.closest('.expressive-code .copy button');
    if (copyButton instanceof HTMLButtonElement) {
      recordSuccessfulCopy(copyButton);
      return;
    }

    const tab = event.target.closest('[role="tab"]');
    if (tab) {
      const label = tab.textContent?.trim().toLowerCase() || '';
      const packageManager = ['pnpm', 'npm', 'yarn', 'bun'].find((manager) => label.includes(manager));

      if (packageManager) {
        track('package-manager-select', { packageManager });
      }
    }

    const anchor = event.target.closest('a[href]');
    if (!(anchor instanceof HTMLAnchorElement)) return;

    const url = new URL(anchor.href, window.location.href);

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

    const searchResult = anchor.closest('#starlight__search .pagefind-ui__result');
    if (searchResult) {
      const resultLinks = [...document.querySelectorAll('#starlight__search .pagefind-ui__result a[href]')];
      const position = Math.max(1, resultLinks.indexOf(anchor) + 1);

      track('search-result-click', {
        destination: url.pathname,
        position,
      });
    }

    if (url.origin !== window.location.origin) {
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

      return;
    }

    const isLandingPage = /^\/(?:en|es)\/$/.test(window.location.pathname);

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
  });

  let searchTracked = false;

  document.addEventListener('input', (event) => {
    if (!(event.target instanceof HTMLInputElement)) return;

    if (event.target.matches('#starlight__search .pagefind-ui__search-input, #starlight__search input[type="search"]')) {
      if (!searchTracked) {
        searchTracked = true;
        track('docs-search-use');
      }
    }
  });

  const init = () => {
    trackPageSignals();
    initScrollDepth();
    initSearchQualityTracking();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
