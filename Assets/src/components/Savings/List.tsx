import { Link, useLoaderData } from 'react-router-dom';
import { Saving } from './types';

export const List = () => {
  const savings = useLoaderData() as Saving[];

  const handleDelete = async (id: string) => {
    await fetch(`/api/savings/${id}`, { method: 'delete' });
  };

  return (
    <div>
      <Link to={'new'}>New</Link>

      {savings.map((saving) => (
        <div key={saving.id}>
          <Link to={`${saving.id}/edit`}>{saving.name}</Link>
          <button onClick={async () => await handleDelete(saving.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};
