import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class SignUpDto {
  @ApiProperty({ example: 'alireza zamani', type: String })
  @IsNotEmpty()
  @IsString()
  fullname: string;
  @ApiProperty({ example: 'zamani@gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(8, 20)
  password: string;
}
