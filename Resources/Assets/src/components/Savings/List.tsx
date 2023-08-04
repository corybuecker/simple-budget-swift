import { Link, useLoaderData } from 'react-router-dom';
import { Saving } from './types';
import { Fragment } from 'react';
import { TrashIcon } from '@heroicons/react/20/solid';

export const List = () => {
  const savings = useLoaderData() as Saving[];

  const handleDelete = async (id: string) => {
    if (confirm('Sure?')) {
      await fetch(`/api/savings/${id}`, { method: 'delete' });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-6">
        <h1 className="text-xl">Savings</h1>
        <Link
          className="bg-blue-800 transition-colors hover:bg-blue-600 active:bg-blue-600 w-24 text-white text-center p-1 py-2 rounded"
          to={'new'}
        >
          New
        </Link>
      </div>
      <div className="flex flex-col gap-4">
        {savings.map((saving) => (
          <Fragment key={saving.id}>
            <Link
              className="transition-shadow p-2 border border-slate-400 shadow active:shadow-none rounded"
              to={`${saving.id}/edit`}
            >
              {saving.name}
              <button
                className="flex gap-1 items-center"
                onClick={async (e) => {
                  e.preventDefault();
                  await handleDelete(saving.id);
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
