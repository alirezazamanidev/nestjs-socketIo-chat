import { ApiProperty } from '@nestjs/swagger';
export class MessageDto {
  @ApiProperty({ example: '987fbc97-4bed-5078-9f07-9141ba07c9f3' })
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  roomId: string;

  @ApiProperty({ example: 'Hello, this is a message.' })
  text: string;

}
