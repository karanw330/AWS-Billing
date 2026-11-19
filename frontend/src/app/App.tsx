import { Navigate, Route, Routes } from 'react-router';
import { Shell } from '../components/layout/Shell';
import { Billing } from '../pages/Billing';
import { Overview } from '../pages/Overview';
import { PipelineHealth } from '../pages/PipelineHealth';
import { Tenants } from '../pages/Tenants';
import { UsageRecords } from '../pages/UsageRecords';

export function App() {
  return <Routes>
    <Route element={<Shell />}>
      <Route index element={<Overview />} />
      <Route path="usage" element={<UsageRecords />} />
      <Route path="billing" element={<Billing />} />
      <Route path="tenants" element={<Tenants />} />
      <Route path="pipeline" element={<PipelineHealth />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>;
}
