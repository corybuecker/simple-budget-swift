import { Link, useLoaderData } from 'react-router-dom';
import { Account } from './types';
import { Fragment } from 'react';
import { dollarFormatter } from '../../shared/formatters';
import { TrashIcon } from '@heroicons/react/20/solid';

export const List = () => {
  const accounts = useLoaderData() as Account[];

  const handleDelete = async (id: string) => {
    if (confirm('Sure?')) {
      await fetch(`/api/accounts/${id}`, { method: 'delete' });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-6">
        <h1 className="text-xl">Accounts</h1>
        <Link
          className="bg-blue-800 transition-colors hover:bg-blue-600 active:bg-blue-600 w-24 text-white text-center p-1 py-2 rounded"
          to={'new'}
        >
          New
        </Link>
      </div>
      <div className="flex flex-col gap-4">
        {accounts.map((account) => (
          <Fragment key={account.id}>
            <Link
              className="transition-shadow p-2 border border-slate-400 shadow active:shadow-none rounded"
              to={`${account.id}/edit`}
            >
              {account.name}

              <div>
                {dollarFormatter.format(
                  account.debt ? account.amount * -1 : account.amount,
                )}
              </div>
              <button
                className="flex gap-1 items-center"
                onClick={async (e: React.MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  await handleDelete(account.id);
                }}
              >
                <TrashIcon className="w-4" />
                Delete
              </button>
            </Link>
          </Fragment>
        ))}
      </div>
    </div>
  );
};
