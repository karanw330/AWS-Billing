import { createTheme, type MantineColorsTuple } from '@mantine/core';

const harbor: MantineColorsTuple = [
  '#eef4ff', '#dfeaff', '#c4d7fd', '#a1bcf6', '#7a9deb',
  '#587ed8', '#3c64c4', '#3157ad', '#29488e', '#21396e',
];

export const theme = createTheme({
  colors: { harbor },
  primaryColor: 'harbor',
  primaryShade: { light: 6, dark: 4 },
  fontFamily: 'Inter Variable, Inter, system-ui, sans-serif',
  fontFamilyMonospace: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
  headings: { fontFamily: 'Inter Variable, Inter, system-ui, sans-serif', fontWeight: '650' },
  defaultRadius: 'md',
  focusRing: 'auto',
  white: '#fff',
});
