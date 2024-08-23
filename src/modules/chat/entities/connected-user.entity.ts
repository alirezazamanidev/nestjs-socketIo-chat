import { BaseEntity } from "src/common/abstracts/baseEntity.abstract";
import { EntityName } from "src/common/enums";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity(EntityName.ConnectedUser)
export class ConnectedUserEntity extends BaseEntity {
    @Column()
    userId:string
    @Column()
    socketId:string
    @ManyToOne(() => UserEntity, (user) => user.connectedUsers)
    @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
    user: UserEntity;
}