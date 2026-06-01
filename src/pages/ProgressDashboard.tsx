/**
 * Progress Dashboard Page
 *
 * A consolidated view of the user's learning journey.
 *
 * Key Responsibilities:
 * - Display gamification stats (XP, level, streak, achievements).
 * - Visualize time spent and learning habits.
 * - Highlight weak areas based on quiz performance.
 * - Show detailed progress per phase.
 */

import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import SEOHead from '../components/SEOHead'
import {
  getAllPhases,
  getLessonsByPhase,
  getLesson,
  phaseIcons,
  difficultyConfig,
  getCurriculumMetadata,
} from '../utils/contentLoader'
import { dayTokenToProgressId } from '../utils/dayToken'
import ProgressBar from '../components/ProgressBar'
import Breadcrumb from '../components/Breadcrumb'
import AnimatedCounter from '../components/AnimatedCounter'
import { formatDuration, useLearningAnalyticsStore } from '../stores/learningAnalyticsStore'
import { ACHIEVEMENTS, useGamificationStore } from '../stores/gamificationStore'
import { FreshStartIllustration } from '../components/EmptyStateIllustrations'
import { useProgressStore } from '../stores/progressStore'

/**
 * Progress dashboard page component.
 *
 * Displays comprehensive progress tracking including:
 * - Overall completion statistics (percentage, completed count, remaining)
 * - Visual progress bar for entire curriculum
 * - Lesson heatmap showing all 140 days with completion status
 * - Per-phase progress breakdown with links to each phase
 * - Option to clear all progress (with confirmation)
 *
 * @returns The rendered progress dashboard page
 */
export default function ProgressDashboard() {
  const phases = getAllPhases()
  const { totalDays: totalLessons } = getCurriculumMetadata()

  const completedLessons = useProgressStore((state) => state.completedLessons)
  const completedSet = useMemo(() => new Set(completedLessons), [completedLessons])
  const completedCount = useProgressStore((state) => state.completedLessonsCount())

  const overallPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  const handleClearProgress = () => {
    if (window.confirm('Are you sure you want to clear all progress? This cannot be undone.')) {
      useProgressStore.getState().clearAllProgress()
    }
  }

  const timeByDate = useLearningAnalyticsStore((state) => state.timeByDate)
  const totalLearningMs = useMemo(
    () => useLearningAnalyticsStore.getState().totalLearningMs(),
    [timeByDate],
  )
  const thisWeekLearningMs = useMemo(
    () => useLearningAnalyticsStore.getState().weekLearningMs(),
    [timeByDate],
  )
  const todayLearningMs = useMemo(
    () => useLearningAnalyticsStore.getState().todayLearningMs(),
    [timeByDate],
  )
  const studyStreak = useMemo(
    () => useLearningAnalyticsStore.getState().studyStreakDays(5),
    [timeByDate],
  )
  const completionStreak = useProgressStore((state) => state.streakDays())
  const last7Days = useMemo(() => useLearningAnalyticsStore.getState().getLast7Days(), [timeByDate])

  const chartMax = Math.max(1, ...last7Days.map((item) => item.ms))

  const xpTotal = useGamificationStore((state) => state.xpTotal)
  const achievementsUnlocked = useGamificationStore((state) => state.achievementsUnlocked)
  const dailyChallenge = useGamificationStore((state) => state.dailyChallenge)
  const refreshDailyChallenge = useGamificationStore((state) => state.refreshDailyChallenge)
  const xpToNextMilestone = useGamificationStore((state) => state.xpToNextMilestone)
  const milestoneProgress = xpToNextMilestone()

  // ⚡ Bolt: Convert achievementsUnlocked to a Set to optimize O(N*M) lookups to O(N + M) during render.
  const earnedBadges = useMemo(() => {
    const unlockedSet = new Set(achievementsUnlocked)
    return ACHIEVEMENTS.filter((badge) => unlockedSet.has(badge.id))
  }, [achievementsUnlocked])

  const challengeLesson = getLesson(dailyChallenge.day)

  useEffect(() => {
    refreshDailyChallenge()
  }, [refreshDailyChallenge])


  const renderedHeatmapPhases = useMemo(
    () =>
      phases.map((phase) => {
        const lessons = getLessonsByPhase(phase.phase)
        const icon = phaseIcons[phase.phase - 1] || '📖'
        return (
          <div className="heatmap-phase" key={phase.phase}>
            <div className="heatmap-phase-label">
              <span>{icon}</span> P{phase.phase}
            </div>
            <div className="heatmap-cells">
              {(lessons || []).map((lesson) => {
                const done = completedSet.has(dayTokenToProgressId(lesson.day))
                return (
                  <Link
                    to={`/lesson/${lesson.day}`}
                    className={`heatmap-cell ${done ? 'done' : ''}`}
                    key={lesson.day}
                    title={`Day ${lesson.day}: ${lesson.title}${done ? ' ✓' : ''}`}
                  >
                    <span className="sr-only">
                      Day {lesson.day}: {lesson.title} {done ? '(completed)' : '(not completed)'}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        )
      }),
    [phases, completedSet],
  )

  const renderedProgressPhases = useMemo(
    () =>
      phases.map((phase) => {
        const lessons = getLessonsByPhase(phase.phase)
        let completedInPhaseCount = 0
        if (lessons) {
          for (let i = 0; i < lessons.length; i++) {
            if (completedSet.has(dayTokenToProgressId(lessons[i]!.day))) {
              completedInPhaseCount++
            }
          }
        }
        const icon = phaseIcons[phase.phase - 1] || '📖'
        const diff = difficultyConfig[phase.difficulty || 'beginner'] || difficultyConfig.beginner!

        return (
          <Link to={`/phase/${phase.phase}`} className="progress-phase-row" key={phase.phase}>
            <div className="progress-phase-info">
              <span className="progress-phase-icon">{icon}</span>
              <div>
                <span className="progress-phase-name">
                  Phase {phase.phase}: {phase.title}
                </span>
                <span
                  className="difficulty-badge"
                  style={{ color: diff.color, background: diff.bg, marginLeft: '0.5rem' }}
                >
                  {diff.label}
                </span>
              </div>
            </div>
            <ProgressBar completed={completedInPhaseCount} total={lessons?.length || 0} />
          </Link>
        )
      }),
    [phases, completedSet],
  )

  return (
    <div className="page-container">
      <SEOHead
        title="Your Progress"
        description="Track your progress through the 140-day Coding for MBA curriculum. View completion statistics, lesson heatmap, and per-phase breakdowns."
        path="/progress"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Progress', url: '/progress' },
        ]}
      />

      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Progress' }]} />

      <div className="section-header" style={{ marginBottom: '2rem' }}>
        <h1>Your Progress</h1>
        <p>Track your journey through the {totalLessons}-day curriculum.</p>
      </div>

      {completedCount === 0 && (
        <div
          className="exercises-empty glass-card"
          style={{ textAlign: 'center', padding: '2rem' }}
        >
          <FreshStartIllustration />
          <p>Your journey begins here — complete your first lesson to see progress!</p>
        </div>
      )}

      {/* Mobile glassmorphism stat cards grid */}
      <div className="progress-mobile-stats-grid">
        <div className="progress-mobile-stat-card glass-card">
          <span className="progress-mobile-stat-icon" aria-hidden="true">
            📊
          </span>
          <p className="progress-mobile-stat-value">
            <AnimatedCounter value={overallPct} suffix="%" />
          </p>
          <p className="progress-mobile-stat-label">Completed</p>
        </div>
        <div className="progress-mobile-stat-card glass-card">
          <span className="progress-mobile-stat-icon" aria-hidden="true">
            🔥
          </span>
          <p className="progress-mobile-stat-value">
            <AnimatedCounter value={completionStreak} />
          </p>
          <p className="progress-mobile-stat-label">Day Streak</p>
        </div>
        <div className="progress-mobile-stat-card glass-card">
          <span className="progress-mobile-stat-icon" aria-hidden="true">
            ⏱️
          </span>
          <p className="progress-mobile-stat-value">{formatDuration(totalLearningMs)}</p>
          <p className="progress-mobile-stat-label">Study Time</p>
        </div>
        <div className="progress-mobile-stat-card glass-card">
          <span className="progress-mobile-stat-icon" aria-hidden="true">
            ⭐
          </span>
          <p className="progress-mobile-stat-value">{xpTotal}</p>
          <p className="progress-mobile-stat-label">Total XP</p>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="progress-stats-card">
        <div className="progress-stat-big">
          <span className="progress-stat-value">
            <AnimatedCounter value={overallPct} suffix="%" />
          </span>
          <span className="progress-stat-label">Complete</span>
        </div>
        <div className="progress-stat-big">
          <span className="progress-stat-value">
            <AnimatedCounter value={completedCount} />
          </span>
          <span className="progress-stat-label">Lessons Done</span>
        </div>
        <div className="progress-stat-big">
          <span className="progress-stat-value">
            <AnimatedCounter value={totalLessons - completedCount} />
          </span>
          <span className="progress-stat-label">Remaining</span>
        </div>
      </div>

      <ProgressBar completed={completedCount} total={totalLessons} />

      <section className="gamification-card" aria-labelledby="gamification-heading">
        <div className="section-header" style={{ marginTop: '2.5rem', marginBottom: '1rem' }}>
          <h2 id="gamification-heading">Gamification</h2>
          <p>XP, badges, and your daily challenge — saved only on this device.</p>
        </div>

        <div className="gamification-summary-grid">
          <div className="progress-stat-big">
            <span className="progress-stat-value">{xpTotal}</span>
            <span className="progress-stat-label">XP Total</span>
          </div>
          <div className="progress-stat-big">
            <span className="progress-stat-value">{earnedBadges.length}</span>
            <span className="progress-stat-label">Badges Earned</span>
          </div>
          <div className="progress-stat-big">
            <span className="progress-stat-value">{milestoneProgress.next ?? 'MAX'}</span>
            <span className="progress-stat-label">Next XP Milestone</span>
          </div>
        </div>

        <div className="xp-milestone-track" aria-label="XP progress to next badge">
          <div className="xp-milestone-fill" style={{ width: `${milestoneProgress.percent}%` }} />
        </div>

        {challengeLesson && (
          <div className="daily-challenge-card">
            <div>
              <h3>Daily Challenge</h3>
              <p>
                Day {challengeLesson.day}: {challengeLesson.title}
              </p>
            </div>
            <Link className="continue-banner-cta" to={`/lesson/${challengeLesson.day}`}>
              Start challenge
            </Link>
          </div>
        )}

        <div className="badge-grid">
          {earnedBadges.length === 0 ? (
            <p className="progress-stat-label">
              No badges yet — complete your first lesson to begin.
            </p>
          ) : (
            earnedBadges.map((badge) => (
              <div className="badge-chip" key={badge.id} title={badge.description}>
                <span aria-hidden="true">{badge.icon}</span>
                <span>{badge.label}</span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="learning-analytics-card" aria-labelledby="learning-analytics-heading">
        <div className="section-header" style={{ marginTop: '2.5rem', marginBottom: '1rem' }}>
          <h2 id="learning-analytics-heading">Learning Analytics</h2>
          <p>Local-only study time summaries from your device.</p>
        </div>

        <div className="learning-analytics-grid">
          <div className="progress-stat-big">
            <span className="progress-stat-value">{formatDuration(totalLearningMs)}</span>
            <span className="progress-stat-label">Total Study Time</span>
          </div>
          <div className="progress-stat-big">
            <span className="progress-stat-value">{formatDuration(thisWeekLearningMs)}</span>
            <span className="progress-stat-label">This Week</span>
          </div>
          <div className="progress-stat-big">
            <span className="progress-stat-value">{formatDuration(todayLearningMs)}</span>
            <span className="progress-stat-label">Today</span>
          </div>
          <div className="progress-stat-big">
            <span className="progress-stat-value">{studyStreak}</span>
            <span className="progress-stat-label">Study Streak (5m+)</span>
          </div>
          <div className="progress-stat-big">
            <span className="progress-stat-value">{completionStreak}</span>
            <span className="progress-stat-label">Completion Streak</span>
          </div>
        </div>

        <svg
          className="learning-analytics-chart"
          viewBox="0 0 420 140"
          role="img"
          aria-label="Last 7 days time studied"
        >
          {last7Days.map((entry, index) => {
            const barWidth = 48
            const gap = 10
            const x = 16 + index * (barWidth + gap)
            const height = Math.round((entry.ms / chartMax) * 96)
            const y = 110 - height
            const dayLabel = entry.date.slice(5)
            return (
              <g key={entry.date}>
                <title>{`${entry.date}: ${formatDuration(entry.ms)}`}</title>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(2, height)}
                  rx={5}
                  className="learning-analytics-bar"
                />
                <text
                  x={x + barWidth / 2}
                  y={128}
                  textAnchor="middle"
                  className="learning-analytics-label"
                >
                  {dayLabel}
                </text>
              </g>
            )
          })}
        </svg>
      </section>

      <div className="settings-callout glass-card">
        <div>
          <strong>Preferences</strong>
          <p>Customize palette, font size, reading mode, and more.</p>
        </div>
        <Link to="/settings" className="continue-banner-cta">
          Open Settings
        </Link>
      </div>

      {/* Heatmap Grid */}
      <div className="section-header" style={{ marginTop: '2.5rem', marginBottom: '1rem' }}>
        <h2>Lesson Heatmap</h2>
        <p>Each cell represents a lesson. Completed lessons are highlighted.</p>
      </div>

      <div className="progress-heatmap">{renderedHeatmapPhases}</div>

      {/* Per-Phase Progress */}
      <div className="section-header" style={{ marginTop: '2.5rem', marginBottom: '1rem' }}>
        <h2>Progress by Phase</h2>
      </div>

      <div className="progress-phases-list">{renderedProgressPhases}</div>

      {/* Clear progress */}
      <div style={{ marginTop: '3rem', textAlign: 'center' }}>
        <button
          type="button"
          className="progress-clear-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          onClick={handleClearProgress}
          aria-label="Clear all progress"
        >
          Clear All Progress
        </button>
      </div>
    </div>
  )
}
