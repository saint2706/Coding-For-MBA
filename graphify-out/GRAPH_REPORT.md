# Graph Report - src  (2026-07-02)

## Corpus Check
- 200 files · ~89,279 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 966 nodes · 1916 edges · 79 communities (56 shown, 23 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 34 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_App Routing|App Routing]]
- [[_COMMUNITY_Interactive Block Extraction|Interactive Block Extraction]]
- [[_COMMUNITY_Main Entry Tests|Main Entry Tests]]
- [[_COMMUNITY_Custom Cursor|Custom Cursor]]
- [[_COMMUNITY_Back to Top & Breadcrumbs|Back to Top & Breadcrumbs]]
- [[_COMMUNITY_Case Studies Page|Case Studies Page]]
- [[_COMMUNITY_Copy Button & Exercise Widget|Copy Button & Exercise Widget]]
- [[_COMMUNITY_Prerequisite Pills|Prerequisite Pills]]
- [[_COMMUNITY_Editorial Cover|Editorial Cover]]
- [[_COMMUNITY_Editorial Lesson Header|Editorial Lesson Header]]
- [[_COMMUNITY_Exercise Card & Empty States|Exercise Card & Empty States]]
- [[_COMMUNITY_Error Boundary|Error Boundary]]
- [[_COMMUNITY_Glossary Term|Glossary Term]]
- [[_COMMUNITY_Keyboard Shortcuts|Keyboard Shortcuts]]
- [[_COMMUNITY_Lesson Code Actions|Lesson Code Actions]]
- [[_COMMUNITY_Swipe Hook|Swipe Hook]]
- [[_COMMUNITY_Markdown Renderer Core|Markdown Renderer Core]]
- [[_COMMUNITY_Link Safety|Link Safety]]
- [[_COMMUNITY_Exercise Widget Tests|Exercise Widget Tests]]
- [[_COMMUNITY_Gamification Store|Gamification Store]]
- [[_COMMUNITY_Mobile Nav & Route Prefetch|Mobile Nav & Route Prefetch]]
- [[_COMMUNITY_Navbar & Status Ticker|Navbar & Status Ticker]]
- [[_COMMUNITY_Progress Bar|Progress Bar]]
- [[_COMMUNITY_Related Lessons|Related Lessons]]
- [[_COMMUNITY_Python Runner & Pyodide Sandbox|Python Runner & Pyodide Sandbox]]
- [[_COMMUNITY_Content Stats|Content Stats]]
- [[_COMMUNITY_SEO Head & Not Found|SEO Head & Not Found]]
- [[_COMMUNITY_Search Palette & Debounce|Search Palette & Debounce]]
- [[_COMMUNITY_Sidebar Navigation|Sidebar Navigation]]
- [[_COMMUNITY_Sidebar Phase Group|Sidebar Phase Group]]
- [[_COMMUNITY_Table of Contents|Table of Contents]]
- [[_COMMUNITY_Terminal Dashboard|Terminal Dashboard]]
- [[_COMMUNITY_Remark Code Meta Plugin|Remark Code Meta Plugin]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Spaced Repetition Review System|Spaced Repetition Review System]]
- [[_COMMUNITY_Theme Context|Theme Context]]
- [[_COMMUNITY_Animated Counter|Animated Counter]]
- [[_COMMUNITY_Learning Analytics Hook|Learning Analytics Hook]]
- [[_COMMUNITY_Mastery Check|Mastery Check]]
- [[_COMMUNITY_Curriculum & Home Pages|Curriculum & Home Pages]]
- [[_COMMUNITY_Confetti Effects|Confetti Effects]]
- [[_COMMUNITY_Lesson & Day Token Core|Lesson & Day Token Core]]
- [[_COMMUNITY_Phase Overview & Progress Store|Phase Overview & Progress Store]]
- [[_COMMUNITY_Exercise Widget Tests|Exercise Widget Tests]]
- [[_COMMUNITY_Lesson Page Tests|Lesson Page Tests]]
- [[_COMMUNITY_Progress Dashboard Tests|Progress Dashboard Tests]]
- [[_COMMUNITY_Code Playground|Code Playground]]
- [[_COMMUNITY_Learning Analytics Store|Learning Analytics Store]]
- [[_COMMUNITY_Test Setup  localStorage Mock|Test Setup / localStorage Mock]]
- [[_COMMUNITY_Exercise Extractor|Exercise Extractor]]
- [[_COMMUNITY_Frontmatter Parsing|Frontmatter Parsing]]
- [[_COMMUNITY_Glossary|Glossary]]
- [[_COMMUNITY_Route Prefetching Tests|Route Prefetching Tests]]
- [[_COMMUNITY_Curriculum Config|Curriculum Config]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_SEO Schemas|SEO Schemas]]
- [[_COMMUNITY_Content Validation Script|Content Validation Script]]
- [[_COMMUNITY_Content Loader|Content Loader]]
- [[_COMMUNITY_MapList Toggle|Map/List Toggle]]
- [[_COMMUNITY_Day Token Core Logic|Day Token Core Logic]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Frontmatter Types|Frontmatter Types]]
- [[_COMMUNITY_SQL Playground & Runner|SQL Playground & Runner]]
- [[_COMMUNITY_Remark Callouts|Remark Callouts]]
- [[_COMMUNITY_Lesson Search|Lesson Search]]
- [[_COMMUNITY_Mermaid Diagram|Mermaid Diagram]]
- [[_COMMUNITY_Progress Dashboard|Progress Dashboard]]
- [[_COMMUNITY_Markdown Renderer Tests|Markdown Renderer Tests]]
- [[_COMMUNITY_Lesson Page Tests|Lesson Page Tests]]
- [[_COMMUNITY_Progress Dashboard Tests|Progress Dashboard Tests]]
- [[_COMMUNITY_Route Prefetching Tests|Route Prefetching Tests]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Content Validation Script|Content Validation Script]]

## God Nodes (most connected - your core abstractions)
1. `useProgressStore` - 25 edges
2. `initializeContent()` - 19 edges
3. `getAllPhases()` - 18 edges
4. `getLessonsByPhase()` - 15 edges
5. `dayTokenToProgressId()` - 15 edges
6. `getLesson()` - 14 edges
7. `getCurriculumMetadata()` - 14 edges
8. `toastSuccess()` - 14 edges
9. `Lesson()` - 13 edges
10. `ensureHydrated()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `ExerciseWidget()` --calls--> `useQuizStore`  [EXTRACTED]
  components/ExerciseWidget.tsx → stores/quizStore.ts
- `Navbar()` --calls--> `createRoutePrefetchHandlers()`  [EXTRACTED]
  components/Navbar.tsx → utils/prefetchRoutes.ts
- `NotFound()` --calls--> `getAllPhases()`  [EXTRACTED]
  pages/NotFound.tsx → utils/contentLoader.ts
- `getLegacyPalette()` --calls--> `getStoredString()`  [EXTRACTED]
  stores/userPreferencesStore.ts → utils/safeStorage.ts
- `normalizeDayToken()` --calls--> `questionKey()`  [EXTRACTED]
  utils/dayToken.ts → stores/masteryStore.ts

## Import Cycles
- None detected.

## Communities (79 total, 23 thin omitted)

### Community 2 - "App Routing"
Cohesion: 0.07
Nodes (36): Home, Lesson, PhaseOverview, Curriculum, SearchResults, ProgressDashboard, Exercises, NotebookViewer (+28 more)

### Community 44 - "Interactive Block Extraction"
Cohesion: 0.48
Nodes (4): App(), TestComponent(), useLearningAnalytics(), TestComponent()

### Community 60 - "Main Entry Tests"
Cohesion: 0.40
Nodes (3): renderMock, toasterMarker, appMarker

### Community 9 - "Back to Top & Breadcrumbs"
Cohesion: 0.08
Nodes (15): BreadcrumbItem, BreadcrumbProps, MergedBlock, mergeCells(), CellOutputsProps, MergedBlockRendererProps, NotebookViewer(), formatRelative() (+7 more)

### Community 13 - "Case Studies Page"
Cohesion: 0.12
Nodes (13): highlightTheme, CodePlaygroundHandle, SubmissionResult, CodePlaygroundProps, CodePlayground, mockRunFn, MockPythonRunnerProps, mockRunFn (+5 more)

### Community 33 - "Copy Button & Exercise Widget"
Cohesion: 0.31
Nodes (5): CopyButtonProps, CopyButton(), solutionTheme, ExerciseWidgetProps, ExerciseWidget()

### Community 38 - "Editorial Lesson Header"
Cohesion: 0.46
Nodes (3): EditorialLessonHeaderProps, ReadingTime(), getReadingTime()

### Community 5 - "Exercise Card & Empty States"
Cohesion: 0.10
Nodes (16): IllustrationProps, SearchEmptyIllustration(), ExercisesEmptyIllustration(), FreshStartIllustration(), ExerciseCardProps, Exercises(), QuizAttemptSchema, QuizAttempt (+8 more)

### Community 12 - "Error Boundary"
Cohesion: 0.19
Nodes (6): ErrorBoundaryProps, ErrorBoundaryState, ErrorBoundary, TOAST_DEFAULT_OPTIONS, toastError(), toastInfo()

### Community 30 - "Keyboard Shortcuts"
Cohesion: 0.33
Nodes (3): ShortcutScope, ShortcutDefinition, isTypingInEditableElement()

### Community 21 - "Lesson Code Actions"
Cohesion: 0.32
Nodes (6): LessonCodeActionsProps, LessonCodeActions(), maybeCelebrateAchievement(), extractLessonCodeBlocks(), joinLessonCodeBlocks(), toastSuccess()

### Community 51 - "Swipe Hook"
Cohesion: 0.33
Nodes (3): ViewProps, ToggleProps, MapListToggle

### Community 6 - "Markdown Renderer Core"
Cohesion: 0.06
Nodes (19): CodePlayground, ExerciseWidget, MasteryCheck, customTheme, glossaryDefinitionsByLowerTerm, addGlossaryTooltips(), processGlossaryChildren(), ParagraphWithGlossary() (+11 more)

### Community 40 - "Link Safety"
Cohesion: 0.43
Nodes (5): LinkComponent(), SAFE_SCHEMES, normalizeAndValidateHref(), LinkProps, getSecureLinkAttributes()

### Community 45 - "Exercise Widget Tests"
Cohesion: 0.33
Nodes (7): extractCodeBlock(), getNodeStartOffset(), getNodeEndOffset(), getHeadingText(), isLabeledParagraph(), extractLabeledTextFromParagraph(), findInteractiveBlocks()

### Community 15 - "Gamification Store"
Cohesion: 0.17
Nodes (12): MasteryCheckProps, MasteryCheck(), buildFAQSchema(), MasteryStatus, LessonMasteryStats, LessonNeedingReview, safeStorage, PersistedMasterySchema (+4 more)

### Community 35 - "Mobile Nav & Route Prefetch"
Cohesion: 0.28
Nodes (5): MobileNav(), routePrefetchers, prefetchedRoutes, prefetchRoute(), createRoutePrefetchHandlers()

### Community 27 - "Navbar & Status Ticker"
Cohesion: 0.24
Nodes (7): NavbarProps, Navbar(), formatPath(), streakBlocks(), StatusTicker(), toastInfoMock, toastInfoMock

### Community 4 - "Python Runner & Pyodide Sandbox"
Cohesion: 0.09
Nodes (17): PythonRunnerHandle, PythonRunnerProps, PythonRunner, MockPyodide, Window, TestComponent(), PyodideRunResult, RunPythonOptions (+9 more)

### Community 28 - "SEO Head & Not Found"
Cohesion: 0.20
Nodes (5): BreadcrumbItem, SEOHeadProps, buildBreadcrumbSchema(), SEOHead(), NotFound()

### Community 1 - "Search Palette & Debounce"
Cohesion: 0.08
Nodes (38): SearchPaletteProps, SearchPalette(), mockNavigate, TestComponent(), useDebounce(), SearchResults(), lessons, Lesson (+30 more)

### Community 36 - "Sidebar Navigation"
Cohesion: 0.22
Nodes (5): SidebarProps, PrimaryItemProps, Sidebar(), useProgressStoreMock, useProgressStoreMock

### Community 22 - "Sidebar Phase Group"
Cohesion: 0.23
Nodes (7): SidebarPhaseGroupProps, SidebarPhaseGroup(), propsAreEqual(), Phase, getLessonsByPhase(), ReviewCardSeed, DayToken

### Community 7 - "Table of Contents"
Cohesion: 0.09
Nodes (12): TocItemProps, TocItem, TableOfContentsProps, TableOfContents, MockIntersectionObserver, rehypeSlugCustom(), stripMarkdownInlineFormatting(), extractTextFromReactNode() (+4 more)

### Community 48 - "Remark Code Meta Plugin"
Cohesion: 0.29
Nodes (6): mockSetCode, mockRecordAttempt, mockGetQuizStats, mockGetRecentAttempts, mockAwardExerciseCompletion, mockAwardPerfectQuiz

### Community 0 - "Spaced Repetition Review System"
Cohesion: 0.09
Nodes (34): useProgressStoreMock, getAllReviewCardSeeds(), freezeReviewCardSeed(), DayExerciseMap, DayExerciseMapSchema, getMap(), markExerciseComplete(), ReviewRating (+26 more)

### Community 3 - "Theme Context"
Cohesion: 0.10
Nodes (20): ThemeContextType, ThemeContext, DARK_PALETTES, ThemeProvider(), useTheme(), PALETTES, SettingsPage(), ColorPaletteSchema (+12 more)

### Community 52 - "Animated Counter"
Cohesion: 0.47
Nodes (3): SwipeTestComponent(), SwipeConfig, useSwipe()

### Community 43 - "Learning Analytics Hook"
Cohesion: 0.32
Nodes (4): Tab, CaseStudies(), getAllCaseStudies(), getAllProjects()

### Community 16 - "Mastery Check"
Cohesion: 0.21
Nodes (12): ContentStats(), PhaseOverview(), getPhase(), getAllLessons(), parseNotebooks(), parseNotebookEntry(), getTotalReadingTime(), getContentStats() (+4 more)

### Community 20 - "Curriculum & Home Pages"
Cohesion: 0.32
Nodes (9): Curriculum(), pad(), formatIssueDate(), Home(), { mockGetLastVisited, mockGetCompletedCount }, getAllPhases(), getCurriculumMetadata(), buildProductSchema() (+1 more)

### Community 29 - "Confetti Effects"
Cohesion: 0.35
Nodes (7): prefersReducedMotion(), safeConfetti(), triggerSparkle(), triggerQuizAcedConfetti(), triggerDayExercisesCompleteConfetti(), triggerPhaseUnlockConfetti(), triggerCurriculumFireworks()

### Community 17 - "Lesson & Day Token Core"
Cohesion: 0.35
Nodes (12): Lesson(), initializeContent(), getLesson(), getAdjacentLessons(), ParsedDayToken, normalizeDayToken(), parseDayToken(), compareDayTokens() (+4 more)

### Community 11 - "Phase Overview & Progress Store"
Cohesion: 0.16
Nodes (13): MotionProps, safeStorage, PhaseProgress, PersistedProgressSchema, ProgressStore, toDayKey(), parseValidDays(), parseValidCompletionDates() (+5 more)

### Community 47 - "Exercise Widget Tests"
Cohesion: 0.48
Nodes (4): ProgressDashboard(), ACHIEVEMENTS, formatDuration(), useLearningAnalyticsStore

### Community 61 - "Lesson Page Tests"
Cohesion: 0.50
Nodes (3): { mockSetLastVisited, mockToastSuccess, mockToastInfo }, mockToggleLessonComplete, mockGetCompletedLessons

### Community 25 - "Progress Dashboard Tests"
Cohesion: 0.17
Nodes (11): mockClearAllProgress, mockRefreshDailyChallenge, mockSetPalette, mockSetFontSize, mockSetDensity, mockSetCodeLanguage, mockSetSidebarDefaultOpen, mockSetReadingMode (+3 more)

### Community 14 - "Code Playground"
Cohesion: 0.14
Nodes (13): AchievementId, AchievementMeta, XP_MILESTONES, safeStorage, LeaderboardEntry, DailyChallenge, LeaderboardEntrySchema, DailyChallengeSchema (+5 more)

### Community 31 - "Learning Analytics Store"
Cohesion: 0.27
Nodes (8): safeStorage, PersistedAnalyticsSchema, LearningAnalyticsStore, asDayKey(), parsePositiveRecord(), normalizePersistedState(), addElapsed(), streakDaysForThreshold()

### Community 18 - "Exercise Extractor"
Cohesion: 0.19
Nodes (10): Equal, Assert, ExtractedExerciseShape, typeAssertions, extractExercisesFromContent(), extractExercises(), Equal, Assert (+2 more)

### Community 19 - "Frontmatter Parsing"
Cohesion: 0.36
Nodes (10): BLOCKED_KEYS, coerceScalar(), normalizeMarkdownLineEndings(), parseNormalizedMarkdown(), parseMarkdown(), Frontmatter, ParsedMarkdown, normalizeMarkdownLineEndings() (+2 more)

### Community 24 - "Route Prefetching Tests"
Cohesion: 0.17
Nodes (11): mockHome, mockCurriculum, mockPhaseOverview, mockLesson, mockProgressDashboard, mockExercises, mockNotebookViewer, mockSearchResults (+3 more)

### Community 37 - "SEO Schemas"
Cohesion: 0.61
Nodes (6): buildCanonicalUrl(), buildWebSiteSchema(), buildItemListSchema(), buildCollectionPageSchema(), buildCourseSchema(), buildLessonSchema()

### Community 8 - "Content Loader"
Cohesion: 0.08
Nodes (31): ExtraFile, lessonFiles, phaseFiles, extrasFiles, normalizeIdPart(), getLessonIdPrefix(), extractExercisesFromLesson(), extractHeadingsFromLessonContent() (+23 more)

### Community 50 - "Map/List Toggle"
Cohesion: 0.29
Nodes (6): difficultyInfoSchema, difficultyConfigSchema, phaseIconsSchema, DifficultyInfo, DifficultyConfig, PhaseIcons

### Community 32 - "Day Token Core Logic"
Cohesion: 0.36
Nodes (9): parseCache, progressIdCache, normalizeDayToken(), parseDayToken(), compareDayTokens(), dayTokenFromPath(), extractDayToken(), dayTokenFromReference() (+1 more)

### Community 10 - "SQL Playground & Runner"
Cohesion: 0.10
Nodes (16): highlightTheme, SqlPlaygroundHandle, SqlPlaygroundProps, SqlPlayground, SqlRunnerHandle, SqlRunnerProps, SqlRunner, mockRunFn (+8 more)

### Community 41 - "Mermaid Diagram"
Cohesion: 0.29
Nodes (5): usePaletteType(), MermaidDiagramProps, MermaidDiagram(), renderMock, initializeMock

### Community 46 - "Progress Dashboard"
Cohesion: 0.29
Nodes (6): mockSetCode, mockRecordAttempt, mockGetQuizStats, mockGetRecentAttempts, mockAwardExerciseCompletion, mockAwardPerfectQuiz

### Community 58 - "Lesson Page Tests"
Cohesion: 0.40
Nodes (4): { mockSetLastVisited, mockToastSuccess, mockToastInfo, mockFindInteractiveBlocks }, mockGetLessonStats, mockToggleLessonComplete, mockGetCompletedLessons

### Community 23 - "Progress Dashboard Tests"
Cohesion: 0.17
Nodes (11): mockClearAllProgress, mockRefreshDailyChallenge, mockSetPalette, mockSetFontSize, mockSetDensity, mockSetCodeLanguage, mockSetSidebarDefaultOpen, mockSetReadingMode (+3 more)

### Community 26 - "Route Prefetching Tests"
Cohesion: 0.17
Nodes (11): mockHome, mockCurriculum, mockPhaseOverview, mockLesson, mockProgressDashboard, mockExercises, mockNotebookViewer, mockSearchResults (+3 more)

## Knowledge Gaps
- **294 isolated node(s):** `Home`, `Lesson`, `PhaseOverview`, `Curriculum`, `SearchResults` (+289 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createRoutePrefetchHandlers()` connect `Mobile Nav & Route Prefetch` to `Route Prefetching Tests`, `Route Prefetching Tests`, `Navbar & Status Ticker`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `CopyButton()` connect `Copy Button & Exercise Widget` to `Lesson Code Actions`, `SQL Playground & Runner`, `Case Studies Page`, `Markdown Renderer Core`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `toastSuccess()` connect `Lesson Code Actions` to `Copy Button & Exercise Widget`, `Markdown Renderer Core`, `Error Boundary`, `Case Studies Page`, `Code Playground`, `Progress Dashboard`, `Remark Code Meta Plugin`, `Confetti Effects`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `initializeContent()` (e.g. with `freezeLesson()` and `freezePhase()`) actually correct?**
  _`initializeContent()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Home`, `Lesson`, `PhaseOverview` to the rest of the system?**
  _294 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App Routing` be split into smaller, more focused modules?**
  _Cohesion score 0.07088989441930618 - nodes in this community are weakly interconnected._
- **Should `Back to Top & Breadcrumbs` be split into smaller, more focused modules?**
  _Cohesion score 0.07956989247311828 - nodes in this community are weakly interconnected._