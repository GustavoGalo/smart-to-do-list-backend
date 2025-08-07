import { IsNotEmpty, IsString } from "class-validator";

export class GenerateTodoDto {
  @IsString()
  @IsNotEmpty()
  goal: string;
}