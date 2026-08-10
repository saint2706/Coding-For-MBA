## 2024-08-10 - Cached document.querySelector in ScrollProgress
**Learning:** The ScrollProgress component was executing document.querySelector inside an rAF on every scroll event when a targetSelector was provided. This introduces unnecessary layout thrashing/DOM querying.
**Action:** When a DOM element is queried repeatedly in a scroll handler or requestAnimationFrame loop, cache the element reference using useRef and verify its existence with isConnected to avoid repeated querySelector calls.
