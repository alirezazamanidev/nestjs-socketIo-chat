import { BaseEntity } from 'src/common/abstracts/baseEntity.abstract';
import { EntityName } from 'src/common/enums';
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { MessageEntity } from './message.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';

@Entity(EntityName.Room)
export class RoomEntity extends BaseEntity {
  @Column({ nullable: true })
  name: string;
  @Column()
  type: string;
  @Column()
  createdBy: string;

  @ManyToMany(() => UserEntity, (user) => user.rooms)
  @JoinTable({
    name: 'roomParticipantsUser',
    joinColumn: {
      name: 'roomId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
  })
  participants: UserEntity[];
  @OneToMany(() => MessageEntity, (msg) => msg.room)
  messages: MessageEntity[];
}
