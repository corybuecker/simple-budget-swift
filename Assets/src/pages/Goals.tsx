import { plainToInstance } from 'class-transformer';
import { Outlet, Params } from 'react-router';
import { List } from '../components/Goals/List';
import { Goal } from '../components/Goals/types';
import { New } from '../components/Goals/New';
import { Edit } from '../components/Goals/Edit';

const Layout = () => {
  return (
    <div className="p-2">
      <Outlet />
    </div>
  );
};

const createGoal = async ({ request }: { request: Request }) => {
  await fetch('/api/goals', {
    method: 'POST',
    body: JSON.stringify(
      plainToInstance(Goal, await request.json(), {
        excludeExtraneousValues: true,
      }),
    ),
    headers: [['content-type', 'application/json']],
  });

  return null;
};

const updateGoal = async ({
  request,
  params,
}: {
  request: Request;
  params: Params<'id'>;
}) => {
  await fetch(`/api/goals/${params.id}`, {
    method: 'PATCH',
    body: JSON.stringify(
      plainToInstance(Goal, await request.json(), {
        excludeExtraneousValues: true,
      }),
    ),
    headers: [['content-type', 'application/json']],
  });

  return null;
};

const goalLoader = async ({ params }: { params: Params<'id'> }) => {
  const rawGoal = await fetch(`/api/goals/${params.id}`);
  const goalObject = await rawGoal.json();
  return plainToInstance(Goal, goalObject);
};

const goalsLoader = async () => {
  const rawGoals = await fetch('/api/goals');
  const goals: unknown[] = await rawGoals.json();
  return plainToInstance(Goal, goals, { excludeExtraneousValues: true });
};

export const GoalsPage = {
  path: 'goals',
  element: <Layout />,
  children: [
    {
      index: true,
      element: <List />,
      loader: goalsLoader,
    },
    {
      path: 'new',
      element: <New />,
      action: createGoal,
    },

    {
      path: ':id/edit',
      element: <Edit />,
      action: updateGoal,
      loader: goalLoader,
    },
  ],
};
