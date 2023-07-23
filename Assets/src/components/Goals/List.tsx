import { Link, useLoaderData } from 'react-router-dom';
import { Goal } from './types';
import { Fragment } from 'react';
import { dollarCentsFormatter, dollarFormatter } from '../../shared/formatters';
import { TrashIcon } from '@heroicons/react/20/solid';

export const List = () => {
  const goals = useLoaderData() as Goal[];

  const handleDelete = async (id: string) => {
    await fetch(`/api/goals/${id}`, { method: 'delete' });
  };

  return (
    <div className="flex flex-col">
      <Link
        className="bg-blue-800 transition-colors hover:bg-blue-600 active:bg-blue-600 w-24 text-white text-center p-1 py-2 rounded"
        to={'new'}
      >
        New
      </Link>
      <div className="grid grid-cols-4 md:grid-cols-6 mt-4 gap-2 auto-cols-min">
        <div>Name</div>
        <div className="hidden md:block">Completed by</div>
        <div className="hidden md:block">Recurrence</div>
        <div>Target</div>
        <div>Amortized</div>
        <div></div>
        {goals.map((goal) => (
          <Fragment key={goal.id}>
            <div className="whitespace-nowrap overflow-hidden text-ellipsis">
              <Link
                className="underline hover:no-underline active:no-underline"
                to={`${goal.id}/edit`}
              >
                {goal.name}
              </Link>
            </div>
            <div className="hidden md:block">{goal.completeAt}</div>
            <div className="hidden md:block">{goal.recurrence}</div>
            <div>{dollarFormatter.format(goal.amount)}</div>
            <div>{dollarCentsFormatter.format(goal.amortized)}</div>
            <button
              onClick={async () => await handleDelete(goal.id)}
              className="flex justify-end p-2 md:justify-center cursor-pointer"
            >
              <TrashIcon className="w-5" />
            </button>
          </Fragment>
        ))}
      </div>
    </div>
  );
};
