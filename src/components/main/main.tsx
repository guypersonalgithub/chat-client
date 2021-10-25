import React, { Component, ChangeEvent } from "react";
import './main.css';
import socket from '../../services/socketService';
import { Message } from '../../models/Message';
import {storeContactList, storePickedUserChat, storeGeneralChat, storeNickName} from '../../redux/store';
import {ActionTypeContactList, ActionTypePickedUserChat, ActionTypeGeneralChat, ActionTypeNickname} from '../../redux/action-type';

interface ChatDetails {

    messages: Message[];
    currentMessage: string;
    pickedUserChat: number;
    generalChat: Message[];

}

export default class Chat extends Component<any, ChatDetails> {

    chatBottomRef: any;
    pickedUser: any;
    generalChat: any;

    disconnected: boolean = false;

    constructor(props:any) {
        super(props)
        this.state = {messages: [], currentMessage: "", pickedUserChat: -1, generalChat: []}
        this.chatBottomRef = React.createRef();
    }

    scrollToBottom = () => {

        this.chatBottomRef.current.scrollIntoView();
    }

    componentDidUpdate() {

        this.scrollToBottom();

    }

    componentDidMount() {

        if (storeNickName.getState().nickname == null) {

            this.props.history.push('/');

        }

        else {

            socket.emit('getmessages', "");
            socket.on('getallmessages', (data) => {
    
                storeGeneralChat.dispatch({type: ActionTypeGeneralChat.updateGeneralChat, payload: data});
    
                this.setState({
    
                    messages: this.state.messages,
                    currentMessage: this.state.currentMessage,
                    pickedUserChat: this.state.pickedUserChat,
                    generalChat: data
    
                });
    
            });
    
            this.pickedUser = storePickedUserChat.subscribe(() => {
    
                if (storePickedUserChat.getState().pickedUserChat != this.state.pickedUserChat) {
    
                    if (storePickedUserChat.getState().pickedUserChat != -1) {
    
                        let pickedUserChat = storePickedUserChat.getState().pickedUserChat;
                        let messages = storeContactList.getState().contactList[pickedUserChat].messages.slice();
        
                        this.setState({
        
                            messages: messages,
                            currentMessage: this.state.currentMessage,
                            pickedUserChat: pickedUserChat,
                            generalChat: this.state.generalChat
        
                        });
    
                    }
    
                    else {
    
                        let pickedUserChat = -1;
    
                        this.setState({
    
                            messages: this.state.messages,
                            currentMessage: this.state.currentMessage,
                            pickedUserChat: pickedUserChat,
                            generalChat: this.state.generalChat
    
                        });
    
                    }
                    
                }
    
            });
    
            this.generalChat = storeGeneralChat.subscribe(() => {
    
                let generalChat = storeGeneralChat.getState().generalChat.slice();
    
                if (this.state.generalChat.length < generalChat.length) {
    
                    this.setState({
    
                        messages: this.state.messages,
                        currentMessage: this.state.currentMessage,
                        pickedUserChat: this.state.pickedUserChat,
                        generalChat: generalChat
    
                    });
    
                }
    
            });
    
            socket.on('receivemessage', (data: any) => {
    
                if (data.to == "you") {
    
                    let currentMessages = storeContactList.getState().contactList.slice();
    
                    let senderIndex;
        
                    for (let i = 0; i < currentMessages.length; i++) {
        
                        if (data.content.sender == currentMessages[i].nickname) {
        
                            senderIndex = i;
                            break;
        
                        }
        
                    }
        
                    if (senderIndex != null) {
        
                        let newMessage = new Message(data.content.sender, data.content.message);
                        currentMessages[senderIndex].messages.push(newMessage);
        
                        if (this.state.pickedUserChat != senderIndex) {
    
                            currentMessages[senderIndex].unseen_messages = currentMessages[senderIndex].unseen_messages + 1;
    
                            storeContactList.dispatch({type: ActionTypeContactList.updateContactList, payload: currentMessages});
                            storeContactList.dispatch({type: ActionTypeContactList.updateDidUnseenMessagesUpdate, payload: true});
    
                        }
    
                        else {
    
                            storeContactList.dispatch({type: ActionTypeContactList.updateContactList, payload: currentMessages});
    
                            this.setState({
    
                                messages: currentMessages[senderIndex].messages,
                                currentMessage: this.state.currentMessage,
                                pickedUserChat: this.state.pickedUserChat,
                                generalChat: this.state.generalChat
    
                            });
    
                        }
    
                    }
    
                }
    
                else {
    
                    let messages = this.state.generalChat;
                    let newMessage = new Message(data.content.sender, data.content.message);
                    messages.push(newMessage);
    
                    this.setState({
    
                        messages: this.state.messages,
                        currentMessage: this.state.currentMessage,
                        pickedUserChat: this.state.pickedUserChat,
                        generalChat: messages
    
                    });
    
                    storeGeneralChat.dispatch({type: ActionTypeGeneralChat.updateGeneralChat, payload: messages});
    
                }
    
            });

            socket.on("connect_error", (err) => {

                if (!this.disconnected) {

                    alert ("It seems like the Heroku VM instance was sleeping, please pick a nickname again and try sending the message you wanted once again.");
                    this.disconnected = true;
                    this.props.history.push("/");

                }
    
            });

        }

    }

    componentWillUnmount() {

        if (this.pickedUser != null) {

            this.pickedUser();

        }

        if (this.generalChat != null) {

            this.generalChat();

        }

        socket.off('getallmessages');
        socket.off('receivemessage');
        socket.off('connect_error');

    }

    sendMessage(message: any) {

        if (message.replace(/\s/g, '').length > 0 && storeNickName.getState().nickname != null) {

            let currentMessages;

            if (this.state.pickedUserChat == -1) {

                currentMessages = this.state.generalChat;
                let newMessage = new Message("me", message);
                currentMessages.push(newMessage);

                storeGeneralChat.dispatch({type: ActionTypeGeneralChat.updateGeneralChat, payload: currentMessages});
                socket.emit('sendmessage', {sent_to: "general_chat", message: message});

                this.setState({
                    messages: this.state.messages,
                    currentMessage: "",
                    pickedUserChat: this.state.pickedUserChat,
                    generalChat: currentMessages
                });

            }

            else {

                currentMessages = storeContactList.getState().contactList.slice();
                let newMessage = new Message("me", message);
                currentMessages[this.state.pickedUserChat].messages.push(newMessage);

                storeContactList.dispatch({type: ActionTypeContactList.updateContactList, payload: currentMessages});
                socket.emit('sendmessage', {sent_to: currentMessages[this.state.pickedUserChat].nickname, message: message});

                this.setState({
                    messages: currentMessages[this.state.pickedUserChat].messages,
                    currentMessage: "",
                    pickedUserChat: this.state.pickedUserChat,
                    generalChat: this.state.generalChat
                });

            }

        }

    }

    updateMessage = (args: ChangeEvent<HTMLTextAreaElement>) => {
        
        const message = args.target.value;
        this.setState({
            messages: this.state.messages,
            currentMessage: message,
            pickedUserChat: this.state.pickedUserChat,
            generalChat: this.state.generalChat
        });

    }

    handleKeyPress = (event: any) => {
        
        if (event.key === "Enter" && event.shiftKey) {

            this.sendMessage(this.state.currentMessage);

            if(event.preventDefault) event.preventDefault();
            return false;

        }

    }

    renderChat = (messageArray: any[]) => {

        return(
            <div id = "chat">
                
                <div id = "messages">

                    {messageArray.map((value: any, index: any, array: any) => {

                        let currentSender = array[index].sender;
                        if (currentSender == "system") {

                            return (               

                                <div key={index} className="messageWrapper">
                                    <div className="systemMessage">
                                        <div className="systemMessageText">

                                            {array[index].message}

                                        </div>
                                    </div>
                                </div>

                            )

                        }

                        else if (currentSender == "me") {

                            return(

                                <div key={index} className="messageWrapper">
                                    <div className="myMessage">
                                        <div className="messageText">

                                            <div className="messageSender">

                                                You

                                            </div>

                                            {array[index].message.split("\n").map((value: any, index: any, array: any) => {

                                                return (<div key={index}>{array[index]}</div>)

                                            })}

                                        </div>
                                    </div>
                                </div>

                            )

                        }

                        else {
                                
                            return(

                                <div key={index} className="messageWrapper">
                                    <div className="otherMessage">
                                        <div className="messageText">

                                            <div className="messageSender">

                                                {array[index].sender}

                                            </div>

                                            <div>

                                                {array[index].message.split("\n").map((value: any, index: any, array: any) => {

                                                    return (<div key={index}>{array[index]}</div>)

                                                })}

                                            </div>

                                        </div>
                                    </div>
                                </div>

                            )

                        }

                    })}

                    <div className="messageWrapper">

                        <div className="last" ref = {this.chatBottomRef}>

                        </div>

                    </div>
                    
                </div>

                <div id = "messageContainer">

                    <div id="sendMessage">
                        <textarea className = "textInput" value = {this.state.currentMessage} onChange = {this.updateMessage} onKeyPress={this.handleKeyPress}></textarea>
                        <input className="sendButton" type="button" value="Send" onClick = {() => this.sendMessage(this.state.currentMessage)}></input>

                    </div>

                </div>

            </div>
        )

    }

    render() {

        if (this.state.pickedUserChat == -1) {

            return (this.renderChat(this.state.generalChat));

        }

        else {

            return ((this.renderChat(this.state.messages)));

        }

    }

}