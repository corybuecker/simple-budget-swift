import { instanceToPlain, plainToInstance } from 'class-transformer';
import { ChangeEvent } from 'react';
import { Form, useLoaderData, useSubmit } from 'react-router-dom';
import { useForm } from '../../shared/hooks/useForm';
import { Account } from './types';

export const Edit = () => {
  const account = plainToInstance(Account, useLoaderData(), {
    excludeExtraneousValues: true,
  });

  const { handleChange, values, errored, handleSubmit } = useForm(
    Account,
    useSubmit(),
    'patch',
    instanceToPlain(account),
  );

  return (
    <Form onSubmit={(e) => e.preventDefault()}>
      <div>
        <label htmlFor="name">Name</label>
        <input
          value={values.name}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            handleChange({ name: e.target.value });
          }}
          name="name"
          id="name"
        />
        {errored.name}
      </div>
      <div>
        <label htmlFor="amount">Amount</label>
        <input
          value={values.amount}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            handleChange({ amount: e.target.value });
          }}
          inputMode="decimal"
          name="amount"
          id="amount"
        />
        {errored.amount}
      </div>
      <div>
        <label htmlFor="debt">Debt</label>
        <input
          checked={values.debt}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            handleChange({ debt: e.target.value });
          }}
          type="checkbox"
          name="debt"
          id="debt"
        />
        {errored.debt}
      </div>
      <button onClick={handleSubmit} type="submit">
        Submit
      </button>
    </Form>
  );
};
