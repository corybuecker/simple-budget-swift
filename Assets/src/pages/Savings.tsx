import { plainToInstance } from 'class-transformer';
import { Outlet, Params, useRouteError } from 'react-router';
import { List } from '../components/Savings/List';
import { Saving } from '../components/Savings/types';
import { New } from '../components/Savings/New';
import { Edit } from '../components/Savings/Edit';
import { validate } from 'class-validator';

const Layout = () => {
  return <Outlet />;
};

const createSaving = async ({ request }: { request: Request }) => {
  const saving = plainToInstance(Saving, await request.json(), {
    excludeExtraneousValues: true,
  });

  const errors = await validate(saving);
  if (errors.length) throw errors;

  await fetch('/api/savings', {
    method: 'POST',
    body: JSON.stringify(saving),
    headers: [['content-type', 'application/json']],
  });

  return null;
};

const updateSaving = async ({
  request,
  params,
}: {
  request: Request;
  params: Params<'id'>;
}) => {
  const saving = plainToInstance(Saving, await request.json(), {
    excludeExtraneousValues: true,
  });

  const errors = await validate(saving);
  if (errors.length) throw errors;

  await fetch(`/api/savings/${params.id}`, {
    method: 'PATCH',
    body: JSON.stringify(saving),
    headers: [['content-type', 'application/json']],
  });

  return null;
};

const savingLoader = async ({ params }: { params: { id: string } }) => {
  const rawSaving = await fetch(`/api/savings/${params.id}`);
  const savingObject = await rawSaving.json();
  return plainToInstance(Saving, savingObject);
};

const savingsLoader = async () => {
  const rawSavings = await fetch('/api/savings');
  const savingsObjects = (await rawSavings.json()) as unknown as any[];
  return plainToInstance(Saving, savingsObjects);
};

export const SavingsPage = {
  path: 'savings',
  element: <Layout />,
  children: [
    {
      index: true,
      element: <List />,
      loader: savingsLoader,
    },
    {
      path: 'new',
      element: <New />,
      action: createSaving,
    },

    {
      path: ':id/edit',
      element: <Edit />,
      action: updateSaving,
      loader: savingLoader,
    },
  ],
};
