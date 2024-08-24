import { BaseEntity } from 'src/common/abstracts/baseEntity.abstract';
import { EntityName } from 'src/common/enums';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { RoomEntity } from './room.entity';

@Entity(EntityName.RoomParticipantsUser)
export class RoomParticipantsUserEntity extends BaseEntity {
  @Column()
  userId: string;

  @Column()
  roomId: string;

  @Column()
  createdBy: string;

  @Column()
  updatedBy: string;

  @ManyToOne(() => UserEntity, (user) => user.rooms, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: UserEntity;
  @ManyToOne(() => RoomEntity, (room) => room.participants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  room: RoomEntity;
}
