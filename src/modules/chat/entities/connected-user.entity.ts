import { BaseEntity } from "src/common/abstracts/baseEntity.abstract";
import { EntityName } from "src/common/enums";
import { Column, Entity } from "typeorm";

@Entity(EntityName.ConnectedUser)
export class ConnectedUserEntity extends BaseEntity {
    @Column()
    userId:number
    @Column()
    socketId:number
}