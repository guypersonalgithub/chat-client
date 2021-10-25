import React, { Component, ChangeEvent } from "react";
import './menu.css';
import socket from '../../services/socketService';
import {storeNickName, storeContactList, storePickedUserChat, storeGeneralChat} from '../../redux/store';
import {ActionTypeContactList, ActionTypeGeneralChat, ActionTypePickedUserChat} from '../../redux/action-type';
import { Contact } from '../../models/Contact';

interface Users {

    usernames: any[];
    nickname: string;
    menuVersion: boolean;
    phoneMenuClass: string;
    phoneUserMenuClass: string;
    phoneUnseenMessagesUpdate: boolean;

}

export default class Menu extends Component <any, Users> {

    nickname: any;
    unseen_messages: any;

    constructor(props:any) {
        super(props)
        this.state = {usernames: [], nickname: "", menuVersion: true, phoneMenuClass: "phoneUsers", phoneUserMenuClass: "phoneUserListHidden", phoneUnseenMessagesUpdate: false};
    }

    isMenuOnSideOrBottom = () => {

        if (window.innerWidth <= 600 && this.state.menuVersion) {

            this.setState({

                usernames: this.state.usernames,
                nickname: this.state.nickname,
                menuVersion: false,
                phoneMenuClass: this.state.phoneMenuClass,
                phoneUserMenuClass: this.state.phoneUserMenuClass,
                phoneUnseenMessagesUpdate: this.state.phoneUnseenMessagesUpdate

            });

        }

        else if (window.innerWidth > 600 && !this.state.menuVersion) {

            this.setState({

                usernames: this.state.usernames,
                nickname: this.state.nickname,
                menuVersion: true,
                phoneMenuClass: this.state.phoneMenuClass,
                phoneUserMenuClass: this.state.phoneUserMenuClass,
                phoneUnseenMessagesUpdate: this.state.phoneUnseenMessagesUpdate

            });
            
        }

    }

    componentDidMount() {

        window.addEventListener('resize', this.isMenuOnSideOrBottom, true);

        if (window.innerWidth <= 600) {

            this.setState({

                usernames: this.state.usernames,
                nickname: this.state.nickname,
                menuVersion: false,
                phoneMenuClass: this.state.phoneMenuClass,
                phoneUserMenuClass: this.state.phoneUserMenuClass,
                phoneUnseenMessagesUpdate: this.state.phoneUnseenMessagesUpdate

            });

        }

        // Gets nickname for display in the menu component.

        this.nickname = storeNickName.subscribe(() => {

            if (storeNickName.getState().nickname != null && storeNickName.getState().nickname != this.state.nickname) {

                let nickname = storeNickName.getState().nickname;

                this.setState({
                    usernames: this.state.usernames,
                    nickname: nickname,
                    menuVersion: this.state.menuVersion,
                    phoneMenuClass: this.state.phoneMenuClass,
                    phoneUserMenuClass: this.state.phoneUserMenuClass,
                    phoneUnseenMessagesUpdate: this.state.phoneUnseenMessagesUpdate
                });

            }

        });

        this.unseen_messages = storeContactList.subscribe(() => {

            if (storeContactList.getState().didUnseenMessagesUpdate) {

                let usernames = storeContactList.getState().contactList.slice();

                this.setState({
                    usernames: usernames,
                    nickname: this.state.nickname,
                    menuVersion: this.state.menuVersion,
                    phoneMenuClass: this.state.phoneMenuClass,
                    phoneUserMenuClass: this.state.phoneUserMenuClass,
                    phoneUnseenMessagesUpdate: true
                });

                storeContactList.dispatch({type: ActionTypeContactList.updateDidUnseenMessagesUpdate, payload: false});

            }

        });

        // Takes all connected users from the server and initializes the menu.
        socket.emit('getusers', "");
        socket.on('getallusers', (data) => {

            let contactList = [];

            for (let i = 0; i < data.length; i++) {

                let contact = new Contact(data[i], [], 0);
                contactList.push(contact);

            }

            storeContactList.dispatch({type: ActionTypeContactList.updateContactList, payload: contactList});

            this.setState({

                usernames: contactList,
                nickname: this.state.nickname,
                menuVersion: this.state.menuVersion,
                phoneMenuClass: this.state.phoneMenuClass,
                phoneUserMenuClass: this.state.phoneUserMenuClass,
                phoneUnseenMessagesUpdate: this.state.phoneUnseenMessagesUpdate

            });

        });

        // Initializes user data once a new one connects, then updates the store and re-renders the component.
        socket.on('userconnected', (data) => {

            if (storeNickName.getState().nickname != null) {

                let generalMessages = storeGeneralChat.getState().generalChat.slice();
                generalMessages.push(data.system);
                storeGeneralChat.dispatch({type: ActionTypeGeneralChat.updateGeneralChat, payload: generalMessages});

            }

            let users = storeContactList.getState().contactList.slice();

            let userExists = false;

            for (let i = 0; i < users.length; i++) {

                if (data.data == users[i].nickname) {

                    userExists = true;
                    break;

                }

            }

            if (!userExists) {

                let newUser = new Contact(data.data, [], 0);
                users.push(newUser);
    
                storeContactList.dispatch({type: ActionTypeContactList.updateContactList, payload: users});
    
                this.setState({
    
                    usernames: users,
                    nickname: this.state.nickname,
                    menuVersion: this.state.menuVersion,
                    phoneMenuClass: this.state.phoneMenuClass,
                    phoneUserMenuClass: this.state.phoneUserMenuClass,
                    phoneUnseenMessagesUpdate: this.state.phoneUnseenMessagesUpdate
    
                });

            }

        });

        // Removes the logged off user, updates the store and re-renders the component.
        socket.on('disconnected', (data: any) => {

            if (storeNickName.getState().nickname != null) {

                let generalMessages = storeGeneralChat.getState().generalChat.slice();

                generalMessages.push(data.system);

                storeGeneralChat.dispatch({type: ActionTypeGeneralChat.updateGeneralChat, payload: generalMessages});

            }

            let users = storeContactList.getState().contactList.slice();

            for (let i = 0; i < users.length; i++) {

                if (data.data == users[i].nickname) {

                    if (storePickedUserChat.getState().pickedUserChat == i) {

                        storePickedUserChat.dispatch({type: ActionTypePickedUserChat.updatePickedUserChat, payload: -1});

                    }

                    users.splice(i, 1);
                    break;

                }

            }

            storeContactList.dispatch({type: ActionTypeContactList.updateContactList, payload: users});

            this.setState({

                usernames: users,
                nickname: this.state.nickname,
                menuVersion: this.state.menuVersion,
                phoneMenuClass: this.state.phoneMenuClass,
                phoneUserMenuClass: this.state.phoneUserMenuClass,
                phoneUnseenMessagesUpdate: this.state.phoneUnseenMessagesUpdate

            })

        });

        socket.io.on("reconnect", (attempt) => {

            socket.emit('getusers', "");

        });

    }

    componentWillUnmount() {

        window.removeEventListener('resize', this.isMenuOnSideOrBottom, true);

        if (this.nickname) {

            this.nickname();

        }

        if (this.unseen_messages) {

            this.unseen_messages();

        }

    }

    pickUser = (user: Contact) => {

        if (this.state.nickname != "") {

            let pickedUserIndex;

            let contactList = storeContactList.getState().contactList.slice();
    
            for (let i = 0; i < contactList.length; i++) {
    
                if (user.nickname == contactList[i].nickname) {
    
                    pickedUserIndex = i;
                    break;
    
                }
    
            }
    
            if (pickedUserIndex != null) {
    
                contactList[pickedUserIndex].unseen_messages = 0;
    
                storePickedUserChat.dispatch({type: ActionTypePickedUserChat.updatePickedUserChat, payload: pickedUserIndex});
                storeContactList.dispatch({type: ActionTypeContactList.updateContactList, payload: contactList});

                if (this.state.phoneMenuClass != "phoneUsers" || this.state.phoneUserMenuClass != "phoneUserListHidden") {

                    this.setState({

                        usernames: [contactList[pickedUserIndex]],
                        nickname: this.state.nickname,
                        menuVersion: this.state.menuVersion,
                        phoneMenuClass: "phoneUsers",
                        phoneUserMenuClass: "phoneUserListHidden",
                        phoneUnseenMessagesUpdate: this.state.phoneUnseenMessagesUpdate
                    });

                }

                else {

                    this.setState({

                        usernames: [contactList[pickedUserIndex]],
                        nickname: this.state.nickname,
                        menuVersion: this.state.menuVersion,
                        phoneMenuClass: this.state.phoneMenuClass,
                        phoneUserMenuClass: this.state.phoneUserMenuClass,
                        phoneUnseenMessagesUpdate: this.state.phoneUnseenMessagesUpdate
                    });

                }
    
            }

        }

    }

    pickUserPhone = (user: Contact) => {

        this.pickUser(user);

    }

    backToGeneral = () => {

        if (storePickedUserChat.getState().pickedUserChat != -1) {

            storePickedUserChat.dispatch({type: ActionTypePickedUserChat.updatePickedUserChat, payload: -1});

        }

    }

    backToGeneralPhone = () => {

        this.setState({

            usernames: this.state.usernames,
            nickname: this.state.nickname,
            menuVersion: this.state.menuVersion,
            phoneMenuClass: "phoneUsers",
            phoneUserMenuClass: "phoneUserListHidden",
            phoneUnseenMessagesUpdate: this.state.phoneUnseenMessagesUpdate

        });

        this.backToGeneral();

    }

    openPhoneMenu = () => {

        if (this.state.phoneMenuClass == "phoneUsers") {

            this.setState({

                usernames: this.state.usernames,
                nickname: this.state.nickname,
                menuVersion: this.state.menuVersion,
                phoneMenuClass: "phoneUsersClicked",
                phoneUserMenuClass: "phoneUserList",
                phoneUnseenMessagesUpdate: false

            })

        }

        else if (this.state.phoneMenuClass == "phoneUsersClicked") {

            this.setState({

                usernames: this.state.usernames,
                nickname: this.state.nickname,
                menuVersion: this.state.menuVersion,
                phoneMenuClass: "phoneUsers",
                phoneUserMenuClass: "phoneUserListHidden",
                phoneUnseenMessagesUpdate: this.state.phoneUnseenMessagesUpdate

            })

        }

    }

    render() {

        if (this.state.menuVersion) {

            return(
            
                <div className = "menuContainer">
    
                    <div className="menuHeader">
                        <div className="menuHeaderIcon">
    
                            <svg xmlns="http://www.w3.org/2000/svg" width="35%" height="100%" fill="rgba(22, 32, 54)" className="bi bi-person-fill" viewBox="-3.5 -7 23 30">
                                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                            </svg>
    
                        </div>
    
                        <div className="menuHeaderName">
    
                            {this.state.nickname}
    
                        </div>
    
                    </div>
    
                    <div className="users">
    
                        <button className="userButtons" onClick={this.backToGeneral}>
    
                            <span className = "menuText">
        
                                General Chat
        
                            </span>                        
    
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" className="menuButtons">
                            <path fillRule="evenodd" d="m8 3.293 6 6V13.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V9.293l6-6zm5-.793V6l-2-2V2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5z" />
                            <path fillRule="evenodd" d="M7.293 1.5a1 1 0 0 1 1.414 0l6.647 6.646a.5.5 0 0 1-.708.708L8 2.207 1.354 8.854a.5.5 0 1 1-.708-.708L7.293 1.5z" />
                            </svg>
    
                        </button>
    
                        {this.state.usernames.map((value: any, index: any, array: any) => {
    
                            if (array[index].unseen_messages > 0 && array[index].unseen_messages < 10) {
    
                                return(
                                    <div key={index}>
                                        <button className="userButtons" onClick = {() => this.pickUser(array[index])}>
        
                                            <span className = "menuText">
        
                                                {array[index].nickname}
        
                                            </span>
    
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" className="menuButtons">
                                            <path d="M12 1a1 1 0 0 1 1 1v10.755S12 11 8 11s-5 1.755-5 1.755V2a1 1 0 0 1 1-1h8zM4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4z"/>
                                            <path d="M8 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                                            </svg>
    
                                            <span className = "unseenMessages">{array[index].unseen_messages}</span>
        
                                        </button>
                                    </div>
                                    );
    
                            }

                            else if (array[index].unseen_messages >= 10) {

                                return(
                                    <div key={index}>
                                        <button className="userButtons" onClick = {() => this.pickUser(array[index])}>
        
                                            <span className = "menuText">
        
                                                {array[index].nickname}
        
                                            </span>
    
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" className="menuButtons">
                                            <path d="M12 1a1 1 0 0 1 1 1v10.755S12 11 8 11s-5 1.755-5 1.755V2a1 1 0 0 1 1-1h8zM4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4z"/>
                                            <path d="M8 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                                            </svg>
    
                                            <span className = "unseenMessagesAboveNine">9+</span>
        
                                        </button>
                                    </div>
                                    );

                            }
    
                            else {
    
                                return(
                                    <div key={index}>
                                        <button className="userButtons" onClick = {() => this.pickUser(array[index])}>
    
                                            <span className = "menuText">
    
                                                {array[index].nickname}
    
                                            </span>
    
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" className="menuButtons">
                                            <path d="M12 1a1 1 0 0 1 1 1v10.755S12 11 8 11s-5 1.755-5 1.755V2a1 1 0 0 1 1-1h8zM4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4z"/>
                                            <path d="M8 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                                            </svg>
    
                                        </button>
                                    </div>
                                        );

    
                            }
    
                        })}
                        
                    </div>
    
                </div>
    
            );

        }

        else {

            return(
                <div className = "phoneMenu">

                    <div className = "phoneMenuName">

                        {this.state.nickname}

                    </div>

                    <div className = {this.state.phoneMenuClass}>

                        <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="rgba(22, 32, 54)" className="bi bi-person-fill" viewBox="-3.5 -7 23 30" onClick = {() => this.openPhoneMenu()}>
                            <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                        </svg>

                        {this.state.phoneUnseenMessagesUpdate ? <span className = "phoneUnseenMessagesNotice">!</span> : null}

                    </div>

                    <div className = {this.state.phoneUserMenuClass}>

                        <button className="userButtons" onClick={this.backToGeneralPhone}>

                            <span className="menuText">

                                General Chat

                        </span>

                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" className="menuButtons">
                                <path fillRule="evenodd" d="m8 3.293 6 6V13.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V9.293l6-6zm5-.793V6l-2-2V2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5z" />
                                <path fillRule="evenodd" d="M7.293 1.5a1 1 0 0 1 1.414 0l6.647 6.646a.5.5 0 0 1-.708.708L8 2.207 1.354 8.854a.5.5 0 1 1-.708-.708L7.293 1.5z" />
                            </svg>

                        </button>

                        {this.state.usernames.map((value: any, index: any, array: any) => {

                            if (array[index].unseen_messages > 0) {

                                return (
                                    <div key={index}>
                                        <button className="userButtons" onClick={() => this.pickUserPhone(array[index])}>

                                            <span className="menuText">

                                                {array[index].nickname}

                                            </span>

                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="rgb(38, 111, 201)" viewBox="0 0 16 16" className="menuButtons">
                                                <path d="M12 1a1 1 0 0 1 1 1v10.755S12 11 8 11s-5 1.755-5 1.755V2a1 1 0 0 1 1-1h8zM4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4z" />
                                                <path d="M8 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                                            </svg>

                                            <span className="unseenMessages">{array[index].unseen_messages}</span>

                                        </button>
                                    </div>
                                );

                            }

                            else {

                                return (
                                    <div key={index}>
                                        <button className="userButtons" onClick={() => this.pickUserPhone(array[index])}>

                                            <span className="menuText">

                                                {array[index].nickname}

                                            </span>

                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="rgb(38, 111, 201)" viewBox="0 0 16 16" className="menuButtons">
                                                <path d="M12 1a1 1 0 0 1 1 1v10.755S12 11 8 11s-5 1.755-5 1.755V2a1 1 0 0 1 1-1h8zM4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4z" />
                                                <path d="M8 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                                            </svg>

                                        </button>
                                    </div>
                                );

                            }

                        })}

                    </div>

                </div>
            );

        }

    }

}