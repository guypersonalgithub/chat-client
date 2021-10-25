import {Message} from '../models/Message';

export class AppStateNickname {
    public nickname: string;
}

export class AppStateContactList {
    public contactList: any[];
    public didUnseenMessagesUpdate: boolean;

}

export class AppStatePickedUserChat {
    public pickedUserChat: number;

}

export class AppStateGeneralChat {
    public generalChat: Message[];

}