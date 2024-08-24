import { RoomEntity } from "../../entities";
import { MessageDto } from "../message/message.dto";

export class RoomDetailDto extends RoomEntity {
    lastMessage:MessageDto
}