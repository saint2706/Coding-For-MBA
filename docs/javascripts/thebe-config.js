(function () {
  const POLLING_INTERVAL_MS = 250;
  const EXECUTABLE_SELECTOR = '[data-executable="true"]';

  function ensureExecutableWrapper(element) {
    if (!element.classList.contains('executable')) {
      element.classList.add('executable');
    }
  }

  function tagExecutableBlocks() {
    document.querySelectorAll(EXECUTABLE_SELECTOR).forEach((element) => {
      ensureExecutableWrapper(element);
      if (!element.hasAttribute('data-language')) {
        const codeBlock = element.querySelector('pre code');
        if (codeBlock && codeBlock.className) {
          const language = Array.from(codeBlock.classList).find((cls) =>
            cls.startsWith('language-')
          );
          if (language) {
            element.setAttribute('data-language', language.replace('language-', ''));
          }
        }
      }
    });
  }

  function bootstrapThebe() {
    if (typeof window === 'undefined') {
      return;
    }

    if (!window.thebelab) {
      window.setTimeout(bootstrapThebe, POLLING_INTERVAL_MS);
      return;
    }

    tagExecutableBlocks();

    window.thebelab.bootstrap({
      requestKernel: true,
      binderOptions: {
        repo: 'saint2706/Coding-For-MBA',
        ref: 'main',
      },
      kernelOptions: {
        name: 'python3',
        kernelName: 'python3',
      },
      selector: EXECUTABLE_SELECTOR,
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    tagExecutableBlocks();
    bootstrapThebe();
  });
})();
