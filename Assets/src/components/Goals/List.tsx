import { Link, useLoaderData } from 'react-router-dom';
import { Goal } from './types';
import { Fragment } from 'react';
import { dollarCentsFormatter } from '../../shared/formatters';
import { TrashIcon } from '@heroicons/react/20/solid';
import { dateInputWrapper } from './utilities';

export const List = () => {
  const goals = useLoaderData() as Goal[];

  const handleDelete = async (id: string) => {
    if (confirm('Sure?')) {
      await fetch(`/api/goals/${id}`, { method: 'delete' });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-6">
        <h1 className="text-xl">Goals</h1>
        <Link
          className="bg-blue-800 transition-colors hover:bg-blue-600 active:bg-blue-600 w-24 text-white text-center p-1 py-2 rounded"
          to={'new'}
        >
          New
        </Link>
      </div>
      <div className="flex flex-col gap-4">
        {goals.map((goal) => (
          <Fragment key={goal.id}>
            <Link
              className="transition-shadow p-2 border border-slate-400 shadow active:shadow-none rounded"
              to={`${goal.id}/edit`}
            >
              {goal.name}

              <div>
                {dateInputWrapper(goal.completeAt)} recurring {goal.recurrence}
              </div>
              <div>
                {dollarCentsFormatter.format(goal.amortized)} of{' '}
                {dollarCentsFormatter.format(goal.amount)}
              </div>
              <button
                onClick={async (e: React.MouseEvent) => {
                  e.preventDefault();
                  await handleDelete(goal.id);
                }}
                className="flex justify-end md:justify-center cursor-pointer"
              >
                <TrashIcon className="w-5" />
                Delete
              </button>
            </Link>
          </Fragment>
        ))}
      </div>
    </div>
  );
};
