import { useEffect, useState } from 'react';
import {
  ActionIcon, Button, Drawer, Group, Menu, Select, Text, Tooltip, UnstyledButton, VisuallyHidden, useMantineColorScheme,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import {
  IconActivity, IconCalendar, IconCheck, IconChevronDown, IconChevronRight, IconCloud, IconDeviceDesktop, IconFlask,
  IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand, IconMenu2, IconMoon, IconReceipt2,
  IconRefresh, IconLayoutDashboard, IconListDetails, IconSun, IconUsersGroup,
} from '@tabler/icons-react';
import { NavLink, Outlet, useLocation } from 'react-router';
import { defaultRange } from '../../data/mock/snapshot';
import { useDashboard } from '../../hooks/useDashboard';
import { dateKey, DAY_MS, rangeLabel } from '../../utils/format';
import styles from './Shell.module.css';

const sections = [
  { label: 'Billing', items: [
    { path: '/', name: 'Overview', icon: IconLayoutDashboard, subtitle: 'Track cloud spend and usage across your tenants.' },
    { path: '/usage', name: 'Usage Records', icon: IconListDetails, subtitle: 'Search and review individual metered usage events.' },
    { path: '/billing', name: 'Billing & Invoices', icon: IconReceipt2, subtitle: 'Review usage-based charges and monthly invoice summaries.' },
    { path: '/tenants', name: 'Tenants', icon: IconUsersGroup, subtitle: 'Compare tenant activity, service usage, and charges.' },
  ] },
  { label: 'System', items: [
    { path: '/pipeline', name: 'Pipeline Health', icon: IconActivity, subtitle: 'Review simulated ingestion and processing metrics.' },
  ] },
];

const themeModes = [
  { value: 'light', name: 'Light', icon: IconSun },
  { value: 'dark', name: 'Dark', icon: IconMoon },
  { value: 'auto', name: 'System', icon: IconDeviceDesktop },
] as const;

function Sidebar({ collapsed = false, onToggle, onNavigate }: { collapsed?: boolean; onToggle?: () => void; onNavigate?: () => void }) {
  const CollapseIcon = collapsed ? IconLayoutSidebarLeftExpand : IconLayoutSidebarLeftCollapse;
  return (
    <div className={styles.sidebarContent} data-collapsed={collapsed || undefined}>
      <div className={styles.brandRow}>
        <NavLink to="/" className={styles.brand} aria-label="AWS Billing home" onClick={onNavigate}>
          <span className={styles.brandIcon}><IconCloud size={21} stroke={1.85} /></span>
          {!collapsed && <span><strong>AWS Billing</strong><small>Cost &amp; usage</small></span>}
        </NavLink>
      </div>
      <nav aria-label="Main navigation" className={styles.navigation}>
        {sections.map((section) => <div key={section.label} className={styles.navSection}>
          {collapsed ? <VisuallyHidden>{section.label}</VisuallyHidden> : <div className={styles.navLabel}>{section.label}</div>}
          {section.items.map(({ path, name, icon: Icon }) => (
            <Tooltip key={path} label={name} position="right" disabled={!collapsed}>
              <NavLink to={path} end aria-label={name} onClick={onNavigate} className={styles.navItem}>
                <Icon size={19} stroke={1.65} aria-hidden />
                {!collapsed && <span>{name}</span>}
              </NavLink>
            </Tooltip>
          ))}
        </div>)}
      </nav>
      {onToggle && <div className={styles.sidebarFooter}>
        <Tooltip label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} position="right" disabled={!collapsed}>
          <UnstyledButton onClick={onToggle} className={styles.collapse} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!collapsed}>
            <CollapseIcon size={19} stroke={1.65} aria-hidden />{!collapsed && 'Collapse sidebar'}
          </UnstyledButton>
        </Tooltip>
      </div>}
    </div>
  );
}

function ThemeMenu() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const current = themeModes.find((mode) => mode.value === colorScheme) ?? themeModes[2];
  return <Menu position="bottom-end" width={144} shadow="md" withArrow>
    <Menu.Target>
      <ActionIcon variant="default" size={34} aria-label={'Theme, current mode: ' + current.name} title="Change theme">
        <current.icon size={17} stroke={1.75} />
      </ActionIcon>
    </Menu.Target>
    <Menu.Dropdown>
      <Menu.Label>Appearance</Menu.Label>
      {themeModes.map(({ value, name, icon: Icon }) => <Menu.Item
        key={value} aria-label={name} aria-current={colorScheme === value || undefined}
        leftSection={<Icon size={16} stroke={1.75} />}
        rightSection={colorScheme === value ? <IconCheck size={14} /> : undefined}
        onClick={() => setColorScheme(value)}
      >{name}</Menu.Item>)}
    </Menu.Dropdown>
  </Menu>;
}

function ScopeControls() {
  const { snapshot, tenantId, setTenantId, range, setRange, refresh, refreshStatus } = useDashboard();
  const [draft, setDraft] = useState<[string | null, string | null]>(range);
  const from = range[0];
  const to = range[1];
  const end = Date.parse(snapshot.availableRange[1]);
  const status = { idle: '', refreshing: 'Refreshing demo data', refreshed: 'Demo data refreshed', error: 'Could not refresh demo data' }[refreshStatus];
  const RefreshIcon = refreshStatus === 'refreshed' ? IconCheck : IconRefresh;
  return <div className={styles.scopeControls}>
    <Select
      aria-label="Tenant"
      data={[{ value: 'all', label: 'All tenants' }, ...snapshot.tenants.map(({ id, name }) => ({ value: id, label: name }))]}
      value={tenantId ?? 'all'}
      onChange={(value) => setTenantId(value === 'all' ? null : value)}
      allowDeselect={false} searchable
      leftSection={<IconUsersGroup size={16} stroke={1.65} />}
      rightSection={<IconChevronDown size={14} />}
      className={styles.tenantPicker}
      comboboxProps={{ position: 'bottom-start', width: 'target' }}
    />
    <DatePickerInput
      type="range" aria-label="Date range (UTC)"
      value={draft[0] && !draft[1] ? draft : range}
      onChange={(next) => {
        setDraft(next);
        if (next[0] && next[1]) setRange([next[0], next[1]]);
      }}
      onDropdownClose={() => setDraft([from, to])}
      allowSingleDateInRange
      minDate={snapshot.availableRange[0]}
      maxDate={snapshot.availableRange[1]}
      valueFormatter={({ date }) => {
        if (Array.isArray(date) && typeof date[0] === 'string' && typeof date[1] === 'string') {
          return rangeLabel([date[0], date[1]]);
        }
        return 'Select an end date';
      }}
      presets={[
        { value: defaultRange, label: 'October 2026' },
        { value: [dateKey(end - 6 * DAY_MS), snapshot.availableRange[1]], label: 'Last 7 demo days' },
        { value: [dateKey(end - 29 * DAY_MS), snapshot.availableRange[1]], label: 'Last 30 demo days' },
        { value: snapshot.availableRange, label: 'All demo dates' },
      ]}
      leftSection={<IconCalendar size={16} stroke={1.65} />}
      rightSection={<IconChevronDown size={14} />}
      className={styles.datePicker}
      popoverProps={{ position: 'bottom-end', withinPortal: true, returnFocus: true }}
    />
    <Tooltip label="Refresh demo data">
      <Button variant="default" px={10} aria-label="Refresh demo data" onClick={() => void refresh()} loading={refreshStatus === 'refreshing'}>
        <RefreshIcon size={17} stroke={1.8} className={refreshStatus === 'refreshed' ? styles.refreshed : undefined} />
      </Button>
    </Tooltip>
    <VisuallyHidden role="status">{status}</VisuallyHidden>
    {refreshStatus === 'error' && <Text c="red" size="xs" role="alert">{status}</Text>}
  </div>;
}

export function Shell() {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pathname } = useLocation();
  const section = sections.find((group) => group.items.some((item) => item.path === pathname)) ?? sections[0];
  const page = section.items.find((item) => item.path === pathname) ?? section.items[0];

  useEffect(() => {
    document.title = page.name + ' · AWS Billing';
  }, [page.name]);

  return <div className={styles.shell} data-collapsed={collapsed || undefined}>
    <UnstyledButton className={styles.skipLink} onClick={() => document.getElementById('main-content')?.focus()}>Skip to content</UnstyledButton>
    <aside className={styles.sidebar}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
    </aside>
    <Drawer opened={drawerOpen} onClose={() => setDrawerOpen(false)} size={265} title="Navigation" padding={0}
      closeButtonProps={{ 'aria-label': 'Close navigation' }} styles={{ header: { paddingInline: 16 } }}>
      <Sidebar onNavigate={() => setDrawerOpen(false)} />
    </Drawer>
    <div className={styles.workspace}>
      <header className={styles.topbar}>
        <Group gap={12} wrap="nowrap" className={styles.breadcrumb}>
          <ActionIcon variant="default" className={styles.menuToggle} onClick={() => setDrawerOpen(true)} aria-label="Open navigation" aria-expanded={drawerOpen} size={34}>
            <IconMenu2 size={19} />
          </ActionIcon>
          <span className={styles.crumbSection}>{section.label}</span>
          <IconChevronRight size={13} stroke={1.8} aria-hidden className={styles.crumbSeparator} />
          <span className={styles.crumbPage}>{page.name}</span>
        </Group>
        <Group gap={10} wrap="nowrap">
          <span className={styles.demo}><IconFlask size={13} stroke={1.8} aria-hidden /> Demo data</span>
          <ThemeMenu />
        </Group>
      </header>
      <main className={styles.main} id="main-content" tabIndex={-1}>
        <div className={styles.pageHeader}>
          <div>
            <h1>{page.name}</h1>
            <p>{page.subtitle}</p>
          </div>
          <ScopeControls />
        </div>
        <Outlet />
      </main>
    </div>
  </div>;
}
