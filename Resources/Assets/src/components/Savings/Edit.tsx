import { instanceToPlain, plainToInstance } from 'class-transformer';
import { Form, useLoaderData, useSubmit } from 'react-router-dom';
import { Saving } from './types';
import { ChangeEvent } from 'react';
import { useForm } from '../../shared/hooks/useForm';

export const Edit = () => {
  const saving = plainToInstance(Saving, useLoaderData(), {
    excludeExtraneousValues: true,
  });

  const { handleChange, values, errored, handleSubmit } = useForm(
    Saving,
    useSubmit(),
    'patch',
    instanceToPlain(saving)
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
      <button onClick={handleSubmit} type="submit">
        Submit
      </button>
    </Form>
  );
};
