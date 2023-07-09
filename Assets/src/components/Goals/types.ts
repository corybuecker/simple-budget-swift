import { Expose, Transform } from 'class-transformer';
import {
  IsDate,
  IsDateString,
  IsEnum,
  IsNumber,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';

export enum GoalRecurrence {
  Never = 'never',
  Daily = 'daily',
  Weekly = 'weekly',
  Monthly = 'monthly',
  Quarterly = 'quarterly',
  Yearly = 'yearly',
}

export class Goal {
  public id!: string;

  @IsString()
  @Length(1)
  @Expose()
  public name!: string;

  @IsNumber()
  @IsPositive()
  @Expose()
  @Transform(({ value }) => Number(value as string))
  public amount!: number;

  @IsDateString({ strict: true, strictSeparator: true })
  @Expose()
  @Transform(({ value }) => value && new Date(value).toISOString())
  public completeAt!: string;

  @IsEnum(GoalRecurrence)
  @Expose()
  public recurrence!: GoalRecurrence;
}
