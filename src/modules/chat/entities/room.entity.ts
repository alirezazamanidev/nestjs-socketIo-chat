import { BaseEntity } from 'src/common/abstracts/baseEntity.abstract';
import { EntityName } from 'src/common/enums';
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { MessageEntity } from './message.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { RoomParticipantsUserEntity } from './room-participants-user.entity';

@Entity(EntityName.Room)
export class RoomEntity extends BaseEntity {
  @Column({ nullable: true })
  name: string;
  @Column()
  type: string;
  @Column()
  createdBy: string;

  @OneToMany(() => RoomParticipantsUserEntity, (roompart) => roompart.room)
  participants:RoomParticipantsUserEntity[];
  @OneToMany(() => MessageEntity, (msg) => msg.room)
  messages: MessageEntity[];
}
