import {
  GETTING_STARTED_STORAGE_KEY,
  getSessionJson,
  setSessionJson,
  track,
} from './core';

type GettingStartedProgress = {
  installed: boolean;
  completed: boolean;
  commandKind: string;
  packageManager: string;
};

const track404 = () => {
  const heading = document.querySelector('h1')?.textContent?.trim();
  if (heading !== '404') return;

  const referrer = document.referrer
    ? new URL(document.referrer).origin === window.location.origin
      ? 'internal'
      : 'external'
    : 'direct';

  track('404-view', {
    path: window.location.pathname,
    referrer,
  });
};

const trackGettingStarted = () => {
  const match = window.location.pathname.match(/^\/(?:en|es)\/users\/getting-started(?:\/([^/]+))?\/?$/);
  if (!match) return;

  const step = match[1] || 'index';
  track('getting-started-step-view', { step });

  if (step !== 'first-template') return;

  track('first-template-open');

  const progress = getSessionJson<GettingStartedProgress>(GETTING_STARTED_STORAGE_KEY);
  if (!progress.installed || progress.completed) return;

  track('getting-started-complete', {
    method: 'install-to-first-template',
    commandKind: progress.commandKind || 'unknown',
    packageManager: progress.packageManager || 'unknown',
  });

  setSessionJson(GETTING_STARTED_STORAGE_KEY, {
    ...progress,
    completed: true,
  });
};

const trackMigration = () => {
  const match = window.location.pathname.match(/^\/(?:en|es)\/users\/migrations(?:\/([^/]+))?\/?$/);
  if (!match) return;

  track('migration-open', {
    version: match[1] || 'index',
  });
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

const initScrollDepthTracking = () => {
  if (!isHighValueScrollPage()) return;

  const milestones = [50, 90] as const;
  const reached = new Set<number>();

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

export const initPageTracking = () => {
  track404();
  trackGettingStarted();
  trackMigration();
  initScrollDepthTracking();
};
