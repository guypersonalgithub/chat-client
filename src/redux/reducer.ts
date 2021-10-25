import {AppStateNickname, AppStateContactList, AppStatePickedUserChat, AppStateGeneralChat} from './app-state';
import {ActionTypeNickname, ActionTypeContactList, ActionTypePickedUserChat, ActionTypeGeneralChat} from './action-type';
import {ActionNickName, ActionContactList, ActionPickedUserChat, ActionGeneralChat} from './action';

export function reduceNickName(oldAppState: AppStateNickname, action: ActionNickName): AppStateNickname {

    const newpAppState = { ...oldAppState };

    switch(action.type) {
        case ActionTypeNickname.updateUserNickname:
            newpAppState.nickname = action.payload;
        break;
    }

    return newpAppState

}

export function reduceContactList(oldAppState: AppStateContactList, action: ActionContactList): AppStateContactList {

    const newpAppState = { ...oldAppState };

    switch(action.type) {
        case ActionTypeContactList.updateContactList:
            newpAppState.contactList = action.payload;
        break;
        case ActionTypeContactList.updateDidUnseenMessagesUpdate:
            newpAppState.didUnseenMessagesUpdate = action.payload;
        break;
    }

    return newpAppState

}

export function reducePickedUserChat(oldAppState: AppStatePickedUserChat, action: ActionPickedUserChat): AppStatePickedUserChat {

    const newAppState = { ...oldAppState };

    switch(action.type) {
        case ActionTypePickedUserChat.updatePickedUserChat:
            newAppState.pickedUserChat = action.payload;
        break;
    }

    return newAppState;

}

export function reduceGeneralChat(oldAppState: AppStateGeneralChat, action: ActionGeneralChat): AppStateGeneralChat {

    const newAppState = { ...oldAppState };

    switch(action.type) {
        case ActionTypeGeneralChat.updateGeneralChat:
            newAppState.generalChat = action.payload;
        break;
    }

    return newAppState;

}