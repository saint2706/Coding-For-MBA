const fs = require('fs');

const file = 'src/components/SidebarPhaseGroup.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the bad JSDoc
content = content.replace(
  /\/\*\*\n \* Renders an accordion group of lessons for a specific phase in the sidebar curriculum\.\n \* Memoized to prevent re-rendering when navigation occurs outside of the current phase\.\n \*\n \* @param \{SidebarPhaseGroupProps\} props - The component props\.\n \* @returns \{JSX\.Element\} The phase group accordion block\.\n \*\/\nexport \{ propsAreEqual \}/g,
  `export { propsAreEqual }`
);

// We need to move the JSDoc back to the default export. Let's do that.
content = content.replace(
  /\/\*\*\n \* Memoized version of the SidebarPhaseGroup component\.\n \*\/\nexport default memo\(SidebarPhaseGroup, propsAreEqual\)/g,
  `/**
 * Renders an accordion group of lessons for a specific phase in the sidebar curriculum.
 * Memoized to prevent re-rendering when navigation occurs outside of the current phase.
 *
 * @param {SidebarPhaseGroupProps} props - The component props.
 * @returns {JSX.Element} The phase group accordion block.
 */
export default memo(SidebarPhaseGroup, propsAreEqual)`
);

fs.writeFileSync(file, content);
