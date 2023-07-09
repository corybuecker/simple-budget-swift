import { Link, useLoaderData } from 'react-router-dom';
import { Account } from './types';

export const List = () => {
  const accounts = useLoaderData() as Account[];

  const handleDelete = async (id: string) => {
    await fetch(`/api/accounts/${id}`, { method: 'delete' });
  };

  return (
    <div>
      <Link to={'new'}>New</Link>

      {accounts.map((account) => (
        <div key={account.id}>
          <Link to={`${account.id}/edit`}>{account.name}</Link>
          <button onClick={async () => await handleDelete(account.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};
