# Graph Report - src  (2026-06-24)

## Corpus Check
- 190 files · ~89,279 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 753 nodes · 1478 edges · 58 communities (41 shown, 17 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Code Playground & UI Utilities|Code Playground & UI Utilities]]
- [[_COMMUNITY_HomeCurriculum Pages & SEO|Home/Curriculum Pages & SEO]]
- [[_COMMUNITY_Spaced Repetition Review System|Spaced Repetition Review System]]
- [[_COMMUNITY_Search System|Search System]]
- [[_COMMUNITY_Learning Analytics Dashboard|Learning Analytics Dashboard]]
- [[_COMMUNITY_Navigation & Shortcuts|Navigation & Shortcuts]]
- [[_COMMUNITY_Content Loader Immutability Helpers|Content Loader Immutability Helpers]]
- [[_COMMUNITY_Notebook Viewer & Notes|Notebook Viewer & Notes]]
- [[_COMMUNITY_Exercises & Quiz Store|Exercises & Quiz Store]]
- [[_COMMUNITY_Markdown Renderer Core|Markdown Renderer Core]]
- [[_COMMUNITY_Python Runner & Pyodide Sandbox|Python Runner & Pyodide Sandbox]]
- [[_COMMUNITY_Table of Contents & Slugs|Table of Contents & Slugs]]
- [[_COMMUNITY_App Routing|App Routing]]
- [[_COMMUNITY_Progress Store & Phase Overview|Progress Store & Phase Overview]]
- [[_COMMUNITY_Lesson Page & Day Tokens|Lesson Page & Day Tokens]]
- [[_COMMUNITY_Gamification Store|Gamification Store]]
- [[_COMMUNITY_User Preferences Store|User Preferences Store]]
- [[_COMMUNITY_Case Studies & Content Stats|Case Studies & Content Stats]]
- [[_COMMUNITY_Progress Tracker Utility|Progress Tracker Utility]]
- [[_COMMUNITY_Frontmatter Parsing|Frontmatter Parsing]]
- [[_COMMUNITY_Sidebar Navigation|Sidebar Navigation]]
- [[_COMMUNITY_Theme Context|Theme Context]]
- [[_COMMUNITY_Related Lessons|Related Lessons]]
- [[_COMMUNITY_Confetti Effects|Confetti Effects]]
- [[_COMMUNITY_Day Token Core Logic|Day Token Core Logic]]
- [[_COMMUNITY_Exercise Extractor|Exercise Extractor]]
- [[_COMMUNITY_Reading Time & Lesson Header|Reading Time & Lesson Header]]
- [[_COMMUNITY_Markdown Block Parsing Helpers|Markdown Block Parsing Helpers]]
- [[_COMMUNITY_Link Safety|Link Safety]]
- [[_COMMUNITY_Settings Page|Settings Page]]
- [[_COMMUNITY_Curriculum Config|Curriculum Config]]
- [[_COMMUNITY_MapList Toggle|Map/List Toggle]]
- [[_COMMUNITY_Swipe Hook|Swipe Hook]]
- [[_COMMUNITY_Exercise Card|Exercise Card]]
- [[_COMMUNITY_Loading Skeleton|Loading Skeleton]]
- [[_COMMUNITY_Main Entry Tests|Main Entry Tests]]
- [[_COMMUNITY_Remark Code Meta Plugin|Remark Code Meta Plugin]]
- [[_COMMUNITY_Content Loader Lesson Helpers|Content Loader Lesson Helpers]]
- [[_COMMUNITY_Custom Cursor|Custom Cursor]]
- [[_COMMUNITY_Prerequisite Pills|Prerequisite Pills]]
- [[_COMMUNITY_Scroll Progress|Scroll Progress]]
- [[_COMMUNITY_Glossary|Glossary]]
- [[_COMMUNITY_Lesson Tests|Lesson Tests]]
- [[_COMMUNITY_Glossary Term|Glossary Term]]
- [[_COMMUNITY_Glossary Tooltips|Glossary Tooltips]]
- [[_COMMUNITY_Test Setup|Test Setup]]
- [[_COMMUNITY_Content Validation Script Tests|Content Validation Script Tests]]
- [[_COMMUNITY_Frontmatter Types|Frontmatter Types]]
- [[_COMMUNITY_Remark Callouts Plugin|Remark Callouts Plugin]]
- [[_COMMUNITY_Markdown Renderer Tests|Markdown Renderer Tests]]
- [[_COMMUNITY_Search Index Perf Tests|Search Index Perf Tests]]
- [[_COMMUNITY_Search Index Tests|Search Index Tests]]
- [[_COMMUNITY_Sidebar Perf Tests|Sidebar Perf Tests]]
- [[_COMMUNITY_Exercise Extractor Types|Exercise Extractor Types]]

## God Nodes (most connected - your core abstractions)
1. `useProgressStore` - 21 edges
2. `initializeContent()` - 17 edges
3. `getAllPhases()` - 17 edges
4. `getLessonsByPhase()` - 14 edges
5. `dayTokenToProgressId()` - 14 edges
6. `getLesson()` - 13 edges
7. `getCurriculumMetadata()` - 13 edges
8. `ensureHydrated()` - 13 edges
9. `Lesson()` - 12 edges
10. `Home()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `getLegacyPalette()` --calls--> `getStoredString()`  [EXTRACTED]
  stores/userPreferencesStore.ts → utils/safeStorage.ts
- `App()` --calls--> `useUserPreferencesStore`  [EXTRACTED]
  App.tsx → stores/userPreferencesStore.ts
- `ExerciseWidget()` --calls--> `useQuizStore`  [EXTRACTED]
  components/ExerciseWidget.tsx → stores/quizStore.ts
- `LinkComponent()` --calls--> `getSecureLinkAttributes()`  [EXTRACTED]
  components/MarkdownRenderer.tsx → utils/linkSafety.ts
- `MasteryCheck()` --calls--> `buildFAQSchema()`  [EXTRACTED]
  components/MasteryCheck.tsx → utils/seoSchemas.ts

## Import Cycles
- None detected.

## Communities (58 total, 17 thin omitted)

### Community 0 - "Code Playground & UI Utilities"
Cohesion: 0.06
Nodes (28): CodePlayground, CodePlaygroundHandle, CodePlaygroundProps, highlightTheme, SubmissionResult, CopyButton(), CopyButtonProps, ErrorBoundary (+20 more)

### Community 1 - "Home/Curriculum Pages & SEO"
Cohesion: 0.07
Nodes (25): EditorialCover, MasteryCheck(), MasteryCheckProps, BreadcrumbItem, buildBreadcrumbSchema(), SEOHead(), SEOHeadProps, TerminalDashboard (+17 more)

### Community 2 - "Spaced Repetition Review System"
Cohesion: 0.10
Nodes (32): useProgressStoreMock, getAllReviewCardSeeds(), DayExerciseMap, DayExerciseMapSchema, getMap(), markExerciseComplete(), addDays(), clampEase() (+24 more)

### Community 3 - "Search System"
Cohesion: 0.09
Nodes (32): SearchPalette(), SearchPaletteProps, useDebounce(), SearchResults(), lessons, mockNavigate, TestComponent(), highlightText() (+24 more)

### Community 4 - "Learning Analytics Dashboard"
Cohesion: 0.07
Nodes (29): App(), AnimatedCounter(), AnimatedCounterProps, ProgressBarProps, useLearningAnalytics(), ProgressDashboard(), ACHIEVEMENTS, addElapsed() (+21 more)

### Community 5 - "Navigation & Shortcuts"
Cohesion: 0.07
Nodes (26): MobileNav(), Navbar(), NavbarProps, formatPath(), StatusTicker(), streakBlocks(), useGamificationStore, toastInfoMock (+18 more)

### Community 6 - "Content Loader Immutability Helpers"
Cohesion: 0.07
Nodes (26): CaseStudy, caseStudyFiles, ExtraFile, extrasFiles, freezeDayTokenArray(), freezeLesson(), freezePhase(), freezeStringArray() (+18 more)

### Community 7 - "Notebook Viewer & Notes"
Cohesion: 0.09
Nodes (16): BreadcrumbItem, BreadcrumbProps, CellOutputsProps, mergeCells(), MergedBlock, MergedBlockRendererProps, NotebookViewer(), formatRelative() (+8 more)

### Community 8 - "Exercises & Quiz Store"
Cohesion: 0.12
Nodes (16): ExercisesEmptyIllustration(), FreshStartIllustration(), IllustrationProps, SearchEmptyIllustration(), ExerciseWidget(), Exercises(), hydrateQuizStore(), QuizAttempt (+8 more)

### Community 9 - "Markdown Renderer Core"
Cohesion: 0.08
Nodes (14): CodePlayground, customTheme, ExerciseWidget, glossaryDefinitionsByLowerTerm, InteractiveBlock, lessonSanitizerSchema, markdownComponents, MarkdownNodeWithPosition (+6 more)

### Community 10 - "Python Runner & Pyodide Sandbox"
Cohesion: 0.12
Nodes (14): PythonRunner, PythonRunnerHandle, PythonRunnerProps, PyodideInterface, PyodideRunResult, RunPythonOptions, usePyodide(), Window (+6 more)

### Community 11 - "Table of Contents & Slugs"
Cohesion: 0.12
Nodes (11): TableOfContents, TableOfContentsProps, TocItem, TocItemProps, MockIntersectionObserver, rehypeSlugCustom(), createSlugger(), extractTextFromReactNode() (+3 more)

### Community 12 - "App Routing"
Cohesion: 0.10
Nodes (19): CaseStudies, ContentStats, Curriculum, CustomCursor, Exercises, Home, KeyboardShortcutsOverlay, Lesson (+11 more)

### Community 13 - "Progress Store & Phase Overview"
Cohesion: 0.17
Nodes (14): PhaseOverview(), calculateStreakDays(), mergeLegacyLastVisited(), normalizePersistedState(), parseValidCompletionDates(), parseValidDays(), PersistedProgressSchema, PhaseProgress (+6 more)

### Community 14 - "Lesson Page & Day Tokens"
Cohesion: 0.25
Nodes (14): ExerciseWidgetProps, solutionTheme, Lesson(), getAdjacentLessons(), getLesson(), initializeContent(), compareDayTokens(), dayTokenFromPath() (+6 more)

### Community 15 - "Gamification Store"
Cohesion: 0.13
Nodes (12): AchievementId, AchievementMeta, DailyChallenge, DailyChallengeSchema, GamificationStore, hydrateGamificationStore(), LeaderboardEntry, LeaderboardEntrySchema (+4 more)

### Community 16 - "User Preferences Store"
Cohesion: 0.12
Nodes (11): CodeLanguagePreference, CodeLanguagePreferenceSchema, ColorPaletteSchema, DensityPreference, DensityPreferenceSchema, FontSizePreference, FontSizePreferenceSchema, getLegacyPalette() (+3 more)

### Community 17 - "Case Studies & Content Stats"
Cohesion: 0.19
Nodes (9): CaseStudies(), Tab, ContentStats(), getAllCaseStudies(), getAllLessons(), getAllProjects(), getContentStats(), getTotalReadingTime() (+1 more)

### Community 18 - "Progress Tracker Utility"
Cohesion: 0.36
Nodes (13): clearAllProgress(), ensureHydrated(), getCompletedCount(), getCompletedForPhase(), getCompletedLessons(), getLastVisited(), getPhaseProgress(), getStreakDays() (+5 more)

### Community 19 - "Frontmatter Parsing"
Cohesion: 0.32
Nodes (10): BLOCKED_KEYS, coerceScalar(), normalizeMarkdownLineEndings(), parseMarkdown(), parseNormalizedMarkdown(), Frontmatter, normalizeMarkdownLineEndings(), ParsedMarkdown (+2 more)

### Community 20 - "Sidebar Navigation"
Cohesion: 0.21
Nodes (7): PrimaryItemProps, Sidebar(), SidebarProps, propsAreEqual(), SidebarPhaseGroup(), resolveChallengeCandidates(), getLessonsByPhase()

### Community 21 - "Theme Context"
Cohesion: 0.33
Nodes (6): ThemeContext, ThemeContextType, DARK_PALETTES, ThemeProvider(), useTheme(), ColorPalette

### Community 22 - "Related Lessons"
Cohesion: 0.24
Nodes (8): RelatedLessons(), SidebarPhaseGroupProps, getRelatedLessons(), Lesson, Phase, ReviewCardSeed, DayToken, SearchDocument

### Community 23 - "Confetti Effects"
Cohesion: 0.40
Nodes (7): prefersReducedMotion(), safeConfetti(), triggerCurriculumFireworks(), triggerDayExercisesCompleteConfetti(), triggerPhaseUnlockConfetti(), triggerQuizAcedConfetti(), triggerSparkle()

### Community 24 - "Day Token Core Logic"
Cohesion: 0.36
Nodes (9): compareDayTokens(), dayTokenFromPath(), dayTokenFromReference(), dayTokenToProgressId(), extractDayToken(), normalizeDayToken(), parseCache, parseDayToken() (+1 more)

### Community 25 - "Exercise Extractor"
Cohesion: 0.31
Nodes (6): Assert, Equal, ExtractedExerciseShape, typeAssertions, extractExercisesFromContent(), extractExercises()

### Community 26 - "Reading Time & Lesson Header"
Cohesion: 0.48
Nodes (3): EditorialLessonHeaderProps, ReadingTime(), getReadingTime()

### Community 27 - "Markdown Block Parsing Helpers"
Cohesion: 0.33
Nodes (7): extractCodeBlock(), extractLabeledTextFromParagraph(), findInteractiveBlocks(), getHeadingText(), getNodeEndOffset(), getNodeStartOffset(), isLabeledParagraph()

### Community 28 - "Link Safety"
Cohesion: 0.43
Nodes (5): LinkComponent(), getSecureLinkAttributes(), LinkProps, normalizeAndValidateHref(), SAFE_SCHEMES

### Community 29 - "Settings Page"
Cohesion: 0.33
Nodes (3): PALETTES, SettingsPage(), useUserPreferencesStore

### Community 30 - "Curriculum Config"
Cohesion: 0.29
Nodes (6): DifficultyConfig, difficultyConfigSchema, DifficultyInfo, difficultyInfoSchema, PhaseIcons, phaseIconsSchema

### Community 31 - "Map/List Toggle"
Cohesion: 0.33
Nodes (3): MapListToggle, ToggleProps, ViewProps

### Community 32 - "Swipe Hook"
Cohesion: 0.47
Nodes (3): SwipeConfig, useSwipe(), SwipeTestComponent()

### Community 35 - "Main Entry Tests"
Cohesion: 0.40
Nodes (3): appMarker, renderMock, toasterMarker

### Community 37 - "Content Loader Lesson Helpers"
Cohesion: 0.50
Nodes (5): buildReviewCardsFromLesson(), extractExercisesFromLesson(), extractHeadingsFromLessonContent(), getLessonIdPrefix(), normalizeIdPart()

### Community 42 - "Lesson Tests"
Cohesion: 0.50
Nodes (3): mockGetCompletedLessons, { mockSetLastVisited, mockToastSuccess, mockToastInfo }, mockToggleLessonComplete

### Community 44 - "Glossary Tooltips"
Cohesion: 0.67
Nodes (3): addGlossaryTooltips(), ParagraphWithGlossary(), processGlossaryChildren()

## Knowledge Gaps
- **220 isolated node(s):** `Home`, `Lesson`, `PhaseOverview`, `Curriculum`, `SearchResults` (+215 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useProgressStore` connect `Progress Store & Phase Overview` to `Home/Curriculum Pages & SEO`, `Learning Analytics Dashboard`, `Navigation & Shortcuts`, `Lesson Page & Day Tokens`, `Gamification Store`, `Progress Tracker Utility`, `Sidebar Navigation`, `Confetti Effects`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `useUserPreferencesStore` connect `Settings Page` to `Learning Analytics Dashboard`, `App Routing`, `Lesson Page & Day Tokens`, `User Preferences Store`, `Theme Context`, `Confetti Effects`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `Home`, `Lesson`, `PhaseOverview` to the rest of the system?**
  _220 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Code Playground & UI Utilities` be split into smaller, more focused modules?**
  _Cohesion score 0.0611764705882353 - nodes in this community are weakly interconnected._
- **Should `Home/Curriculum Pages & SEO` be split into smaller, more focused modules?**
  _Cohesion score 0.07183673469387755 - nodes in this community are weakly interconnected._
- **Should `Spaced Repetition Review System` be split into smaller, more focused modules?**
  _Cohesion score 0.09805735430157261 - nodes in this community are weakly interconnected._
- **Should `Search System` be split into smaller, more focused modules?**
  _Cohesion score 0.09302325581395349 - nodes in this community are weakly interconnected._