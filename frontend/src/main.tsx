import '@fontsource-variable/inter';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/charts/styles.css';
import './theme/global.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ColorSchemeScript, MantineProvider, localStorageColorSchemeManager } from '@mantine/core';
import { HashRouter } from 'react-router';
import { theme } from './theme/theme';
import { App } from './app/App';
import { DashboardProvider } from './app/DashboardProvider';

const colorSchemeManager = localStorageColorSchemeManager({ key: 'aws-billing-theme' });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ColorSchemeScript defaultColorScheme="auto" localStorageKey="aws-billing-theme" />
    <MantineProvider theme={theme} defaultColorScheme="auto" colorSchemeManager={colorSchemeManager}>
      <DashboardProvider>
        <HashRouter><App /></HashRouter>
      </DashboardProvider>
    </MantineProvider>
  </StrictMode>,
);
