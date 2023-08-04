import { plainToInstance } from 'class-transformer';
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from 'react-router';

class DashboardReport {
  public total!: number;
  public daysRemaining!: number;
}

const dashboardLoader = async () => {
  const rawData = await fetch('/api/dashboard');

  if (!rawData.ok) {
    throw rawData;
  }

  return plainToInstance(DashboardReport, await rawData.json());
};

function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 401) {
      window.location.replace('/authentication');
      return <div>Logging in...</div>;
    }

    return <div>{JSON.stringify(error)}</div>;
  }

  return <div>{JSON.stringify(error)}</div>;
}

const Dashboard = () => {
  const data = useLoaderData() as unknown as DashboardReport;
  return (
    <p>
      {Number(data.total)}
      <br />
      {Number(data.daysRemaining)}
      <br />
      {Number(data.total) / Number(data.daysRemaining)}
    </p>
  );
};

export const DashboardPage = {
  path: 'dashboard',
  element: <Dashboard />,
  loader: dashboardLoader,
  errorElement: <ErrorBoundary />,
};
