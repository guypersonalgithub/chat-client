import React, { Component, ChangeEvent } from "react";
import './pickname.css';
import socket from '../../services/socketService';
import {storeNickName, storeContactList} from '../../redux/store';
import { ActionTypeNickname } from '../../redux/action-type';

interface Nickname {

    nickname: string,
    socket: string

}

export default class PickName extends Component <any, Nickname> {

    public connected: boolean = false;

    constructor(props:any) {
        super(props)
        this.state = {nickname: "", socket: "connected"};
    }

    componentDidMount() {

        if (storeNickName.getState().nickname != null) {

            storeNickName.dispatch({type: ActionTypeNickname.updateUserNickname, payload: null});

        }

        socket.on("connect", () => {

            if (!this.connected) {

                this.connected = true;

            }

        });

        socket.on("connect_error", (err) => {

            if (this.connected) {

                this.connected = false;

            }

        });

    }

    componentWillUnmount() {

        socket.off('connect');
        socket.off('connect_error');

    }

    updateNickname = (args: ChangeEvent<HTMLInputElement>) => {
        
        const nickname = args.target.value;
        this.setState({
            nickname: nickname,
            socket: this.state.socket
        });

    }

    submit = () => {

        if (!this.connected) {

            alert ("It seems like the Heroku VM instance was sleeping, please wait for a moment for the server to boot up and then try again.");

        }

        else if (this.connected) {

            let takenNickNames = storeContactList.getState().contactList;

            let canPickNickname = true;
    
            if (this.state.nickname.length < 3 || this.state.nickname.length > 12) {
    
                alert ("Please pick a nickname between 3 to 12 characters");
                canPickNickname = false;
    
            }
    
            if (canPickNickname && takenNickNames) {
    
                for (let i = 0; i < takenNickNames.length; i++) {
    
                    if (this.state.nickname == takenNickNames[i].nickname) {
        
                        canPickNickname = false;
                        alert ("Nickname taken, please pick another one.");
                        break;
        
                    }
        
                }
    
            }
    
            if (canPickNickname) {
    
                socket.emit('adduser', this.state.nickname);
                storeNickName.dispatch({type: ActionTypeNickname.updateUserNickname, payload: this.state.nickname});
                this.props.history.push("/chat");
    
            }

        }

    }

    handleKeyPress = (event: any) => {

        if (event.key === "Enter") {

            this.submit();

        }

    }

    render() {

        return(
            <div className = "pickNickname">
                <div className = "centerItems">

                    <div className="welcomeTextHeader">Welcome!</div>
                    <div className="welcomeTextSecondaryHeader">A couple of things you should be aware of:</div>
                    <div className="welcomeText">- The free hosting service of the backend forces the virtual machine instance to sleep if there is atleast 30 minutes of user inactivity. This may result in a slow bootup time for the very first time when you enter the service, however, once the server is up, user experience shouldn't be affected.</div>
                    <div className="welcomeText">- Due to hardware and resource limitations of the server, the messages aren't saved in a database. Instead, they are saved inside a temporary server-sided cache that gets deleted the moment the server shuts down/sleeps.</div>
                    <div className="welcomeText">- The general chat updates whenever a user enters or leaves the chat. It is also possible to communicate inside it with other users, however, in order to avoid spam, notifications aren't enabled for that specific chat.</div>
                    <div className="welcomeText">- Whenever a user sends another user a message, while said receiver isn't inside the current chat, a notification icon will appear next to said user's name inside the user menu. The number correlates according to the amount of new messages sent. Entering a chat will remove said notifications.</div>
                    <div className="welcomeText">- Once a user quits the chat, the private chats with said user on each and every online user client will be automatically deleted.</div>
                    <div className="welcomeText">- Refreshing the page or leaving it will result in a disconnection. Once a user disconnects, their old nickname is available for others to use.</div>
                    <div className="welcomeText">- For phone users, the chat menu is available by pressing the button at the bottom of the screen.</div>
                    <div className="welcomeText">-  When messages get sent to a phone user through a chat that isn't currently displayed, an exclamation mark will appear on the button. Opening the chat will remove it on purpose, regardless to whether the user checked the chat to remove the new notifications. This is done on purpose to notify users of new messages but let them ignore new messages from chats they are not interested in reading.</div>
                    <div className="enterNick">

                        <div>

                            <input type="text" className="enterNameInput" placeholder="Nickname" name="nickname" value={this.state.nickname} onChange={this.updateNickname} onKeyPress={this.handleKeyPress} />

                        </div>
                        <input type="button" className="enterNameButton" value="Enter Chat" onClick={this.submit} />

                    </div>

                </div>
        </div>
        );

    }

}