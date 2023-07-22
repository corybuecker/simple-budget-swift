import { instanceToPlain, plainToInstance } from 'class-transformer';
import { Form, useLoaderData, useSubmit } from 'react-router-dom';
import { Goal, GoalRecurrence } from './types';
import { ChangeEvent } from 'react';
import { dateInputWrapper } from './utilities';
import { useForm } from '../../shared/hooks/useForm';

export const Edit = () => {
  const goal = plainToInstance(Goal, useLoaderData(), {
    excludeExtraneousValues: true,
  });

  const { handleChange, values, errored, handleSubmit } = useForm(
    Goal,
    useSubmit(),
    'patch',
    instanceToPlain(goal)
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
        <label htmlFor="completeAt">Complete at</label>
        <input
          type="date"
          value={dateInputWrapper(values.completeAt)}
          name="completeAt"
          id="completeAt"
          onChange={(e) => {
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
          value={values.recurrence}
          onChange={(e) => {
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
        Submit
      </button>
    </Form>
  );
};
