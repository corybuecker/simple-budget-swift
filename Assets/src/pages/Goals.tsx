import { plainToInstance } from 'class-transformer';
import { Outlet, Params, useRouteError } from 'react-router';
import { List } from '../components/Goals/List';
import { Goal } from '../components/Goals/types';
import { New } from '../components/Goals/New';
import { Edit } from '../components/Goals/Edit';
import { validate } from 'class-validator';

const Layout = () => {
  return <Outlet />;
};

const createGoal = async ({ request }: { request: Request }) => {
  const content = await request.json();
  console.log(content);
  const goal = plainToInstance(Goal, content, {
    excludeExtraneousValues: true,
  });

  const errors = await validate(goal);
  if (errors.length) throw errors;

  console.log(goal);

  await fetch('/api/goals', {
    method: 'POST',
    body: JSON.stringify(goal),
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
  const goal = plainToInstance(Goal, await request.json(), {
    excludeExtraneousValues: true,
  });

  const errors = await validate(goal);
  if (errors.length) throw errors;

  await fetch(`/api/goals/${params.id}`, {
    method: 'PATCH',
    body: JSON.stringify(goal),
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
  const goalsObjects = (await rawGoals.json()) as unknown as any[];
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
