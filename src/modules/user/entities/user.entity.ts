import { BaseEntity } from 'src/common/abstracts/baseEntity.abstract';
import { EntityName } from 'src/common/enums';
import { ConnectedUserEntity } from 'src/modules/chat/entities';
import { MessageEntity } from 'src/modules/chat/entities/message.entity';
import { Column, Entity, OneToMany } from 'typeorm';
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
}
