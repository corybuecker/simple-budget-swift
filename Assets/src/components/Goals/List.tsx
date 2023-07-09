import { Link, useLoaderData } from 'react-router-dom';
import { Goal } from './types';

export const List = () => {
  const goals = useLoaderData() as Goal[];

  const handleDelete = async (id: string) => {
    await fetch(`/api/goals/${id}`, { method: 'delete' });
  };

  return (
    <div>
      <Link to={'new'}>New</Link>

      {goals.map((goal) => (
        <div key={goal.id}>
          <Link to={`${goal.id}/edit`}>{goal.name}</Link>
          <button onClick={async () => await handleDelete(goal.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};
