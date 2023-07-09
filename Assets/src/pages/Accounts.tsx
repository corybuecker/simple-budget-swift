import { plainToInstance } from 'class-transformer';
import { Outlet, Params, useRouteError } from 'react-router';
import { List } from '../components/Accounts/List';
import { Account } from '../components/Accounts/types';
import { New } from '../components/Accounts/New';
import { Edit } from '../components/Accounts/Edit';
import { validate } from 'class-validator';

const Layout = () => {
  return <Outlet />;
};

const createAccount = async ({ request }: { request: Request }) => {
  const account = plainToInstance(Account, await request.json(), {
    excludeExtraneousValues: true,
  });

  const errors = await validate(account);
  if (errors.length) throw errors;

  await fetch('/api/accounts', {
    method: 'POST',
    body: JSON.stringify(account),
    headers: [['content-type', 'application/json']],
  });

  return null;
};

const updateAccount = async ({
  request,
  params,
}: {
  request: Request;
  params: Params<'id'>;
}) => {
  const account = plainToInstance(Account, await request.json(), {
    excludeExtraneousValues: true,
  });

  const errors = await validate(account);
  if (errors.length) throw errors;

  await fetch(`/api/accounts/${params.id}`, {
    method: 'PATCH',
    body: JSON.stringify(account),
    headers: [['content-type', 'application/json']],
  });

  return null;
};

const accountLoader = async ({ params }: { params: { id: string } }) => {
  const rawAccount = await fetch(`/api/accounts/${params.id}`);
  const accountObject = await rawAccount.json();
  return plainToInstance(Account, accountObject);
};

const accountsLoader = async () => {
  const rawAccounts = await fetch('/api/accounts');
  const accountsObjects = (await rawAccounts.json()) as unknown as any[];
  return plainToInstance(Account, accountsObjects);
};

export const AccountsPage = {
  path: 'accounts',
  element: <Layout />,
  children: [
    {
      index: true,
      element: <List />,
      loader: accountsLoader,
    },
    {
      path: 'new',
      element: <New />,
      action: createAccount,
    },

    {
      path: ':id/edit',
      element: <Edit />,
      action: updateAccount,
      loader: accountLoader,
    },
  ],
};
