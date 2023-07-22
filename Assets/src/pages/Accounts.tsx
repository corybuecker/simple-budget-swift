import { plainToInstance } from 'class-transformer';
import { Outlet, Params } from 'react-router';
import { List } from '../components/Accounts/List';
import { Account } from '../components/Accounts/types';
import { New } from '../components/Accounts/New';
import { Edit } from '../components/Accounts/Edit';

const Layout = () => {
  return <Outlet />;
};

const createAccount = async ({ request }: { request: Request }) => {
  await fetch('/api/accounts', {
    method: 'POST',
    body: JSON.stringify(
      plainToInstance(Account, await request.json(), {
        excludeExtraneousValues: true,
      }),
    ),
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
  await fetch(`/api/accounts/${params.id}`, {
    method: 'PATCH',
    body: JSON.stringify(
      plainToInstance(Account, await request.json(), {
        excludeExtraneousValues: true,
      }),
    ),
    headers: [['content-type', 'application/json']],
  });

  return null;
};

const accountLoader = async ({ params }: { params: { id: string } }) => {
  const rawAccount = await fetch(`/api/accounts/${params.id}`);
  return plainToInstance(Account, await rawAccount.json());
};

const accountsLoader = async () => {
  const rawAccounts = await fetch('/api/accounts');
  return plainToInstance(Account, (await rawAccounts.json()) as unknown[]);
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
