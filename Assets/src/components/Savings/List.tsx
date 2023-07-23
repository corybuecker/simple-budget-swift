import { Link, useLoaderData } from 'react-router-dom';
import { Saving } from './types';
import { Fragment } from 'react';
import { dollarFormatter } from '../../shared/formatters';
import { TrashIcon } from '@heroicons/react/20/solid';

export const List = () => {
  const savings = useLoaderData() as Saving[];

  const handleDelete = async (id: string) => {
    await fetch(`/api/savings/${id}`, { method: 'delete' });
  };

  return (
    <div className="flex flex-col">
      <Link
        className="bg-blue-800 transition-colors hover:bg-blue-600 active:bg-blue-600 w-24 text-white text-center p-1 py-2 rounded"
        to={'new'}
      >
        New
      </Link>
      <div className="grid grid-cols-3 mt-4 gap-2">
        <div>Name</div>
        <div>Amount</div>
        <div></div>
        {savings.map((saving) => (
          <Fragment key={saving.id}>
            <div className="whitespace-nowrap overflow-hidden text-ellipsis">
              <Link
                className="underline hover:no-underline active:no-underline"
                to={`${saving.id}/edit`}
              >
                {saving.name}
              </Link>
            </div>
            <div>{dollarFormatter.format(saving.amount)}</div>
            <button
              className="flex gap-1 items-center"
              onClick={async () => await handleDelete(saving.id)}
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
