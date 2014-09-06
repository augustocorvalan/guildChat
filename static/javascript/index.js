/** @jsx React.DOM */
var username = localStorage.getItem('username');
var Bootstrap = window.ReactBootstrap;
var Panel = Bootstrap.Panel;
var Alert = Bootstrap.Alert;
var Jumbotron = Bootstrap.Jumbotron;
var Col = Bootstrap.Col;
var Row = Bootstrap.Row;

var users = [];
var socket = io();

var ChatRoom = React.createClass({
    getInitialState: function () {
        return ({username: username},{users:users});
    },
    componentDidMount: function () {
        var that = this;
        socket.on('new user', function (othername) {
            if (othername === username) {return false;}
            that.addUser(othername);
            socket.emit('user info', username);
        });

        socket.on('user info', function (username) {
            that.addUser(username);
        });

    },
    addUser: function (username) {
        if (users.indexOf(username) > -1) {return false;}
        users.push(username);
        this.setState({users: users});

    },
    handleLogin: function (username) {
        this.setState({username:username})
        this.addUser(username);
    },
    render: function () {
        if (this.state.username) {
          return (
            <div className="chatRoom">
                <ChatUsers users={this.state.users}/>
                <ChatBox />
            </div> )
        } else {
            return (
                <Jumbotron>
                    <h1>Welcome to the Guild</h1>
                    <p>Login below to start</p>
                    <ChatLogin onSubmit={this.handleLogin} />
                </Jumbotron>
            );
        }
    }
});

var ChatUsers = React.createClass({
    getInitialState : function () {
        return {users : users};
    },
    render: function () {
        var otherMembers;
        otherMembers = this.props.users.map(function (user) {
            return (<p>{user}</p>);
        });
        return (
            <div className="chatUsers">
                <h1>Users Online</h1>
                {otherMembers}
            </div> )
    }
});

var ChatLogin = React.createClass({
    handleSubmit: function () {
        username = this.refs.username.getDOMNode().value.trim();
        if (username) {
            localStorage.setItem('username', username);
            this.props.onSubmit(username);
            users.push(username);
            socket.emit('new user', username);
        }
        return false;
    },
    render: function () {
        return <form className="chatLogin" onSubmit={this.handleSubmit}>
            <input type="text" ref="username" placeholder="What's in a name?" />
            <input type="submit" value="Post" />
        </form>    
    }
});

var ChatBox = React.createClass({
    getInitialState: function () {
        return {data: []};
    },
    componentDidMount: function () {
        var self = this;
        socket.on('chat message', function (message) {
            self.setMessage(message);
        });
    },
    setMessage: function (message) {
        this.setState({data:this.state.data.concat(message)});
    },
    handleCommentSubmit: function (message) {
        this.setMessage(message);
        socket.emit('chat message', message);
    },
    render: function() {
        return (
          <div className="chatBox container-fluid">
            <WelcomeMessage />
            <ChatList data={ this.state.data } />
            <PendingMessageNotice />
            <ChatInput onCommentSubmit={this.handleCommentSubmit} />
          </div>
        );
    }
});

var ChatList = React.createClass({
  render: function() {
    var chatNodes = this.props.data.map(function (message) {
        return (
            <ChatMessage author={message.author} message={message.message} time={message.timestamp} />
        );
    });

    return (
      <div className="chatList clearfix">
        {chatNodes}
      </div>
    );
  }
});

var PendingMessageNotice = React.createClass({
    getInitialState: function () {
        return {data: ''};
    },
    componentDidMount: function () {
        socket
            .on('started typing', function (user) {
                this.setState({
                    data: user + ' is typing...'
                })
            })
            .on('stopped typing', function (user) {
                this.setState({ data: ''});
            });
    },
    render: function () {
        return <div className="pendingMessage">{this.state.data}</div>
    }
});

var ChatInput = React.createClass({
    handleFocus: function () {
        socket.emit('started typing', username);
    },
    handleBlur: function () {
        socket.emit('stopped typing', username);
    },
    handleSubmit: function () {
        var message = this.refs.message.getDOMNode().value.trim();
        if (message) {
            this.props.onCommentSubmit({message: message, author: username, timestamp: new Date().toString()});
            this.refs.message.getDOMNode().value = '';
        }
        return false;
    },
    render: function() {
        return (
            <form className="chatInput" onSubmit={this.handleSubmit}>
                <input type="text" ref="message" placeholder="Say some shit" 
                    onFocus={this.handleFocus}
                    onBlur={this.handleBlur}
                />
                <input type="submit" value="Post" />
            </form>
        );
    }
});

var ChatMessage = React.createClass({
    render: function () {
        var classes = 'blockquote-reverse';
        var author = this.props.author;

        if (this.props.author === username) {
            classes = '';
            author = 'me'
        }

        return (
            <Col xs={12}>
                <blockquote className={classes}>
                    <p>{this.props.message}</p>
                    <footer>{author}</footer>
                </blockquote>
            </Col>
        )
    }
});

var WelcomeMessage = React.createClass({
    render: function () {
        return <Alert bsStyle="success">
           <strong>Welcome Friend</strong>
        </Alert>
    }
});
React.renderComponent(
  <ChatRoom />,
  document.getElementById('content')
);
