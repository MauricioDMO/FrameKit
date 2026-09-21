export const PRODUCTION_HOST = 'framekit.mauriciodmo.com';
export const GETTING_STARTED_STORAGE_KEY = 'framekit:getting-started-progress';

export type AnalyticsValue = string | number | boolean;
export type AnalyticsData = Record<string, AnalyticsValue>;

type Umami = {
  track: (eventName: string, data?: AnalyticsData) => void;
};

declare global {
  interface Window {
    umami?: Umami;
  }
}

const pendingEvents: Array<{ eventName: string; data: AnalyticsData }> = [];
let flushTimer: number | undefined;
let flushAttempts = 0;

export const isProductionAnalytics = () => window.location.hostname === PRODUCTION_HOST;

export const getLocale = () => {
  const htmlLocale = document.documentElement.lang?.split('-')[0];
  if (htmlLocale) return htmlLocale;

  return window.location.pathname.split('/').filter(Boolean)[0] || 'unknown';
};

const flushPendingEvents = () => {
  flushTimer = undefined;

  if (window.umami?.track) {
    for (const event of pendingEvents.splice(0)) {
      window.umami.track(event.eventName, event.data);
    }
    flushAttempts = 0;
    return;
  }

  if (pendingEvents.length === 0 || flushAttempts >= 20) return;

  flushAttempts += 1;
  flushTimer = window.setTimeout(flushPendingEvents, 250);
};

export const track = (eventName: string, data: AnalyticsData = {}) => {
  const eventData = {
    locale: getLocale(),
    ...data,
  };

  if (window.umami?.track) {
    window.umami.track(eventName, eventData);
    return;
  }

  pendingEvents.push({ eventName, data: eventData });

  if (flushTimer === undefined) {
    flushTimer = window.setTimeout(flushPendingEvents, 0);
  }
};

export const getSessionJson = <T extends object>(key: string): Partial<T> => {
  try {
    return JSON.parse(window.sessionStorage.getItem(key) || '{}') as Partial<T>;
  } catch {
    return {};
  }
};

export const setSessionJson = (key: string, value: object) => {
  window.sessionStorage.setItem(key, JSON.stringify(value));
};

export const getExternalCategory = (hostname: string) => {
  if (hostname === 'github.com') return 'github';
  if (hostname === 'npmjs.com' || hostname === 'www.npmjs.com') return 'npm';
  if (hostname === 'nextjs.org' || hostname.endsWith('.nextjs.org')) return 'nextjs';
  if (hostname === 'astro.build' || hostname.endsWith('.astro.build')) return 'astro';
  if (hostname === 'nodejs.org' || hostname.endsWith('.nodejs.org')) return 'nodejs';
  if (hostname === 'docker.com' || hostname.endsWith('.docker.com')) return 'docker';

  return 'other';
};
