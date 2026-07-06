# Graph Report - src  (2026-07-06)

## Corpus Check
- 207 files · ~0 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1005 nodes · 2124 edges · 73 communities (52 shown, 21 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 41 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Search Palette & Debounce|Search Palette & Debounce]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Python Runner & Pyodide Sandbox|Python Runner & Pyodide Sandbox]]
- [[_COMMUNITY_Markdown Renderer Core|Markdown Renderer Core]]
- [[_COMMUNITY_Table of Contents|Table of Contents]]
- [[_COMMUNITY_Content Loader|Content Loader]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Exercise Card & Empty States|Exercise Card & Empty States]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_App Routing|App Routing]]
- [[_COMMUNITY_Back to Top & Breadcrumbs|Back to Top & Breadcrumbs]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Phase Overview & Progress Store|Phase Overview & Progress Store]]
- [[_COMMUNITY_Code Playground|Code Playground]]
- [[_COMMUNITY_Theme Context|Theme Context]]
- [[_COMMUNITY_App Routing|App Routing]]
- [[_COMMUNITY_Theme Context|Theme Context]]
- [[_COMMUNITY_Mastery Check|Mastery Check]]
- [[_COMMUNITY_Exercise Extractor|Exercise Extractor]]
- [[_COMMUNITY_Frontmatter Parsing|Frontmatter Parsing]]
- [[_COMMUNITY_Curriculum & Home Pages|Curriculum & Home Pages]]
- [[_COMMUNITY_Back to Top & Breadcrumbs|Back to Top & Breadcrumbs]]
- [[_COMMUNITY_Progress Dashboard Tests|Progress Dashboard Tests]]
- [[_COMMUNITY_Route Prefetching Tests|Route Prefetching Tests]]
- [[_COMMUNITY_Progress Dashboard Tests|Progress Dashboard Tests]]
- [[_COMMUNITY_Route Prefetching Tests|Route Prefetching Tests]]
- [[_COMMUNITY_SEO Head & Not Found|SEO Head & Not Found]]
- [[_COMMUNITY_Exercise Card & Empty States|Exercise Card & Empty States]]
- [[_COMMUNITY_Day Token Core Logic|Day Token Core Logic]]
- [[_COMMUNITY_Editorial Cover|Editorial Cover]]
- [[_COMMUNITY_Link Safety|Link Safety]]
- [[_COMMUNITY_Exercise Widget Tests|Exercise Widget Tests]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_SEO Schemas|SEO Schemas]]
- [[_COMMUNITY_Editorial Lesson Header|Editorial Lesson Header]]
- [[_COMMUNITY_Mermaid Diagram|Mermaid Diagram]]
- [[_COMMUNITY_Terminal Dashboard|Terminal Dashboard]]
- [[_COMMUNITY_Learning Analytics Hook|Learning Analytics Hook]]
- [[_COMMUNITY_Theme Context|Theme Context]]
- [[_COMMUNITY_Curriculum Config|Curriculum Config]]
- [[_COMMUNITY_MapList Toggle|Map/List Toggle]]
- [[_COMMUNITY_Swipe Hook|Swipe Hook]]
- [[_COMMUNITY_App Routing|App Routing]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Custom Cursor|Custom Cursor]]
- [[_COMMUNITY_Prerequisite Pills|Prerequisite Pills]]
- [[_COMMUNITY_Progress Bar|Progress Bar]]
- [[_COMMUNITY_Related Lessons|Related Lessons]]
- [[_COMMUNITY_App Routing|App Routing]]
- [[_COMMUNITY_Mastery Check|Mastery Check]]
- [[_COMMUNITY_Glossary|Glossary]]
- [[_COMMUNITY_Main Entry Tests|Main Entry Tests]]
- [[_COMMUNITY_Content Loader|Content Loader]]
- [[_COMMUNITY_Navbar & Status Ticker|Navbar & Status Ticker]]
- [[_COMMUNITY_Markdown Renderer Tests|Markdown Renderer Tests]]
- [[_COMMUNITY_Test Setup  localStorage Mock|Test Setup / localStorage Mock]]
- [[_COMMUNITY_Content Validation Script|Content Validation Script]]
- [[_COMMUNITY_Frontmatter Types|Frontmatter Types]]
- [[_COMMUNITY_Content Validation Script|Content Validation Script]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]

## God Nodes (most connected - your core abstractions)
1. `useProgressStore` - 25 edges
2. `createRoutePrefetchHandlers()` - 25 edges
3. `Lesson()` - 24 edges
4. `dayTokenToProgressId()` - 22 edges
5. `getLessonsByPhase()` - 20 edges
6. `initializeContent()` - 19 edges
7. `toastSuccess()` - 19 edges
8. `getAllPhases()` - 18 edges
9. `Home()` - 16 edges
10. `getLesson()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `NotFound()` --calls--> `getAllPhases()`  [EXTRACTED]
  pages/NotFound.tsx → utils/contentLoader.ts
- `getLegacyPalette()` --calls--> `getStoredString()`  [EXTRACTED]
  stores/userPreferencesStore.ts → utils/safeStorage.ts
- `questionKey()` --calls--> `normalizeDayToken()`  [EXTRACTED]
  stores/masteryStore.ts → utils/dayToken.ts
- `App()` --calls--> `useLearningAnalytics()`  [EXTRACTED]
  App.tsx → hooks/useLearningAnalytics.ts
- `App()` --calls--> `useUserPreferencesStore`  [EXTRACTED]
  App.tsx → stores/userPreferencesStore.ts

## Import Cycles
- None detected.

## Communities (73 total, 21 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (55): ExerciseWidget(), MobileNav(), PrimaryItem(), PrimaryItemProps, Sidebar(), SidebarProps, propsAreEqual(), SidebarPhaseGroup() (+47 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (33): ErrorBoundary, ErrorBoundaryProps, ErrorBoundaryState, ExerciseWidgetProps, solutionTheme, LessonCodeActions(), LessonCodeActionsProps, mockAwardExerciseCompletion (+25 more)

### Community 2 - "Search Palette & Debounce"
Cohesion: 0.09
Nodes (38): SearchPalette(), SearchPaletteProps, mockNavigate, TestComponent(), useDebounce(), SearchResults(), lessons, mockNavigate (+30 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (34): CodePlayground, CodePlaygroundHandle, CodePlaygroundProps, highlightTheme, SubmissionResult, CopyButton(), CopyButtonProps, highlightTheme (+26 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (30): MarkdownFragment(), MasteryCheck(), MasteryCheckProps, SwipeConfig, useSwipe(), Lesson(), mockGetCompletedLessons, mockGetLessonStats (+22 more)

### Community 5 - "Python Runner & Pyodide Sandbox"
Cohesion: 0.09
Nodes (20): PythonRunner, PythonRunnerHandle, PythonRunnerProps, MockPyodide, TestComponent(), Window, initPyodide(), loadScript() (+12 more)

### Community 6 - "Markdown Renderer Core"
Cohesion: 0.06
Nodes (20): addGlossaryTooltips(), CodePlayground, customTheme, ExerciseWidget, glossaryDefinitionsByLowerTerm, InteractiveBlock, lessonSanitizerSchema, markdownComponents (+12 more)

### Community 7 - "Table of Contents"
Cohesion: 0.09
Nodes (13): TableOfContents, TableOfContentsProps, TocItem, TocItemProps, MockIntersectionObserver, MockIntersectionObserver, rehypeSlugCustom(), toString() (+5 more)

### Community 8 - "Content Loader"
Cohesion: 0.07
Nodes (25): useProgressStoreMock, useProgressStoreMock, CaseStudy, caseStudyFiles, ExtraFile, extrasFiles, freezeNotebook(), freezeNotebookCell() (+17 more)

### Community 9 - "Community 9"
Cohesion: 0.09
Nodes (19): GlossaryTerm(), GlossaryTermProps, addGlossaryTooltips(), CodePlayground, createHeadingComponent(), customTheme, findSoleImageChild(), glossaryDefinitionsByLowerTerm (+11 more)

### Community 10 - "Exercise Card & Empty States"
Cohesion: 0.14
Nodes (12): ExercisesEmptyIllustration(), FreshStartIllustration(), IllustrationProps, SearchEmptyIllustration(), Exercises(), hydrateQuizStore(), QuizAttempt, QuizAttemptSchema (+4 more)

### Community 11 - "Community 11"
Cohesion: 0.13
Nodes (12): KeyboardShortcutsOverlay(), clearHighlights(), highlightMatches(), LessonSearch(), LessonSearchProps, Navbar(), NavbarProps, toastInfoMock (+4 more)

### Community 12 - "App Routing"
Cohesion: 0.09
Nodes (21): App(), CaseStudies, ContentStats, Curriculum, CustomCursor, Exercises, Home, KeyboardShortcutsOverlay (+13 more)

### Community 13 - "Back to Top & Breadcrumbs"
Cohesion: 0.14
Nodes (11): BreadcrumbItem, BreadcrumbProps, NotePanel(), NotePanelProps, formatRelative(), NoteCard(), NotesPage(), NoteEntry (+3 more)

### Community 14 - "Community 14"
Cohesion: 0.19
Nodes (13): TestComponent(), useLearningAnalytics(), addElapsed(), asDayKey(), formatDuration(), LearningAnalyticsStore, normalizePersistedState(), parsePositiveRecord() (+5 more)

### Community 15 - "Phase Overview & Progress Store"
Cohesion: 0.16
Nodes (13): MotionProps, calculateStreakDays(), mergeLegacyLastVisited(), normalizePersistedState(), parseValidCompletionDates(), parseValidDays(), PersistedProgressSchema, PhaseProgress (+5 more)

### Community 16 - "Code Playground"
Cohesion: 0.13
Nodes (14): AchievementId, AchievementMeta, ACHIEVEMENTS, DailyChallenge, DailyChallengeSchema, GamificationStore, hydrateGamificationStore(), LeaderboardEntry (+6 more)

### Community 17 - "Theme Context"
Cohesion: 0.12
Nodes (11): CodeLanguagePreference, CodeLanguagePreferenceSchema, ColorPaletteSchema, DensityPreference, DensityPreferenceSchema, FontSizePreference, FontSizePreferenceSchema, getLegacyPalette() (+3 more)

### Community 18 - "App Routing"
Cohesion: 0.42
Nodes (13): clearAllProgress(), ensureHydrated(), getCompletedCount(), getCompletedForPhase(), getCompletedLessons(), getLastVisited(), getPhaseProgress(), getStreakDays() (+5 more)

### Community 19 - "Theme Context"
Cohesion: 0.32
Nodes (8): ThemeContext, ThemeContextType, DARK_PALETTES, getPaletteType(), NOTE: Keep this list in sync with the dark palette definitions in variables.css., ThemeProvider(), useTheme(), ColorPalette

### Community 20 - "Mastery Check"
Cohesion: 0.26
Nodes (12): freezeExercise(), getAdjacentLessons(), getAllExercises(), getAllLessons(), getAllNotebooks(), getAllProjects(), getExtrasForPhase(), getNotebook() (+4 more)

### Community 21 - "Exercise Extractor"
Cohesion: 0.19
Nodes (10): Assert, Equal, ExtractedExerciseShape, typeAssertions, extractExercisesFromContent(), extractExercises(), Assert, Equal (+2 more)

### Community 22 - "Frontmatter Parsing"
Cohesion: 0.37
Nodes (10): BLOCKED_KEYS, coerceScalar(), normalizeMarkdownLineEndings(), parseMarkdown(), parseNormalizedMarkdown(), Frontmatter, normalizeMarkdownLineEndings(), ParsedMarkdown (+2 more)

### Community 23 - "Curriculum & Home Pages"
Cohesion: 0.32
Nodes (9): Curriculum(), formatIssueDate(), Home(), pad(), { mockGetLastVisited, mockGetCompletedCount }, { mockGetLastVisited, mockGetCompletedCount }, getAllPhases(), getCurriculumMetadata() (+1 more)

### Community 24 - "Back to Top & Breadcrumbs"
Cohesion: 0.23
Nodes (8): CellOutputs(), CellOutputsProps, mergeCells(), MergedBlock, MergedBlockRendererProps, NotebookViewer(), stripAnsi(), NotebookCell

### Community 25 - "Progress Dashboard Tests"
Cohesion: 0.17
Nodes (11): mockClearAllProgress, MockIntersectionObserver, mockRefreshDailyChallenge, mockSetCodeLanguage, mockSetCustomCursorEnabled, mockSetDensity, mockSetFontSize, mockSetPalette (+3 more)

### Community 26 - "Route Prefetching Tests"
Cohesion: 0.17
Nodes (11): mockConceptGraphPage, mockContentStats, mockCurriculum, mockExercises, mockHome, mockLesson, mockNotebookViewer, mockPhaseOverview (+3 more)

### Community 27 - "Progress Dashboard Tests"
Cohesion: 0.17
Nodes (11): mockClearAllProgress, MockIntersectionObserver, mockRefreshDailyChallenge, mockSetCodeLanguage, mockSetCustomCursorEnabled, mockSetDensity, mockSetFontSize, mockSetPalette (+3 more)

### Community 28 - "Route Prefetching Tests"
Cohesion: 0.17
Nodes (11): mockConceptGraphPage, mockContentStats, mockCurriculum, mockExercises, mockHome, mockLesson, mockNotebookViewer, mockPhaseOverview (+3 more)

### Community 29 - "SEO Head & Not Found"
Cohesion: 0.20
Nodes (5): BreadcrumbItem, buildBreadcrumbSchema(), SEOHead(), SEOHeadProps, NotFound()

### Community 30 - "Exercise Card & Empty States"
Cohesion: 0.22
Nodes (6): ExerciseCardProps, SidebarPhaseGroupProps, Exercise, Phase, ReviewCardSeed, DayToken

### Community 31 - "Day Token Core Logic"
Cohesion: 0.36
Nodes (9): compareDayTokens(), dayTokenFromPath(), dayTokenFromReference(), dayTokenToProgressId(), extractDayToken(), normalizeDayToken(), parseCache, parseDayToken() (+1 more)

### Community 33 - "Link Safety"
Cohesion: 0.39
Nodes (6): LinkComponent(), LinkComponent(), getSecureLinkAttributes(), LinkProps, normalizeAndValidateHref(), SAFE_SCHEMES

### Community 34 - "Exercise Widget Tests"
Cohesion: 0.31
Nodes (9): extractCodeBlock(), extractLabeledTextFromParagraph(), findInteractiveBlocks(), getHeadingText(), getInlineNodeText(), getNodeEndOffset(), getNodeStartOffset(), InteractiveContent() (+1 more)

### Community 35 - "Community 35"
Cohesion: 0.31
Nodes (6): RelatedLessons(), freezeDayTokenArray(), freezeLesson(), freezePhase(), freezeStringArray(), getRelatedLessons()

### Community 36 - "SEO Schemas"
Cohesion: 0.64
Nodes (6): buildCanonicalUrl(), buildCollectionPageSchema(), buildCourseSchema(), buildItemListSchema(), buildLessonSchema(), buildWebSiteSchema()

### Community 37 - "Editorial Lesson Header"
Cohesion: 0.46
Nodes (3): EditorialLessonHeaderProps, ReadingTime(), getReadingTime()

### Community 38 - "Mermaid Diagram"
Cohesion: 0.32
Nodes (6): loadMermaid(), MermaidDiagram(), MermaidDiagramProps, usePaletteType(), initializeMock, renderMock

### Community 40 - "Learning Analytics Hook"
Cohesion: 0.32
Nodes (5): CaseStudies(), normalizeDifficulty(), Tab, getAllCaseStudies(), parseProjectLikeEntry()

### Community 41 - "Theme Context"
Cohesion: 0.29
Nodes (3): PALETTES, SettingsPage(), useUserPreferencesStore

### Community 42 - "Curriculum Config"
Cohesion: 0.57
Nodes (3): parseHighlightLines(), remarkCodeMeta(), parseCodeNode()

### Community 43 - "Map/List Toggle"
Cohesion: 0.29
Nodes (6): DifficultyConfig, difficultyConfigSchema, DifficultyInfo, difficultyInfoSchema, PhaseIcons, phaseIconsSchema

### Community 44 - "Swipe Hook"
Cohesion: 0.33
Nodes (3): MapListToggle, ToggleProps, ViewProps

### Community 46 - "Community 46"
Cohesion: 0.67
Nodes (4): findStructuralIssues(), getHeadingText(), getInlineNodeText(), isLabeledParagraph()

### Community 54 - "Main Entry Tests"
Cohesion: 0.40
Nodes (3): appMarker, renderMock, toasterMarker

### Community 55 - "Content Loader"
Cohesion: 0.70
Nodes (5): buildReviewCardsFromLesson(), extractExercisesFromLesson(), extractHeadingsFromLessonContent(), getLessonIdPrefix(), normalizeIdPart()

### Community 57 - "Navbar & Status Ticker"
Cohesion: 0.83
Nodes (3): formatPath(), StatusTicker(), streakBlocks()

## Knowledge Gaps
- **296 isolated node(s):** `Home`, `Lesson`, `PhaseOverview`, `Curriculum`, `SearchResults` (+291 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createRoutePrefetchHandlers()` connect `Community 0` to `Community 4`, `Exercise Card & Empty States`, `Community 11`, `Curriculum & Home Pages`, `Route Prefetching Tests`, `Route Prefetching Tests`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `toastSuccess()` connect `Community 1` to `Community 0`, `Community 3`, `Community 4`, `Markdown Renderer Core`, `Community 9`, `Code Playground`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **What connects `Home`, `Lesson`, `PhaseOverview` to the rest of the system?**
  _298 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06815968841285297 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.062003968253968256 - nodes in this community are weakly interconnected._
- **Should `Search Palette & Debounce` be split into smaller, more focused modules?**
  _Cohesion score 0.08708272859216255 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.053877551020408164 - nodes in this community are weakly interconnected._