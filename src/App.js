import React, { Component } from "react";
import { createStore, combineReducers } from "redux";
import uuid from "uuid";

// function reducer(state = {}, action) {
//   return {
//     activeThreadId: activeThreadIdReducer(state.activeThreadId, action),
//     threads: threadsReducer(state.threads, action)
//   };
// }

const reducer = combineReducers({
  activeThreadId: activeThreadIdReducer,
  threads: threadsReducer
});

function activeThreadIdReducer(state = "1-fca2", action) {
  if (action.type === "CHANGE_TAB") {
    return action.id;
  } else {
    return state;
  }
}

function threadsReducer(
  state = [
    {
      id: "1-fca2",
      title: "Buzz Aldrin",
      messages: messagesReducer(undefined, {})
    },
    {
      id: "2-be91",
      title: "Michael Collins",
      messages: messagesReducer(undefined, {})
    }
  ],
  action
) {
  if (action.type === "ADD_MESSAGE") {
    const updatedThreads = state.map(thread => {
      if (thread.id !== action.threadId) return thread;
      return {
        ...thread,
        messages: messagesReducer(thread.messages, action)
      };
    });

    return updatedThreads;
  } else if (action.type === "DELETE_MESSAGE") {
    const updatedThreads = state.map(thread => {
      if (thread.id !== action.threadId) return thread;
      return {
        ...thread,
        messages: messagesReducer(thread.messages, action)
      };
    });

    return updatedThreads;
  } else {
    return state;
  }
}

function messagesReducer(state = [], action) {
  if (action.type === "ADD_MESSAGE") {
    const newMessage = {
      text: action.text,
      timestamp: Date.now(),
      id: uuid.v4(),
      threadId: action.threadId
    };

    return state.concat(newMessage);
  } else if (action.type === "DELETE_MESSAGE") {
    return state.filter(message => message.id !== action.id);
  } else {
    return state;
  }
}

const store = createStore(reducer);

class App extends React.Component {
  componentDidMount() {
    store.subscribe(() => this.forceUpdate());
  }

  render() {
    const state = store.getState();
    const { activeThreadId, threads } = state;
    const activeThread = threads.find(thread => thread.id === activeThreadId);

    return (
      <div className="ui segment">
        <ThreadTabs
          changeTab={this.changeTab}
          activeThreadId={activeThreadId}
        />
        <Thread thread={activeThread} />
      </div>
    );
  }
}

const Tabs = props => (
  <div className="ui top attached tabular menu">
    {props.tabs.map((tab, idx) => (
      <div
        key={idx}
        className={tab.active ? "active item" : "item"}
        onClick={() => props.onClick(tab.id)}
      >
        {tab.title}
      </div>
    ))}
  </div>
);

class ThreadTabs extends Component {
  componentDidMount() {
    store.subscribe(() => this.forceUpdate);
  }

  render() {
    const state = store.getState();
    const tabs = state.threads.map(thread => ({
      title: thread.title,
      active: thread.id === state.activeThreadId,
      id: thread.id
    }));
    return (
      <Tabs
        tabs={tabs}
        onClick={id =>
          store.dispatch({
            type: "CHANGE_TAB",
            id
          })
        }
      />
    );
  }
}

class MessageInput extends React.Component {
  state = {
    value: ""
  };

  onChange = e => {
    this.setState({
      value: e.target.value
    });
  };

  handleSubmit = () => {
    store.dispatch({
      type: "ADD_MESSAGE",
      text: this.state.value,
      threadId: this.props.threadId
    });
    this.setState({
      value: ""
    });
  };

  render() {
    return (
      <div className="ui input">
        <input onChange={this.onChange} value={this.state.value} type="text" />
        <button
          onClick={this.handleSubmit}
          className="ui primary button"
          type="submit"
        >
          Submit
        </button>
      </div>
    );
  }
}

class Thread extends React.Component {
  handleClick = id => {
    store.dispatch({
      type: "DELETE_MESSAGE",
      id,
      threadId: this.props.thread.id
    });
  };

  render() {
    const messages = this.props.thread.messages.map(message => (
      <div
        className="comment"
        key={message.id}
        onClick={() => this.handleClick(message.id)}
      >
        <div className="text">
          {message.text}
          <span className="metadata">@{message.timestamp}</span>
        </div>
      </div>
    ));
    return (
      <div className="ui center aligned basic segment">
        <div className="ui comments">{messages}</div>
        <MessageInput threadId={this.props.thread.id} />
      </div>
    );
  }
}

export default App;
