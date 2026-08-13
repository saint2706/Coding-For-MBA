## 2024-08-13 - [DOM query cache for scroll optimizations]
**Learning:** React state inside an onScroll handler causes frequent layout thrashing. document.querySelector is synchronous and slow in long documents.
**Action:** Use a `useRef` to cache the DOM node reference retrieved by `document.querySelector` inside `useEffect`, reducing layout thrashing in high-frequency scroll handlers.
