import { plainToInstance } from 'class-transformer';
import { ChangeEvent, useState } from 'react';
import { Form, useSubmit } from 'react-router-dom';
import { Goal, GoalRecurrence } from './types';
import { validate } from 'class-validator';

type UnionRecord<T> = { [K in keyof T]: { [P in K]: T[P] | string } }[keyof T];
type FormValue = UnionRecord<Goal>;
type Keys = keyof Goal;
type FormValues = Partial<{ [P in keyof Goal]: any }>;
type TouchedValues = Partial<{ [P in keyof Goal]: boolean }>;
type ErrorValues = Partial<{ [P in keyof Goal]: string }>;

export const New = () => {
  const [formValues, setFormValues] = useState<FormValues>({});
  const [touched, setTouched] = useState<TouchedValues>({});
  const [errored, setErrored] = useState<ErrorValues>({});

  let submit = useSubmit();

  const handleSubmit = async () => {
    const unvalidatedGoal: Goal = plainToInstance(Goal, formValues, {
      excludeExtraneousValues: true,
    });

    const errors = await validate(unvalidatedGoal);

    if (errors.length === 0) {
      submit(formValues, { encType: 'application/json', method: 'post' });
      return;
    }

    const revisedErrors = errors.reduce((memo: ErrorValues, error) => {
      return memo[error.property as keyof ErrorValues]
        ? memo
        : Object.assign(memo, {
            [error.property]: JSON.stringify(error.constraints),
          });
    }, {});
    const revisedTouched = errors.reduce((memo: TouchedValues, error) => {
      return memo[error.property as keyof TouchedValues]
        ? memo
        : Object.assign(memo, {
            [error.property]: true,
          });
    }, {});

    setTouched(revisedTouched);
    setErrored(revisedErrors);
  };

  const handleChange = async (formValue: FormValue) => {
    const key: Keys = Object.keys(formValue)[0] as Keys;
    const value = Object.values(formValue)[0];

    const revisedTouched: TouchedValues = { ...touched, [key]: true };
    const revisedFormValues: FormValues = { ...formValues, [key]: value };

    const unvalidatedGoal: Goal = plainToInstance(Goal, revisedFormValues, {
      excludeExtraneousValues: true,
    });

    const errors = await validate(unvalidatedGoal);

    const revisedErrored: ErrorValues = errors.reduce((memo, error) => {
      if (Object.keys(revisedTouched).includes(error.property)) {
        return Object.assign(memo, {
          [error.property]: JSON.stringify(error.constraints),
        });
      } else {
        return memo;
      }
    }, Object.assign({}));

    setFormValues(revisedFormValues);
    setTouched(revisedTouched);
    setErrored(revisedErrored);
  };

  return (
    <Form onSubmit={(e) => e.preventDefault()}>
      <div>
        <label htmlFor={'name'}>Name</label>
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
        <label htmlFor={'amount'}>Amount</label>
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
