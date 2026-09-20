import { track } from './core';

export const initSearchTracking = () => {
  const searchRoot = document.querySelector('#starlight__search');
  if (!searchRoot) return;

  let searchTracked = false;
  let lastNoResultsQuery = '';
  let timer: number | undefined;

  document.addEventListener('input', (event) => {
    if (!(event.target instanceof HTMLInputElement)) return;

    if (!event.target.matches('#starlight__search .pagefind-ui__search-input, #starlight__search input[type="search"]')) {
      return;
    }

    if (!searchTracked) {
      searchTracked = true;
      track('docs-search-use');
    }
  });

  const inspectResults = () => {
    if (timer !== undefined) window.clearTimeout(timer);

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
