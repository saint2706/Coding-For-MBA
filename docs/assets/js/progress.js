/**
 * Lesson Progress Tracker
 *
 * Displays progress bar and "Day X of Y" indicator on lesson pages.
 * Reads total lessons from site_metadata.json and current lesson from page.
 */

(function() {
  'use strict';

  // Configuration
  const METADATA_URL = '/Coding-For-MBA/site_metadata.json';
  const FALLBACK_TOTAL = 108;

  /**
   * Extract day number from current page URL or title
   */
  function getCurrentLessonDay() {
    // Try to get from data attribute if set
    const main = document.querySelector('[data-lesson-day]');
    if (main) {
      return parseInt(main.getAttribute('data-lesson-day'), 10);
    }

    // Try to extract from URL (e.g., /lessons/day-42-... or /Day_42_...)
    const urlMatch = window.location.pathname.match(/day[-_](\d+)/i);
    if (urlMatch) {
      return parseInt(urlMatch[1], 10);
    }

    // Try to extract from page title
    const titleMatch = document.title.match(/day\s+(\d+)/i);
    if (titleMatch) {
      return parseInt(titleMatch[1], 10);
    }

    // Try to extract from first h1
    const h1 = document.querySelector('h1');
    if (h1) {
      const h1Match = h1.textContent.match(/day\s+(\d+)/i);
      if (h1Match) {
        return parseInt(h1Match[1], 10);
      }
    }

    return null;
  }

  /**
   * Fetch total lessons from metadata
   */
  async function getTotalLessons() {
    try {
      const response = await fetch(METADATA_URL);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      return data.total_lessons || FALLBACK_TOTAL;
    } catch (error) {
      console.warn('Progress tracker: Failed to fetch metadata, using fallback:', error);
      return FALLBACK_TOTAL;
    }
  }

  /**
   * Create and insert progress bar HTML
   */
  function createProgressBar(currentDay, totalLessons) {
    const percentage = Math.round((currentDay / totalLessons) * 100);

    const container = document.createElement('div');
    container.id = 'lesson-progress-tracker';
    container.className = 'lesson-progress-tracker';
    container.setAttribute('role', 'status');
    container.setAttribute('aria-label', `Lesson progress: Day ${currentDay} of ${totalLessons}`);

    container.innerHTML = `
      <div class="progress-header">
        <span class="progress-label">📚 Progress: Day ${currentDay} of ${totalLessons}</span>
        <span class="progress-percentage">${percentage}%</span>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar-fill" style="width: ${percentage}%"></div>
      </div>
    `;

    return container;
  }

  /**
   * Insert progress bar into page
   */
  function insertProgressBar(progressBar) {
    // Remove any existing tracker instance to avoid duplicates
    const existing = document.getElementById('lesson-progress-tracker');
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }

    // Try to insert after navigation or at the top of main content
    const article = document.querySelector('article.md-content__inner');
    const main = document.querySelector('main');

    if (article) {
      article.insertBefore(progressBar, article.firstChild);
    } else if (main) {
      main.insertBefore(progressBar, main.firstChild);
    } else {
      // Fallback: insert at top of body
      document.body.insertBefore(progressBar, document.body.firstChild);
    }
  }

  /**
   * Add CSS styles for progress bar
   */
  function addStyles() {
    if (document.getElementById('lesson-progress-tracker-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'lesson-progress-tracker-styles';
    style.textContent = `
      .lesson-progress-tracker {
        margin-bottom: 2rem;
        padding: 1rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        color: white;
      }

      .progress-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
        font-size: 0.95rem;
        font-weight: 500;
      }

      .progress-label {
        flex: 1;
      }

      .progress-percentage {
        font-weight: 700;
        font-size: 1.1rem;
      }

      .progress-bar-container {
        width: 100%;
        height: 8px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 4px;
        overflow: hidden;
      }

      .progress-bar-fill {
        height: 100%;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 4px;
        transition: width 0.5s ease-out;
      }

      /* Dark mode adjustments */
      [data-md-color-scheme="slate"] .lesson-progress-tracker {
        background: linear-gradient(135deg, #434343 0%, #000000 100%);
        box-shadow: 0 2px 8px rgba(255, 255, 255, 0.1);
      }

      /* Mobile responsive */
      @media (max-width: 768px) {
        .lesson-progress-tracker {
          padding: 0.75rem;
        }

        .progress-header {
          font-size: 0.85rem;
        }

        .progress-percentage {
          font-size: 1rem;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Initialize progress tracker
   */
  async function init() {
    // Only run on lesson pages
    const currentDay = getCurrentLessonDay();
    if (!currentDay) {
      return;
    }

    // Get total lessons
    const totalLessons = await getTotalLessons();

    // Validate current day
    if (currentDay < 1 || currentDay > totalLessons) {
      console.warn(`Progress tracker: Invalid day number ${currentDay}`);
      return;
    }

    // Create and insert progress bar
    addStyles();
    const progressBar = createProgressBar(currentDay, totalLessons);
    insertProgressBar(progressBar);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
