import { HTMLFormMethod } from '@remix-run/router';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { useState } from 'react';
import { SubmitFunction } from 'react-router-dom';

type UnionRecord<M> = M extends object
  ? {
      [K in keyof M]: { [P in K]: M[P] | string };
    }[keyof M]
  : never;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FormValues<M> = Partial<{ [P in keyof M]: any }>;
type TouchValues<M> = Partial<{ [P in keyof M]: boolean }>;
type ErrorValues<M> = Partial<{ [P in keyof M]: string }>;

export type FormValue<M> = UnionRecord<M>;
export type FormHook<M> = {
  handleChange: (formValue: FormValue<M>) => Promise<void>;
  handleSubmit: () => Promise<void>;
  values: FormValues<M>;
  errored: ErrorValues<M>;
};

export function useForm<M extends object>(
  cls: ClassConstructor<M>,
  submit: SubmitFunction,
  method: HTMLFormMethod,
  initialValues: FormValues<M> = {},
): FormHook<M> {
  const [values, setValues] = useState<FormValues<M>>(initialValues);
  const [touched, setTouched] = useState<TouchValues<M>>({});
  const [errored, setErrored] = useState<ErrorValues<M>>({});

  const handleChange = async (formValue: FormValue<M>) => {
    const keys = Object.keys(formValue) as Array<keyof M>;
    const key = keys[0] as keyof M;

    const revisedTouched: TouchValues<M> = { ...touched, [key]: true };

    const revisedFormValues: FormValues<M> = { ...values, ...formValue };

    const unvalidatedModel = plainToInstance(cls, revisedFormValues, {
      excludeExtraneousValues: true,
    });

    const errors = await validate(unvalidatedModel);
    let revisedErrored: ErrorValues<M> = {};

    for (const error of errors) {
      if (Object.keys(revisedTouched).includes(error.property)) {
        revisedErrored = {
          ...revisedErrored,
          [error.property]: JSON.stringify(error.constraints),
        };
      }
    }

    setValues(revisedFormValues);
    setTouched(revisedTouched);
    setErrored(revisedErrored);
  };

  const handleSubmit = async () => {
    const unvalidatedModel: M = plainToInstance(cls, values, {
      excludeExtraneousValues: true,
    });

    const errors = await validate(unvalidatedModel);
    if (errors.length === 0) {
      submit(JSON.parse(JSON.stringify(values)), {
        encType: 'application/json',
        method,
      });
      return;
    }

    let revisedTouched = {};
    let revisedErrored = {};

    for (const error of errors) {
      revisedErrored = {
        ...revisedErrored,
        [error.property]: JSON.stringify(error.constraints),
      };

      revisedTouched = {
        ...revisedTouched,
        [error.property]: true,
      };
    }

    setTouched(revisedTouched);
    setErrored(revisedErrored);
  };

  return { handleChange, handleSubmit, values, errored };
}
