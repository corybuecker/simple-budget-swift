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
    <div className="flex flex-col">
      <Link
        className="bg-blue-800 transition-colors hover:bg-blue-600 active:bg-blue-600 w-24 text-white text-center p-1 py-2 rounded"
        to={'new'}
      >
        New
      </Link>
      <div className="grid grid-cols-4 mt-4 gap-2">
        <div className="col-span-2 md:col-span-1">Name</div>
        <div>Amount</div>
        <div className="hidden md:block">Debt</div>
        <div></div>
        {accounts.map((account) => (
          <Fragment key={account.id}>
            <div className="col-span-2 md:col-span-1 whitespace-nowrap overflow-hidden text-ellipsis">
              <Link
                className="underline hover:no-underline active:no-underline"
                to={`${account.id}/edit`}
              >
                {account.name}
              </Link>
            </div>
            <div>
              {dollarFormatter.format(
                account.debt ? account.amount * -1 : account.amount,
              )}
            </div>
            <div className="hidden md:block">{account.debt ? 'Yes' : 'No'}</div>
            <button
              className="flex gap-1 items-center"
              onClick={async () => await handleDelete(account.id)}
            >
              <TrashIcon className="w-4" />
              Delete
            </button>
          </Fragment>
        ))}
      </div>
    </div>
  );
};
