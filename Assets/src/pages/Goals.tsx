import { plainToInstance } from 'class-transformer';
import { Outlet, Params } from 'react-router';
import { List } from '../components/Goals/List';
import { Goal } from '../components/Goals/types';
import { New } from '../components/Goals/New';
import { Edit } from '../components/Goals/Edit';

const Layout = () => {
  return <Outlet />;
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

const goalLoader = async ({ params }: { params: { id: string } }) => {
  const rawGoal = await fetch(`/api/goals/${params.id}`);
  const goalObject = await rawGoal.json();
  return plainToInstance(Goal, goalObject);
};

const goalsLoader = async () => {
  const rawGoals = await fetch('/api/goals');
  const goalsObjects = (await rawGoals.json()) as unknown as Record<
    string,
    number | string
  >[];
  return plainToInstance(Goal, goalsObjects);
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
