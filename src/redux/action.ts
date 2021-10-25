import {ActionTypeNickname, ActionTypeContactList, ActionTypePickedUserChat, ActionTypeGeneralChat} from './action-type';

export interface ActionNickName {
    type: ActionTypeNickname,
    payload?: any
}

export interface ActionContactList {
    type: ActionTypeContactList,
    payload?: any
}

export interface ActionPickedUserChat {
    type: ActionTypePickedUserChat,
    payload?: any

}

export interface ActionGeneralChat {
    type: ActionTypeGeneralChat,
    payload?: any

}