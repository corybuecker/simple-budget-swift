import { plainToInstance } from 'class-transformer';
import { Outlet, Params, redirect } from 'react-router';
import { List } from '../components/Accounts/List';
import { Account } from '../components/Accounts/types';
import { New } from '../components/Accounts/New';
import { Edit } from '../components/Accounts/Edit';

const Layout = () => {
  return (
    <div className="p-2">
      <Outlet />
    </div>
  );
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

  if (!rawAccount.ok) {
    if (rawAccount.status === 401) {
      return redirect('/authentication');
    }
    throw rawAccount;
  }

  return plainToInstance(Account, await rawAccount.json());
};

const accountsLoader = async () => {
  const rawAccounts = await fetch('/api/accounts');

  if (!rawAccounts.ok) {
    if (rawAccounts.status === 401) {
      return redirect('/authentication');
    }
    throw rawAccounts;
  }

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
