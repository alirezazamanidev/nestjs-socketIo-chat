
import { BaseEntity } from 'src/common/abstracts/baseEntity.abstract';
import { EntityName } from 'src/common/enums';
import { Column, Entity } from 'typeorm';

@Entity(EntityName.RoomParticipantsUser)
export class RoomParticipantsUser extends BaseEntity {
  @Column()
  userId: string;

  @Column()
  roomId: string;

  @Column()
  createdBy: string;

  @Column()
  updatedBy: string;
}
