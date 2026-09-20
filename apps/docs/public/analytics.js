(() => {
  const PRODUCTION_HOST = 'framekit.mauriciodmo.com';
  const LOCALE_STORAGE_KEY = 'framekit:docs-locale';

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

    if (/\bframekit\s+(?:generate|dev|build|render)\b/.test(code)) {
      return 'framekit-cli';
    }

    if (/\b(?:pnpm|npm|yarn|bun)\s+(?:run\s+)?dev\b/.test(code)) {
      return 'development';
    }

    return 'other';
  };

  const getCopiedCode = (button) => {
    if (button.dataset.code) return button.dataset.code;

    return button.closest('.expressive-code')?.querySelector('pre code')?.textContent || '';
  };

  const getDocsDestination = (pathname) => {
    const match = pathname.match(/^\/(?:en|es)\/(users|contributors)\/([^/]+)/);
    if (!match) return null;

    return {
      audience: match[1],
      section: match[2],
    };
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
      const code = getCopiedCode(copyButton);
      const commandKind = detectCommandKind(code);
      const packageManager = detectPackageManager(code);
      const eventName = ['create-project', 'install-package'].includes(commandKind)
        ? 'install-command-copy'
        : 'code-copy';

      track(eventName, {
        commandKind,
        packageManager,
      });

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

    if (url.hostname === 'github.com') {
      const isFrameKitRepository = url.pathname.toLowerCase().startsWith('/mauriciodmo/framekit');
      track('github-click', {
        target: isFrameKitRepository ? 'framekit-repository' : 'github',
      });
      return;
    }

    if (['npmjs.com', 'www.npmjs.com'].includes(url.hostname)) {
      const isFrameKitPackage = url.pathname.toLowerCase().includes('/package/@mauriciodmo/framekit');
      track('npm-click', {
        target: isFrameKitPackage ? 'framekit-package' : 'npm',
      });
      return;
    }

    if (url.origin !== window.location.origin) return;

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
    if (searchTracked || !(event.target instanceof HTMLInputElement)) return;

    if (event.target.matches('input[type="search"], input[role="searchbox"]')) {
      searchTracked = true;
      track('docs-search-use');
    }
  });
})();
