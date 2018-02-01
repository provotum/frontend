import React from "react";
import {Badge, List, Card, Icon, Avatar} from "antd";
import PropTypes from "prop-types";
import ClearBtn from "./ClearBtn";
import logger from "react-logger";

export default class EventLogCard extends React.Component {

  constructor(props) {
    super(props);

    let events = [];
    if (null !== props.lastOccurredEvent) {
      events.push(props.lastOccurredEvent);
    }

    this.state = {
      lastOccurredEvent: props.lastOccurredEvent,
      lastOccurredEvents: events,
      receivedEventsId: {}
    };

    this.handleClear = this.handleClear.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    let events = this.state.lastOccurredEvents;
    let receivedEventsId = this.state.receivedEventsId;

    // check that we do not have a duplicated event
    if (null !== nextProps.lastOccurredEvent && !this.state.receivedEventsId.hasOwnProperty(nextProps.lastOccurredEvent.id)) {
      // now merge the last occurred event with the existing events
      events = [nextProps.lastOccurredEvent].concat(events);
      // add the id of the event to the seen event id map so that we can ignore it in the future.
      // note, that the value is arbitrary.
      receivedEventsId[nextProps.lastOccurredEvent.id] = true;
    }

    this.setState({
      lastOccurredEvent: nextProps.lastOccurredEvent,
      lastOccurredEvents: events
    });
  }

  handleClear() {
    this.setState({
      lastOccurredEvents: []
    });
  }

  render() {
    return (
      <Card title="Event Log" extra={<ClearBtn actions={{onClickHandler: this.handleClear}}/>}>
        <List style={divStyle} size="small" renderItem={this.state.lastOccurredEvents}>
          {this.state.lastOccurredEvents.map(event =>
            <List.Item key={event.id}>
              <List.Item.Meta
                avatar={(() => {
                  switch (event.status) {
                    case "success":
                      return <Avatar icon="check-circle-o" style={{color: '#52c41a'}}/>;
                    case "error":
                      return <Avatar icon="close-circle-o" style={{color: '#f5222d'}}/>;
                  }
                })()}
                title={event.message}
                description={(() => {
                  if (event.hasOwnProperty('contract') && null !== event.contract.address) {
                    return event.contract.type + ': ' + event.contract.address;
                  } else if (event.hasOwnProperty('transaction')) {
                    return 'Transaction: ' + event.transaction;
                  }
                })()}>
              </List.Item.Meta>
            </List.Item>
          )}
        </List>
      </Card>
    );
  }
}

const divStyle = {
  height: '300px',
  overflow: 'auto'
};

EventLogCard.propTypes = {
  lastOccurredEvent: PropTypes.object,
  lastOccurredEvents: PropTypes.array
};
