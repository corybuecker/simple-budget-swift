import { Form, useSubmit } from 'react-router-dom';
import { Account } from './types';
import { useForm } from '../../shared/hooks/useForm';
import { ChangeEvent } from 'react';

export const New = () => {
  const { handleChange, values, errored, handleSubmit } = useForm(
    Account,
    useSubmit(),
    'post',
  );

  console.log(values);

  return (
    <Form onSubmit={(e) => e.preventDefault()}>
      <div>
        <label
          className="block text-xs font-medium text-gray-700"
          htmlFor="name"
        >
          Name
        </label>
        <input
          className="mt-1 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
          value={values.name || ''}
          name="name"
          id="name"
          onChange={(e) => {
            handleChange({ name: e.target.value });
          }}
        />
        {errored.name}
      </div>
      <div>
        <label htmlFor="amount">Amount</label>
        <input
          defaultValue=""
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
          type="checkbox"
          name="debt"
          defaultChecked={false}
          id="debt"
          onChange={async (e) => {
            handleChange({ debt: e.target.checked });
          }}
        />
        {errored.debt}
      </div>
      <button onClick={handleSubmit} type="submit">
        Submit
      </button>
    </Form>
  );
};
