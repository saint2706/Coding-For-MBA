import type { MouseEvent } from 'react';

export default function SkipToContent() {
  const handleSkipToContent = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const mainContent = document.getElementById('main-content');
    if (mainContent instanceof HTMLElement) {
      mainContent.focus();
    }
  };

  return (
    <a
      href="#main-content"
      className="skip-to-content"
      onClick={handleSkipToContent}
    >
      Skip to content
    </a>
  )
}
