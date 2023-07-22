import { ChangeEvent } from 'react';
import { Form, useSubmit } from 'react-router-dom';
import { Goal, GoalRecurrence } from './types';
import { useForm } from '../../shared/hooks/useForm';

export const New = () => {
  const { handleChange, errored, handleSubmit } = useForm(
    Goal,
    useSubmit(),
    'post',
  );

  return (
    <Form onSubmit={(e) => e.preventDefault()}>
      <div>
        <label htmlFor="name">Name</label>
        <input
          defaultValue={''}
          name="name"
          id="name"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            handleChange({ name: e.target.value });
          }}
        />
        {errored.name}
      </div>
      <div>
        <label htmlFor="amount">Amount</label>
        <input
          defaultValue={''}
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
        <label htmlFor={'completeAt'}>Target date</label>
        <input
          type="date"
          defaultValue={''}
          name="completeAt"
          id="completeAt"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            handleChange({ completeAt: e.target.value });
          }}
        />
        {errored.completeAt}
      </div>
      <div>
        <label htmlFor="recurrence">Recurrence</label>
        <select
          name="recurrence"
          id="recurrence"
          onChange={(e: ChangeEvent<HTMLSelectElement>) => {
            handleChange({ recurrence: e.target.value });
          }}
        >
          <option></option>
          <option value={GoalRecurrence.Never}>{GoalRecurrence.Never}</option>
          <option value={GoalRecurrence.Daily}>{GoalRecurrence.Daily}</option>
          <option value={GoalRecurrence.Weekly}>{GoalRecurrence.Weekly}</option>
          <option value={GoalRecurrence.Monthly}>
            {GoalRecurrence.Monthly}
          </option>
          <option value={GoalRecurrence.Quarterly}>
            {GoalRecurrence.Quarterly}
          </option>
          <option value={GoalRecurrence.Yearly}>{GoalRecurrence.Yearly}</option>
        </select>
        {errored.recurrence}
      </div>
      <button onClick={handleSubmit} type="submit">
        Save
      </button>
    </Form>
  );
};
