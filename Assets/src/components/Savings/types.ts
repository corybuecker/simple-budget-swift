import { Expose, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';

export class Saving {
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
}
