import React from 'react';
import StompClient from "provotum-stomp-client";
import logger from "react-logger";
import EventLogCard from '../components/cards/EventLogCard';
import StatusCard from '../components/cards/StatusCard';
import FetchQuestionBtnCard from '../components/cards/FetchQuestionBtnCard';
import {Col, Row} from 'antd';
import axios from 'axios';
import VoteBtnCard from "../components/cards/VoteBtnCard";

class DeploymentContainer extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            lastOccurredEvent: null,
            isConnected: false,
            contractAddress: null,
            votingQuestion: null,
            votingTrxHash: null
        };

        this.onQuestionSubscription = null;
        this.onIncorporatedVoteSubscription = null;

        this.requestQuestion = this.requestQuestion.bind(this);
        this.requestQuestionClickHandler = this.requestQuestionClickHandler.bind(this);
        this.onIncorporatedVote = this.onIncorporatedVote.bind(this);
        this.onQuestionReceived = this.onQuestionReceived.bind(this);
        this.submitVoteClickHandler = this.submitVoteClickHandler.bind(this);

        axios.defaults.baseURL = 'http://localhost:8080';
    }

    componentDidMount() {
        // http://localhost:8080/sockjs-websocket
        this.stompClient = new StompClient(
            "http://localhost:8080",
            "/sockjs-websocket",
            () => logger.log("[stompclient] disconnected")
        );

        // use arrow function so that the "this" keyword within them is actually referring to this class.
        if (!this.state.isConnected) {
            this.stompClient.connect(() => this.successCallback(), () => this.errorCallback());
        }
    }

    componentWillUnmount() {
        if (null !== this.onIncorporatedVoteSubscription) {
            this.onIncorporatedVoteSubscription.unsubscribe();
        }

        if (null !== this.onQuestionSubscription) {
            this.onQuestionSubscription.unsubscribe();
        }
    }

    successCallback(msg) {
        this.onIncorporatedVoteSubscription = this.stompClient.subscribe('/topic/votes', (msg) => this.onIncorporatedVote(msg));
        this.onQuestionSubscription = this.stompClient.subscribe('/topic/meta', (msg) => this.onQuestionReceived(msg));

        this.setState({
            isConnected: true
        });
    }

    errorCallback(msg) {
        logger.log("error: " + msg);
        this.setState({
            isConnected: false
        });

        this.reconnect();
    }

    reconnect() {
        this.stompClient = new StompClient(
            "http://localhost:8080",
            "/sockjs-websocket"
        );

        if (!this.state.isConnected) {
            setTimeout(() => {
                this.stompClient.connect(() => this.successCallback(), () => this.errorCallback());
            }, 3000);
        }
    }


    requestQuestionClickHandler(address) {
        this.requestQuestion(address.address);
    }

    requestQuestion(address) {
        let query = "ballot/" + address + "/question";
        axios.post(query)
            .then((response) => {
                logger.log(response);

                this.setState({
                    contractAddress: address
                });

            })
            .catch(function (error) {
                logger.log(error);
            });
    }

    onQuestionReceived(msg) {

        this.setState((previousState, props) => {
            if (msg.hasOwnProperty('responseType') && msg.status === 'success') {
                if (msg.responseType === 'get-question-event') {
                    previousState.votingQuestion = msg.question;
                }
            } else if (msg.hasOwnProperty('responseType') && msg.status === 'error') {
                logger.log("Error on retrieved question: " + msg);
            }

            return {
                lastOccurredEvent: msg,
                votingQuestion: previousState.votingQuestion
            };
        });
    }

    submitVoteClickHandler(vote) {
        this.submitVote(vote);
    }

    submitVote(vote) {
        let numericVote = parseInt(vote.vote);

        let query = "ballot/" + this.state.contractAddress + "/vote";
        axios.post(query, {
            "credentials": {
                "public-key": "",
                "private-key": ""
            },
            "vote": numericVote
        }).then((response) => {
            console.log(response);
        }).catch((error) => {
            console.log(error);
        });
    }

    onIncorporatedVote(msg) {
        this.setState((previousState, props) => {

            if (msg.hasOwnProperty('responseType') && msg.status === 'success') {
                if (msg.responseType === 'vote') {
                    previousState.votingTrxHash = msg.transaction;
                }
            } else if (msg.hasOwnProperty('responseType') && msg.status === 'error') {
                logger.log("Error on vote: " + msg);
            }

            return {
                lastOccurredEvent: msg,
                votingTrxHash: previousState.votingTrxHash
            };
        });
    }

    render() {
        return (
            <div>
                <Row gutter={24}>
                    <Col xs={24} style={{marginBottom: 24}}>
                        <StatusCard
                            isConnected={this.state.isConnected}
                            votingQuestion={this.state.votingQuestion}
                            votingTrxHash={this.state.votingTrxHash}
                        />
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col {...smallColResponsiveProps}>
                        <FetchQuestionBtnCard
                            isConnected={this.state.isConnected}
                            actions={{onClickHandler: this.requestQuestionClickHandler}}/>
                    </Col>
                    <Col {...smallColResponsiveProps}>
                        <VoteBtnCard
                            isConnected={this.state.isConnected}
                            votingQuestion={this.state.votingQuestion}
                            actions={{onClickHandler: this.submitVoteClickHandler}} />
                    </Col>
                    <Col {...wideColResponsiveProps}>
                        <EventLogCard lastOccurredEvent={this.state.lastOccurredEvent}/>
                    </Col>
                </Row>
            </div>
        );
    }

}

DeploymentContainer.propTypes = {};
export default DeploymentContainer;

const
    smallColResponsiveProps = {
        xs: 24,
        sm: 12,
        md: 12,
        lg: 12,
        xl: 6,
        style: {marginBottom: 24}
    };

const
    wideColResponsiveProps = {
        xs: 24,
        sm: 24,
        md: 24,
        lg: 24,
        xl: 12,
        style: {marginBottom: 24}
    };
