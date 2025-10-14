/**
 * Progress Tracking System for Coding for MBA
 * Tracks lesson completion using localStorage
 */

class ProgressTracker {
  constructor() {
    this.storageKey = 'coding-mba-progress';
    this.totalLessons = 67;
  }

  /**
   * Mark a lesson as complete
   * @param {string} lessonId - Lesson identifier (e.g., "day-01-introduction")
   */
  markComplete(lessonId) {
    const progress = this.getProgress();
    progress[lessonId] = {
      completed: true,
      timestamp: Date.now(),
      lastVisited: new Date().toISOString()
    };
    this.saveProgress(progress);
    this.updateUI();
    this.showNotification('✓ Lesson marked as complete!');
  }

  /**
   * Mark a lesson as incomplete
   * @param {string} lessonId - Lesson identifier
   */
  markIncomplete(lessonId) {
    const progress = this.getProgress();
    delete progress[lessonId];
    this.saveProgress(progress);
    this.updateUI();
  }

  /**
   * Check if a lesson is complete
   * @param {string} lessonId - Lesson identifier
   * @returns {boolean}
   */
  isComplete(lessonId) {
    const progress = this.getProgress();
    return progress[lessonId]?.completed || false;
  }

  /**
   * Get all progress data
   * @returns {Object}
   */
  getProgress() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error reading progress:', error);
      return {};
    }
  }

  /**
   * Save progress data
   * @param {Object} progress - Progress data to save
   */
  saveProgress(progress) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }

  /**
   * Calculate completion percentage
   * @returns {number}
   */
  calculatePercentage() {
    const progress = this.getProgress();
    const completed = Object.keys(progress).length;
    return Math.round((completed / this.totalLessons) * 100);
  }

  /**
   * Get statistics
   * @returns {Object}
   */
  getStats() {
    const progress = this.getProgress();
    const completedLessons = Object.keys(progress);
    const timestamps = completedLessons.map(id => progress[id].timestamp);
    
    return {
      completed: completedLessons.length,
      remaining: this.totalLessons - completedLessons.length,
      percentage: this.calculatePercentage(),
      firstLesson: timestamps.length > 0 ? Math.min(...timestamps) : null,
      lastLesson: timestamps.length > 0 ? Math.max(...timestamps) : null,
      lessonsThisWeek: this.getLessonsCompletedInLastDays(7)
    };
  }

  /**
   * Get lessons completed in the last N days
   * @param {number} days - Number of days to look back
   * @returns {number}
   */
  getLessonsCompletedInLastDays(days) {
    const progress = this.getProgress();
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    return Object.values(progress).filter(item => item.timestamp > cutoff).length;
  }

  /**
   * Export progress data
   * @returns {string} JSON string
   */
  exportProgress() {
    return JSON.stringify(this.getProgress(), null, 2);
  }

  /**
   * Import progress data
   * @param {string} jsonData - JSON string of progress data
   */
  importProgress(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      this.saveProgress(data);
      this.updateUI();
      this.showNotification('Progress imported successfully!');
    } catch (error) {
      console.error('Error importing progress:', error);
      this.showNotification('Failed to import progress', 'error');
    }
  }

  /**
   * Clear all progress
   */
  clearProgress() {
    if (confirm('Are you sure you want to clear all progress? This cannot be undone.')) {
      localStorage.removeItem(this.storageKey);
      this.updateUI();
      this.showNotification('Progress cleared');
    }
  }

  /**
   * Update UI elements with current progress
   */
  updateUI() {
    const stats = this.getStats();
    
    // Update progress percentage
    document.querySelectorAll('.progress-percentage').forEach(el => {
      el.textContent = `${stats.percentage}%`;
    });

    // Update progress bar
    document.querySelectorAll('.progress-bar-fill').forEach(el => {
      el.style.width = `${stats.percentage}%`;
    });

    // Update completion count
    document.querySelectorAll('.completion-count').forEach(el => {
      el.textContent = `${stats.completed} / ${this.totalLessons}`;
    });

    // Update checkbox for current lesson
    const currentLesson = this.getCurrentLessonId();
    if (currentLesson) {
      const checkbox = document.getElementById('lesson-complete-checkbox');
      if (checkbox) {
        checkbox.checked = this.isComplete(currentLesson);
      }

      const button = document.getElementById('mark-complete-button');
      if (button) {
        if (this.isComplete(currentLesson)) {
          button.textContent = '✓ Completed';
          button.classList.add('completed');
        } else {
          button.textContent = 'Mark as Complete';
          button.classList.remove('completed');
        }
      }
    }
  }

  /**
   * Get current lesson ID from page URL
   * @returns {string|null}
   */
  getCurrentLessonId() {
    const path = window.location.pathname;
    const match = path.match(/lessons\/(day-\d+-[^/]+)/);
    return match ? match[1] : null;
  }

  /**
   * Toggle completion status for current lesson
   */
  toggleCurrentLesson() {
    const lessonId = this.getCurrentLessonId();
    if (!lessonId) return;

    if (this.isComplete(lessonId)) {
      this.markIncomplete(lessonId);
    } else {
      this.markComplete(lessonId);
    }
  }

  /**
   * Show a notification message
   * @param {string} message - Message to display
   * @param {string} type - Notification type (success, error, info)
   */
  showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `progress-notification notification-${type}`;
    notification.textContent = message;
    notification.setAttribute('role', 'status');
    notification.setAttribute('aria-live', 'polite');

    // Add to document
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * Initialize progress tracking UI
   */
  init() {
    // Add progress widget to page
    this.addProgressWidget();

    // Add lesson completion button
    this.addCompletionButton();

    // Update UI with current progress
    this.updateUI();

    // Listen for storage changes (sync across tabs)
    window.addEventListener('storage', (e) => {
      if (e.key === this.storageKey) {
        this.updateUI();
      }
    });
  }

  /**
   * Add progress widget to page
   */
  addProgressWidget() {
    const stats = this.getStats();
    
    const widget = document.createElement('div');
    widget.className = 'progress-widget';
    widget.innerHTML = `
      <div class="progress-header">
        <h3>Your Progress</h3>
      </div>
      <div class="progress-bar">
        <div class="progress-bar-fill" style="width: ${stats.percentage}%"></div>
      </div>
      <div class="progress-stats">
        <span class="completion-count">${stats.completed} / ${this.totalLessons}</span>
        <span class="progress-percentage">${stats.percentage}%</span>
      </div>
      <div class="progress-actions">
        <button onclick="progressTracker.exportToFile()" aria-label="Export progress">
          Export
        </button>
        <button onclick="progressTracker.showImportDialog()" aria-label="Import progress">
          Import
        </button>
      </div>
    `;

    // Add to sidebar if it exists
    const sidebar = document.querySelector('.md-sidebar--secondary .md-sidebar__scrollwrap');
    if (sidebar) {
      sidebar.insertBefore(widget, sidebar.firstChild);
    }
  }

  /**
   * Add completion button to lesson page
   */
  addCompletionButton() {
    const lessonId = this.getCurrentLessonId();
    if (!lessonId) return;

    const content = document.querySelector('.md-content__inner');
    if (!content) return;

    const isComplete = this.isComplete(lessonId);
    
    const button = document.createElement('button');
    button.id = 'mark-complete-button';
    button.className = `lesson-complete-button ${isComplete ? 'completed' : ''}`;
    button.textContent = isComplete ? '✓ Completed' : 'Mark as Complete';
    button.onclick = () => this.toggleCurrentLesson();
    button.setAttribute('aria-label', isComplete ? 'Mark lesson as incomplete' : 'Mark lesson as complete');

    // Insert at the top of the content
    content.insertBefore(button, content.firstChild);
  }

  /**
   * Export progress to file
   */
  exportToFile() {
    const data = this.exportProgress();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coding-mba-progress-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showNotification('Progress exported!');
  }

  /**
   * Show import dialog
   */
  showImportDialog() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          this.importProgress(event.target.result);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }
}

// Global instance
const progressTracker = new ProgressTracker();

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => progressTracker.init());
} else {
  progressTracker.init();
}

// Export for use in other scripts
window.ProgressTracker = ProgressTracker;
window.progressTracker = progressTracker;
