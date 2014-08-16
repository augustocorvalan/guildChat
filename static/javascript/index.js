/** @jsx React.DOM */
var username = localStorage.getItem('username');

var ChatRoom = React.createClass({
    getInitialState: function () {
        return {username: username};
    },
    handleLogin: function (username) {
        this.setState({username:username})
    },
    render: function () {
        if (this.state.username) {
          return <ChatBox url="some/url" pollInterval={1000} />
        } else {
          return <ChatLogin onSubmit={this.handleLogin} />
        }
    }
});

var ChatBox = React.createClass({
    getInitialState: function () {
        return {data: []};
    },
    componentDidMount: function () {
        socket.on('chat message', function (message) {
            this.setMessage(message);
        });
        setInterval(this.loadCommentFromServer, this.props.pollInterval);
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
          <div className="chatBox">
            <h1>Give Me Trees!</h1>
            <ChatList data={ this.state.data } />
            <ChatInput onCommentSubmit={this.handleCommentSubmit} />
          </div>
        );
    }
});


var ChatList = React.createClass({
  render: function() {
    var chatNodes = this.props.data.map(function (message) {
        return (
            <ChatMessage author={message.author} timestamp={message.timestamp}>
                {message.message}
            </ChatMessage>
        );
    });

    return (
      <div className="chatList">
        {chatNodes}
      </div>
    );
  }
});

var ChatInput = React.createClass({
    handleSubmit: function () {
        var message = this.refs.message.getDOMNode().value.trim();
        if (!message) {
            return false;
        }
        this.props.onCommentSubmit({message: message, author: username, timestamp: new Date().toString()});
        this.refs.message.getDOMNode().value = '';
        return false;
    },
    render: function() {
        return (
            <form className="ChatInput" onSubmit={this.handleSubmit}>
                <input type="text" ref="message" placeholder="Say some shit" />
                <input type="submit" value="Post" />
            </form>
        );
    }
});

var ChatMessage = React.createClass({
    render: function () {
        var author;

        if (this.props.author = username) {
            author = 'me'
        } else {
            author = this.props.author;
        }

        return (
            <div className="ChatMessage">
                <p class="Author">{author}</p>
                <p class="Message">{this.props.children}</p>
                <p class="Timestamp">{this.props.timestamp}</p>
            </div>
        )
    }
});

var ChatLogin = React.createClass({
    handleSubmit: function () {
        username = this.refs.username.getDOMNode().value.trim();
        if (!username) {
            return false;
        }
        this.props.onSubmit(username);
        localStorage.setItem('username', username);
        return false;
    },
    render: function () {
        return <form className="ChatLogin" onSubmit={this.handleSubmit}>
            <input type="text" ref="username" placeholder="What's in a name?" />
            <input type="submit" value="Post" />
        </form>    
    }
});

React.renderComponent(
  <ChatRoom />,
  document.getElementById('content')
);
