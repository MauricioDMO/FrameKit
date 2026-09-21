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

const detectPackageManager = (code: string) => {
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

const detectCommandKind = (code: string) => {
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

const getCopiedCode = (button: HTMLButtonElement) => {
  if (button.dataset.code) return button.dataset.code.replace(/\u007f/g, '\n');

  return button.closest('.expressive-code')?.querySelector('pre code')?.textContent || '';
};

const waitForCopySuccess = (button: HTMLButtonElement, onSuccess: () => void) => {
  const container = button.parentElement;
  if (!container) return;

  let settled = false;
  let timeout: number | undefined;
  let observer: MutationObserver | undefined;

  const finish = () => {
    if (settled) return;
    settled = true;
    observer?.disconnect();
    if (timeout !== undefined) window.clearTimeout(timeout);
    onSuccess();
  };

  if (container.querySelector('.feedback')) {
    finish();
    return;
  }

  observer = new MutationObserver(() => {
    if (container.querySelector('.feedback')) finish();
  });

  observer.observe(container, { childList: true, subtree: true });
  timeout = window.setTimeout(() => {
    settled = true;
    observer?.disconnect();
  }, 2000);
};

const recordSuccessfulCopy = (button: HTMLButtonElement) => {
  const code = getCopiedCode(button);
  const commandKind = detectCommandKind(code);
  const packageManager = detectPackageManager(code);
  if (!['create-project', 'install-package'].includes(commandKind)) return;

  waitForCopySuccess(button, () => {
    track('install-command-copy', {
      commandKind,
      packageManager,
    });

    const progress = getSessionJson<GettingStartedProgress>(GETTING_STARTED_STORAGE_KEY);
    setSessionJson(GETTING_STARTED_STORAGE_KEY, {
      ...progress,
      installed: true,
      commandKind,
      packageManager,
    });
  });
};

export const initCopyTracking = () => {
  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;

    const button = event.target.closest('.expressive-code .copy button');
    if (button instanceof HTMLButtonElement) {
      recordSuccessfulCopy(button);
    }
  });
};
