import { Form, useSubmit } from 'react-router-dom';
import { Saving } from './types';
import { useForm } from '../../shared/hooks/useForm';

export const New = () => {
  const { handleChange, values, errored, handleSubmit } = useForm(
    Saving,
    useSubmit(),
    'post'
  );

  return (
    <Form onSubmit={(e) => e.preventDefault()}>
      <div>
        <label htmlFor="name">Name</label>
        <input
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
          value={values.amount || ''}
          onChange={(e) => {
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
