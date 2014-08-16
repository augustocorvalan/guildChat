/** @jsx React.DOM */
var data = [
    { 'author': 'Mario Juanes', 'text': 'heyy', 'timestamp': 'then' },
    { 'author': 'Tim Callahan', 'text': 'tree', 'timestamp': 'now' }
];

var ChatRoom = React.createClass({
    getInitialState: function () {
        return {username: localStorage.getItem('username')};
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
    loadCommentFromServer: function () {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            success: function (data) {
                this.setState({data: data});
            }.bind(this),
            error: function (xhr, status, err) {
                console.error('You done fucked up now');
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    componentDidMount: function () {
        this.loadCommentFromServer();
        setInterval(this.loadCommentFromServer, this.props.pollInterval);
    },
    handleCommentSubmit: function (message) {
        var chats = this.state.data;
        var newChats = chats.concat(message);
        this.setState({data: newChats});

        $.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'POST',
            data: message,
            success: function (data) {
                this.setState({data: data});
            }.bind(this),
            error: function (xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    render: function() {
        return (
          <div className="chatBox">
            <h1>Give Me Trees!</h1>
            <ChatList data={ this.state.data } />
            <ChatInput onCommenSubmit={this.handleCommentSubmit} />
          </div>
        );
    }
});


var ChatList = React.createClass({
  render: function() {
    var chatNodes = this.props.data.map(function (message) {
        return (
            <ChatMessage author={message.author} timestamp={message.timestamp}>
                {message.text}
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
        this.props.onCommentSubmit({message: message});
        //TODO: send request to the server
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
        return (
            <div className="ChatMessage">
                <span class="Author">username</span>
                <span class="Message">{this.props.children}</span>
                <span class="Timestamp">{this.props.timestamp}</span>
            </div>
        )
    }
});

var ChatLogin = React.createClass({
    handleSubmit: function () {
        var username = this.refs.username.getDOMNode().value.trim();
        if (!username) {
            return false;
        }
        this.props.onSubmit(username);
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
