import React from "react";
import styled from "styled-components";
import axios from "axios";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import "./skeleton.css";
import "./App.css";

/*
|--------------------------------------------------------------------------
| Styled Components
|--------------------------------------------------------------------------
*/

const PageContainer = styled.div`
  padding: 18px;
  max-width: 600px;
`;

const EmailInput = styled.input`
  height: 38px;
  margin-right: 6px;
  border-radius: 3px;
  border: 1px solid #bbb;
  padding: 8px;
  box-sizing: border-box;
`;

const MessagesContainer = styled.div`
  padding: 16px;
  border: 1px solid #bbb;
  box-sizing: border-box;
  height: 600px;
  margin-bottom: 12px;
  overflow-y: scroll;
`;

const MessageInput = styled.textarea`
  width: 100%;
  padding: 16px;
  box-sizing: border-box;
  margin-bottom: 12px;
`;

const Message = styled.div`
  background: whitesmoke;
  width: fit-content;
  padding: 16px;
  box-sizing: border-box;
  margin-bottom: 12px;
  border: 1px solid #bbb;
`;

/*
|--------------------------------------------------------------------------
| Welcome Page
|--------------------------------------------------------------------------
*/

class WelcomePage extends React.Component {
  state = { email: "" };
  _onSubmitEmailAddress = () => {
    const { email } = this.state;
    const { setEmail } = this.props;
    // the setting of this global email is like logging in
    setEmail(email);
  };
  render() {
    const { email } = this.state;
    return (
      <div>
        <h1>Welcome</h1>
        <EmailInput
          value={email}
          onChange={e => this.setState({ email: e.target.value })}
          placeholder="email"
        />
        <Link to="/chat" onClick={this._onSubmitEmailAddress}>
          <button>Join chat</button>
        </Link>
      </div>
    );
  }
}

/*
|--------------------------------------------------------------------------
| Message Thread Page
|--------------------------------------------------------------------------
*/

class ChatPage extends React.Component {
  constructor(props) {
    super(props);
    this.socket = new WebSocket("ws://localhost:8080/ws");
  }
  state = { messages: [], newMessage: "" };

  componentDidMount() {
    this._loadMessages();
    this._activateSocketConnection();
  }

  componentWillUnmount() {
    this.socket.close();
  }

  // load chat history
  _loadMessages = () => {
    axios.get("http://localhost:8080/get-all-messages").then(res => {
      this.setState({ messages: res.data.messages });
    });
  };

  // activate socket communication
  _activateSocketConnection = () => {
    this.socket.onopen = () => {
      console.log("Successfully Connected");
      // send welcome message to new user from mount sinai bot
      this.socket.send(
        JSON.stringify({
          Author: "mt sinai bot",
          Text: "welcome, " + (this.props.email || "anon user")
        })
      );
    };

    this.socket.onmessage = msg => {
      this._addMessageToThread(JSON.parse(msg.data));
    };

    this.socket.onclose = event => {
      console.log("Socket Closed Connection: ", event);
    };

    this.socket.onerror = error => {
      console.log("Socket Error: ", error);
    };
  };

  // add message to thread (UI only)
  _addMessageToThread = msg =>
    this.setState({ messages: [...this.state.messages, msg] });

  // broadcast new message and add to chat history
  _postNewMessage = () => {
    const { newMessage } = this.state;
    const { email } = this.props;
    const formattedMsg = {
      Author: email || "anon",
      Text: newMessage
    };
    this.socket.send(JSON.stringify(formattedMsg));
    this.setState({ newMessage: "" });
  };

  render() {
    const { newMessage, messages } = this.state;
    return (
      <div>
        <div>Total messages: {messages.length}</div>
        <MessagesContainer>
          {messages.map(({ Author, Text }) => {
            return (
              <Message key={Text}>
                <div style={{ textDecoration: "underline" }}>{Author}</div>
                <div>{Text}</div>
              </Message>
            );
          })}
        </MessagesContainer>
        <form>
          <MessageInput
            placeholder="enter message"
            value={newMessage}
            onChange={e => this.setState({ newMessage: e.target.value })}
          />
          <button onClick={this._postNewMessage} type="button">
            Send
          </button>
        </form>
      </div>
    );
  }
}

/*
|--------------------------------------------------------------------------
| Main Application
|--------------------------------------------------------------------------
*/

class App extends React.Component {
  state = { email: undefined };
  render() {
    const { email } = this.state;
    return (
      <PageContainer>
        <Router>
          <Switch>
            <Route exact path="/">
              <WelcomePage setEmail={email => this.setState({ email })} />
            </Route>
            <Route exact path="/chat">
              <ChatPage email={email} />
            </Route>
          </Switch>
        </Router>
      </PageContainer>
    );
  }
}

export default App;
