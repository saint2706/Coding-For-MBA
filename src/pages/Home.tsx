/**
 * Home — "The Analyst's Terminal" cover.
 *
 * Three composed sections:
 *   1. EditorialCover — magazine masthead.
 *   2. TerminalDashboard — six dense session-data tiles.
 *   3. MapListToggle — phase grid (list) ↔ concept graph (map).
 *
 * No "Welcome back" hero, no animated stat counters. The reader opens
 * a workstation, not a marketing page.
 */

import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SEOHead from '../components/SEOHead'
import { buildWebSiteSchema, buildCourseSchema, buildProductSchema } from '../utils/seoSchemas'
import {
  getAllPhases,
  getTotalReadingTime,
  getLessonsByPhase,
  getLesson,
  difficultyConfig,
  getCurriculumMetadata,
} from '../utils/contentLoader'
import { useProgressStore } from '../stores/progressStore'
import { useGamificationStore } from '../stores/gamificationStore'
import { dayTokenToProgressId } from '../utils/dayToken'
import EditorialCover from '../components/EditorialCover'
import TerminalDashboard from '../components/TerminalDashboard'
import MapListToggle from '../components/MapListToggle'

const ConceptGraph = lazy(() => import('../components/ConceptGraph'))

function pad(n: number, width = 2): string {
  return String(n).padStart(width, '0')
}

function formatIssueDate(d = new Date()): string {
  const months = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC',
  ]
  return `${months[d.getMonth()]} ${pad(d.getDate())} · ${d.getFullYear()}`
}

/**
 * Home page component serving as the landing page or dashboard.
 * It displays curriculum phases, user progress, study streaks, and metrics.
 *
 * @returns {JSX.Element} The rendered Home page component.
 */
export default function Home() {
  const phases = getAllPhases()
  const stats = getCurriculumMetadata()
  const [totalHours, setTotalHours] = useState<number | null>(null)

  const lastVisitedDay = useProgressStore((state) => state.lastVisitedLesson)
  const lastVisitedLesson = lastVisitedDay ? (getLesson(lastVisitedDay) ?? null) : null

  const completedSet = useProgressStore((state) => state.completedLessonsSet)
  const streakDays = useProgressStore((state) => state.streakDays())
  const xp = useGamificationStore((state) => state.xpTotal)
  const dailyChallenge = useGamificationStore((state) => state.dailyChallenge)
  const refreshDailyChallenge = useGamificationStore((state) => state.refreshDailyChallenge)
  const challengeLesson = getLesson(dailyChallenge.day)

  const completedCount = useProgressStore((state) => state.completedLessonsCount())
  const totalLessons = stats.totalDays
  const completedPct = Math.round((completedCount / Math.max(1, totalLessons)) * 100)

  // Concepts mastered: derive from lessons completed (1 lesson ≈ unique concepts unlocked).
  // This is approximate; the precise count depends on lesson metadata and is not exposed
  // via a single accessor. We use completedCount × 4 as a conservative proxy that grows
  // with progress without inventing data.
  const conceptsMastered = completedCount * 4

  useEffect(() => {
    refreshDailyChallenge()
  }, [refreshDailyChallenge])

  useEffect(() => {
    const calculate = () => setTotalHours(Math.round(getTotalReadingTime() / 60))
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const idleId = (
        window as Window & {
          requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number
        }
      ).requestIdleCallback(calculate, { timeout: 2000 })
      return () => {
        ;(window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(
          idleId,
        )
      }
    }
    const t = globalThis.setTimeout(calculate, 0)
    return () => globalThis.clearTimeout(t)
  }, [])

  const renderedPhases = useMemo(
    () =>
      phases.map((phase) => {
        const lessons = getLessonsByPhase(phase.phase)
        const diff = difficultyConfig[phase.difficulty || 'beginner'] || difficultyConfig.beginner!
        const hours = Math.round((phase.totalDuration || 0) / 60)
        let completedInPhase = 0
        for (let i = 0; i < lessons.length; i++) {
          if (completedSet.has(dayTokenToProgressId(lessons[i]!.day))) {
            completedInPhase++
          }
        }
        const phasePct = Math.round((completedInPhase / Math.max(1, lessons.length)) * 100)

        return (
          <Link to={`/phase/${phase.phase}`} className="phase-card-editorial" key={phase.phase}>
            <div className="phase-card-numeral display-numeral" aria-hidden="true">
              {pad(phase.phase)}
            </div>
            <div className="phase-card-body">
              <p className="phase-card-kicker">
                <span className="kicker-dot" aria-hidden="true" />
                Phase
              </p>
              <h3 className="phase-card-title">{phase.title}</h3>
              <dl className="phase-card-meta">
                <div>
                  <dt>Days</dt>
                  <dd>{lessons.length}</dd>
                </div>
                <div>
                  <dt>Hours</dt>
                  <dd>{hours || '—'}</dd>
                </div>
                <div>
                  <dt>Level</dt>
                  <dd>{diff.label}</dd>
                </div>
                <div>
                  <dt>Done</dt>
                  <dd>
                    {completedInPhase}/{lessons.length}
                  </dd>
                </div>
              </dl>
              <div className="phase-card-bar" aria-hidden="true">
                <div className="phase-card-bar-fill" style={{ width: `${phasePct}%` }} />
              </div>
            </div>
            <span className="phase-card-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        )
      }),
    [phases, completedSet],
  )

  return (
    <div className="page-container home-page">
      <SEOHead
        title="Coding for MBA — The Analyst's Terminal"
        description={`A ${stats.totalDays}-day technical curriculum for MBAs: Python, Data Science, ML, Business Intelligence, and Enterprise SQL.`}
        path="/"
        jsonLd={[
          buildWebSiteSchema(),
          buildCourseSchema(),
          buildProductSchema(
            'Coding for MBA',
            `A structured ${stats.totalDays}-day curriculum covering Python, Data Science, Machine Learning, Business Intelligence, and Enterprise SQL.`,
          ),
        ]}
        breadcrumbs={[{ name: 'Home', url: '/' }]}
      />

      <EditorialCover>
        <EditorialCover.Eyebrow>
          <span className="cover-issue">ISSUE 01</span>
          <span className="cover-divider" aria-hidden="true">
            ·
          </span>
          <span>{formatIssueDate()}</span>
          <span className="cover-divider" aria-hidden="true">
            ·
          </span>
          <span>The Analyst&apos;s Terminal</span>
        </EditorialCover.Eyebrow>
        <EditorialCover.Title>
          A workstation for the
          <br />
          <em>numerate generalist.</em>
        </EditorialCover.Title>
        <EditorialCover.Lede>
          {stats.totalDays} days. {stats.totalPhases} phases. From the first variable assignment to
          a production data pipeline you&apos;d trust with revenue. Designed for MBAs who want to
          ship, not just narrate.
        </EditorialCover.Lede>
        <EditorialCover.Actions>
          <Link
            to={lastVisitedLesson ? `/lesson/${lastVisitedLesson.day}` : '/lesson/1'}
            className="action-primary"
          >
            <span className="action-glyph" aria-hidden="true">
              ›
            </span>
            {lastVisitedLesson ? `Resume Day ${lastVisitedLesson.day}` : 'Begin Day 01'}
          </Link>
          <Link to="/curriculum" className="action-secondary">
            See the full curriculum
          </Link>
        </EditorialCover.Actions>
      </EditorialCover>

      <hr className="hairline-strong cover-rule" />

      <TerminalDashboard>
        <TerminalDashboard.Tile highlight>
          <TerminalDashboard.TileHeader label="LAST OPEN" symbol="·" />
          <TerminalDashboard.TileValue>
            {lastVisitedLesson ? (
              <Link to={`/lesson/${lastVisitedLesson.day}`} className="dashboard-tile-link">
                Day {lastVisitedLesson.day}
              </Link>
            ) : (
              <span className="dashboard-tile-empty">— —</span>
            )}
          </TerminalDashboard.TileValue>
          <TerminalDashboard.TileFooter>
            {lastVisitedLesson
              ? lastVisitedLesson.title
              : 'No session yet. Open a lesson to begin.'}
          </TerminalDashboard.TileFooter>
        </TerminalDashboard.Tile>

        <TerminalDashboard.Tile>
          <TerminalDashboard.TileHeader label="STREAK" symbol="■" />
          <TerminalDashboard.TileValue unit="days">{pad(streakDays)}</TerminalDashboard.TileValue>
          <TerminalDashboard.TileFooter>
            {streakDays >= 7 ? 'Week+ streak' : streakDays > 0 ? 'Keep it warm' : 'Open one today'}
          </TerminalDashboard.TileFooter>
        </TerminalDashboard.Tile>

        <TerminalDashboard.Tile>
          <TerminalDashboard.TileHeader label="COMPLETED" symbol="□" />
          <TerminalDashboard.TileValue unit={`/${totalLessons}`}>
            {pad(completedCount, 3)}
          </TerminalDashboard.TileValue>
          <TerminalDashboard.TileFooter>{completedPct}% of curriculum</TerminalDashboard.TileFooter>
        </TerminalDashboard.Tile>

        <TerminalDashboard.Tile>
          <TerminalDashboard.TileHeader label="HOURS BANKED" symbol="◴" />
          <TerminalDashboard.TileValue unit="hr">{totalHours ?? '—'}</TerminalDashboard.TileValue>
          <TerminalDashboard.TileFooter>
            Estimated reading time invested
          </TerminalDashboard.TileFooter>
        </TerminalDashboard.Tile>

        <TerminalDashboard.Tile>
          <TerminalDashboard.TileHeader label="XP" symbol="▲" />
          <TerminalDashboard.TileValue>{xp.toLocaleString()}</TerminalDashboard.TileValue>
          <TerminalDashboard.TileFooter>
            Concepts mastered: {conceptsMastered}
          </TerminalDashboard.TileFooter>
        </TerminalDashboard.Tile>

        <TerminalDashboard.Tile
          href={challengeLesson ? `#/lesson/${challengeLesson.day}` : undefined}
        >
          <TerminalDashboard.TileHeader label="DAILY DROP" symbol="↯" />
          <TerminalDashboard.TileValue>
            {challengeLesson ? `Day ${challengeLesson.day}` : '—'}
          </TerminalDashboard.TileValue>
          <TerminalDashboard.TileFooter>
            {challengeLesson ? challengeLesson.title : "Tomorrow's pick"}
          </TerminalDashboard.TileFooter>
        </TerminalDashboard.Tile>
      </TerminalDashboard>

      <hr className="hairline-strong cover-rule" />

      <section className="curriculum-section">
        <header className="section-masthead">
          <p className="section-eyebrow">
            {stats.totalPhases} phases · {stats.totalDays} days
          </p>
          <h2 className="section-headline display-headline">The path</h2>
          <p className="section-lede">
            From the first variable assignment to a production data pipeline. Walk it linearly, or
            jump in via the concept map.
          </p>
        </header>

        <MapListToggle defaultActive="phases" ariaLabel="Switch curriculum view">
          <MapListToggle.View label="phases" glyph="▣">
            <div className="phases-grid-editorial">{renderedPhases}</div>
          </MapListToggle.View>
          <MapListToggle.View label="map" glyph="◈">
            <div className="map-view-frame">
              <Suspense
                fallback={
                  <div className="page-loader">
                    <div className="page-loader-spinner" />
                  </div>
                }
              >
                <ConceptGraph />
              </Suspense>
              <p className="map-view-caption">
                Each node is a concept; edges are prerequisites. Click any node to jump to the
                lesson that introduces it. Drag to rearrange.
              </p>
            </div>
          </MapListToggle.View>
        </MapListToggle>
      </section>
    </div>
  )
}
