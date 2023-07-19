import { plainToInstance } from 'class-transformer';
import { useLoaderData } from 'react-router';

class DashboardReport {
  public spendable!: number;
}

const dashboardLoader = async () => {
  const rawData = await fetch('/api/dashboard');

  if (!rawData.ok) {
    if (rawData.status === 401) {
      window.location.href = '/authentication';
    }
    throw rawData;
  }

  return plainToInstance(DashboardReport, await rawData.json());
};

const Dashboard = () => {
  const data = useLoaderData() as Record<string, string>;
  return (
    <p>
      {Number(data['total'])}
      <br />
      {Number(data['daysRemaining'])}
      <br />
      {Number(data['total']) / Number(data['daysRemaining'])}
    </p>
  );
};

export const DashboardPage = {
  path: 'dashboard',
  element: <Dashboard />,
  loader: dashboardLoader,
};
