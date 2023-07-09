import { plainToInstance } from 'class-transformer';
import { useState } from 'react';
import { Form, useLoaderData, useSubmit } from 'react-router-dom';
import { Account } from './types';
import { validate } from 'class-validator';

type UnionRecord<T> = { [K in keyof T]: { [P in K]: T[P] | string } }[keyof T];
type UnionAccount = UnionRecord<Account>;

type FormValues = Partial<{ [P in keyof Account]: any }>;
type TouchedValues = Partial<{ [P in keyof Account]: boolean }>;
type ErrorValues = Partial<{ [P in keyof Account]: string }>;

export const New = () => {
  const [formValues, setFormValues] = useState<FormValues>({});
  const [touched, setTouched] = useState<TouchedValues>({});
  const [errored, setErrored] = useState<ErrorValues>({});

  let submit = useSubmit();

  const handleSubmit = async () => {
    const unvalidatedAccount: Account = plainToInstance(Account, formValues, {
      excludeExtraneousValues: true,
    });

    const errors = await validate(unvalidatedAccount);

    if (errors.length === 0) {
      submit(formValues, { encType: 'application/json', method: 'patch' });
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

  const handleChange = async (formValue: UnionAccount) => {
    const revisedTouched = Object.keys(formValue).reduce((memo, key) => {
      return Object.assign(memo, { [key]: true });
    }, Object.assign({}, touched));

    const revisedFormValues = Object.assign({}, formValues, formValue);

    const unvalidatedAccount: Account = plainToInstance(
      Account,
      revisedFormValues,
      {
        excludeExtraneousValues: true,
      }
    );

    const errors = await validate(unvalidatedAccount);
    console.log(errors);
    const revisedErrored = errors.reduce((memo, error) => {
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

  console.log('rendering!!!');

  return (
    <Form onSubmit={(e) => e.preventDefault()}>
      <div>
        <label htmlFor="name">Name</label>
        <input
          value={formValues.name || ''}
          name="name"
          id="name"
          onChange={(e) => {
            handleChange({ name: e.target.value });
          }}
        />
        {errored.name}
      </div>
      <div>
        <label htmlFor={'amount'}>Amount</label>
        <input
          type={'number'}
          value={formValues.amount || ''}
          name="name"
          id="name"
          onChange={(e) => {
            handleChange({ amount: e.target.value });
          }}
        />
        {errored.amount}
      </div>
      <div>
        <label htmlFor={'debt'}>Debt</label>
        <input
          type={'checkbox'}
          name={'debt'}
          checked={!!formValues.debt}
          id={'debt'}
          onChange={async (e) => {
            await handleChange({ debt: e.target.checked });
          }}
        />
        {errored.debt}
      </div>
      <button onClick={handleSubmit} type={'submit'}>
        Submit
      </button>
    </Form>
  );
};
