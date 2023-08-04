import { plainToInstance } from 'class-transformer';
import { Outlet, Params } from 'react-router';
import { List } from '../components/Savings/List';
import { Saving } from '../components/Savings/types';
import { New } from '../components/Savings/New';
import { Edit } from '../components/Savings/Edit';

const Layout = () => {
  return (
    <div className="p-2">
      <Outlet />
    </div>
  );
};

const createSaving = async ({ request }: { request: Request }) => {
  await fetch('/api/savings', {
    method: 'POST',
    body: JSON.stringify(
      plainToInstance(Saving, await request.json(), {
        excludeExtraneousValues: true,
      }),
    ),
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
  await fetch(`/api/savings/${params.id}`, {
    method: 'PATCH',
    body: JSON.stringify(
      plainToInstance(Saving, await request.json(), {
        excludeExtraneousValues: true,
      }),
    ),
    headers: [['content-type', 'application/json']],
  });

  return null;
};

const savingLoader = async ({ params }: { params: Params<'id'> }) => {
  const rawSaving = await fetch(`/api/savings/${params.id}`);
  const savingObject = await rawSaving.json();
  return plainToInstance(Saving, savingObject);
};

const savingsLoader = async () => {
  const rawSavings = await fetch('/api/savings');
  const savingsObjects = (await rawSavings.json()) as unknown as Record<
    string,
    number | string
  >[];
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
