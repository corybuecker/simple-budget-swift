import { plainToInstance } from 'class-transformer';
import { useLoaderData } from 'react-router';

class DashboardReport {
  public spendable!: number;
}

const dashboardLoader = async () => {
  const rawAccounts = await fetch('/api/dashboard');
  const reportObject = (await rawAccounts.json()) as any;
  return plainToInstance(DashboardReport, reportObject);
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
