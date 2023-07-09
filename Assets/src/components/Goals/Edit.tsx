import { instanceToPlain, plainToInstance } from 'class-transformer';
import { Form, useLoaderData, useSubmit } from 'react-router-dom';
import { Goal, GoalRecurrence } from './types';
import { ChangeEvent, useState } from 'react';
import { validate } from 'class-validator';
import { dateInputWrapper } from './utilities';

type FormValues = Record<keyof Goal, string>;
type FormValue = keyof FormValues;
type TouchedValues = Partial<Record<keyof FormValues, boolean>>;
type ErrorValues = Partial<Record<keyof FormValues, string>>;

export const Edit = () => {
  const goal = plainToInstance(Goal, useLoaderData(), {
    excludeExtraneousValues: true,
  });

  const [formValues, setFormValues] = useState<FormValues>({
    id: goal.id,
    name: goal.name,
    amount: String(goal.amount),
    completeAt: goal.completeAt,
    recurrence: goal.recurrence,
  });
  const [touched, setTouched] = useState<TouchedValues>({});
  const [errored, setErrored] = useState<ErrorValues>({});

  let submit = useSubmit();

  const handleSubmit = async () => {
    const unvalidatedGoal: Goal = plainToInstance(Goal, formValues, {
      excludeExtraneousValues: true,
    });

    const errors = await validate(unvalidatedGoal);

    if (errors.length === 0) {
      submit(instanceToPlain(unvalidatedGoal), {
        encType: 'application/json',
        method: 'patch',
      });
    } else {
      const revisedErrors = errors.reduce((memo: ErrorValues, error) => {
        return memo[error.property as keyof FormValues]
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
    }
  };

  const handleChange = async (
    revisedFormValues: FormValues,
    formValue: FormValue
  ) => {
    const revisedTouched: TouchedValues = { ...touched, [formValue]: true };

    const unvalidatedGoal: Goal = plainToInstance(Goal, revisedFormValues, {
      excludeExtraneousValues: true,
    });

    const errors = await validate(unvalidatedGoal);
    const errorForField = errors.find((e) => e.property === formValue);
    const revisedErrored =
      errorForField && revisedTouched[formValue]
        ? {
            ...errored,
            [formValue]: JSON.stringify(errorForField.constraints),
          }
        : { ...errored };

    setErrored(revisedErrored);
    setTouched(revisedTouched);
    setFormValues(revisedFormValues);
  };

  return (
    <Form onSubmit={(e) => e.preventDefault()}>
      <div>
        <label htmlFor={'name'}>Name</label>
        <input
          value={formValues.name}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            handleChange({ ...formValues, ['name']: e.target.value }, 'name');
          }}
          name="name"
          id="name"
        />
        {errored.name}
      </div>
      <div>
        <label htmlFor={'amount'}>Amount</label>
        <input
          value={formValues.amount}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            handleChange(
              { ...formValues, ['amount']: e.target.value },
              'amount'
            );
          }}
          inputMode="decimal"
          name="amount"
          id="amount"
        />
        {errored.amount}
      </div>
      <div>
        <label htmlFor={'completeAt'}>Complete at</label>
        <input
          type="date"
          value={dateInputWrapper(formValues.completeAt)}
          name="completeAt"
          id="completeAt"
          onChange={(e) => {
            handleChange(
              { ...formValues, completeAt: e.target.value },
              'completeAt'
            );
          }}
        />
        {errored.completeAt}
      </div>
      <div>
        <label htmlFor={'recurrence'}>Recurrence</label>
        <select
          name="recurrence"
          id="recurrence"
          value={formValues.recurrence}
          onChange={(e) => {
            handleChange(
              { ...formValues, recurrence: e.target.value },
              'recurrence'
            );
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
