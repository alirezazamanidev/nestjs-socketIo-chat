import { BaseEntity } from 'src/common/abstracts/baseEntity.abstract';
import { EntityName } from 'src/common/enums';
import { ConnectedUserEntity, RoomEntity } from 'src/modules/chat/entities';
import { MessageEntity } from 'src/modules/chat/entities/message.entity';
import { RoomParticipantsUserEntity } from 'src/modules/chat/entities/room-participants-user.entity';
import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';
@Entity(EntityName.User)
export class UserEntity extends BaseEntity {
  @Column({})
  fullname: string;
  @Column({ unique: true })
  email: string;
  @Column()
  hashedPassword: string;
  @OneToMany(()=>MessageEntity,msg=>msg.sender)
  messages:MessageEntity[]
  @OneToMany(()=>ConnectedUserEntity,coUser=>coUser.user)
  connectedUsers:ConnectedUserEntity[]
  @OneToMany(() => RoomParticipantsUserEntity, (room) => room.user)
  rooms: RoomParticipantsUserEntity[];
}
