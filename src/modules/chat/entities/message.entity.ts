import { BaseEntity } from "src/common/abstracts/baseEntity.abstract";
import { EntityName } from "src/common/enums";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { RoomEntity } from "./room.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";

@Entity(EntityName.Message)
export class MessageEntity extends BaseEntity {

    @Column()
    roomId:string
    @Column()
    text:string
    @Column()
    senderId:string
    @ManyToOne(()=>RoomEntity,room=>room.messages,{onDelete:'CASCADE'})
    @JoinColumn()
    room:RoomEntity
    @ManyToOne(()=>UserEntity,user=>user.messages,{onDelete:'CASCADE'})
    @JoinColumn()
    sender:UserEntity
}