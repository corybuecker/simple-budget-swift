import { instanceToPlain, plainToInstance } from 'class-transformer';
import { Form, useLoaderData, useSubmit } from 'react-router-dom';
import { Saving } from './types';
import { ChangeEvent, useState } from 'react';
import { validate } from 'class-validator';

type FormValues = Partial<{ [P in keyof Saving]: any }>;
type TouchedValues = Partial<{ [P in keyof Saving]: boolean }>;
type ErrorValues = Partial<{ [P in keyof Saving]: string }>;

export const Edit = () => {
  const saving = plainToInstance(Saving, useLoaderData(), {
    excludeExtraneousValues: true,
  });

  const [formValues, setFormValues] = useState<FormValues>(saving);
  const [touched, setTouched] = useState<TouchedValues>({});
  const [errored, setErrored] = useState<ErrorValues>({});

  let submit = useSubmit();

  const handleSubmit = async () => {
    const unvalidatedSaving: Saving = plainToInstance(Saving, formValues, {
      excludeExtraneousValues: true,
    });

    const errors = await validate(unvalidatedSaving);

    if (errors.length === 0) {
      submit(formValues, { encType: 'application/json', method: 'patch' });
    } else {
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
    }
  };

  const handleChange = async (formValue: FormValues) => {
    const revisedTouched = Object.keys(formValue).reduce((memo, key) => {
      return Object.assign(memo, { [key]: true });
    }, Object.assign({}, touched));

    const revisedFormValues = Object.assign({}, formValues, formValue);

    const unvalidatedSaving: Saving = plainToInstance(
      Saving,
      revisedFormValues,
      {
        excludeExtraneousValues: true,
      }
    );

    const errors = await validate(unvalidatedSaving);

    const revisedErrored = errors.reduce((memo: ErrorValues, error) => {
      if (!Object.keys(revisedTouched).includes(error.property)) return memo;

      return Object.assign(memo, {
        [error.property as keyof ErrorValues]: JSON.stringify(
          error.constraints
        ),
      });
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
          value={formValues.name}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            handleChange({ name: e.target.value });
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
            handleChange({ amount: e.target.value });
          }}
          type={'number'}
          step={'0.01'}
          name={'amount'}
          id={'amount'}
        />
        {errored.amount}
      </div>
      <button onClick={handleSubmit} type={'submit'}>
        Submit
      </button>
    </Form>
  );
};
