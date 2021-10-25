import {createStore} from 'redux';
import {reduceNickName, reduceContactList, reducePickedUserChat, reduceGeneralChat} from './reducer';
import {AppStateNickname, AppStateContactList, AppStatePickedUserChat, AppStateGeneralChat} from './app-state';

export const storeNickName = createStore(reduceNickName, new AppStateNickname());
export const storeContactList = createStore(reduceContactList, new AppStateContactList());
export const storePickedUserChat = createStore(reducePickedUserChat, new AppStatePickedUserChat());
export const storeGeneralChat = createStore(reduceGeneralChat, new AppStateGeneralChat());