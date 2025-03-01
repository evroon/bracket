import { useMDXComponents as getThemeComponents } from "nextra-theme-docs"; // nextra-theme-blog or your custom theme

// Get the default MDX components
const themeComponents = getThemeComponents();

// Merge components
// @ts-expect-error 1231231
export function useMDXComponents(components) {
  return {
    ...themeComponents,
    ...components,
  };
}
