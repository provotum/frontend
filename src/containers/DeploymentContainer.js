import React from "react";
import StompClient from "provotum-stomp-client";
import logger from "react-logger";
import EventLogCard from "../components/cards/EventLogCard";
import StatusCard from "../components/cards/StatusCard";
import FetchQuestionBtnCard from "../components/cards/FetchQuestionBtnCard";
import {Col, Row} from "antd";
import axios from "axios";
import Web3 from 'web3';
import VoteBtnCard from "../components/cards/VoteBtnCard";

class DeploymentContainer extends React.Component {

  constructor(props) {
    super(props);

    // Instantiate web3, set default account & unlock
    let provider = new Web3.providers.HttpProvider('http://127.0.0.1:8502');
    this.web3 = new Web3(provider);
    this.web3.eth.defaultAccount = this.web3.eth.coinbase;
    this.web3.personal.unlockAccount(this.web3.eth.defaultAccount, "password123");

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
    // Check validity of address before requesting
    if (this.web3.isAddress(address)) {
      // Instantiate contract from abi & contract address provided via GUI
      let ballotContract = this.web3.eth.contract(abi).at(address);
      ballotContract.getProposedQuestion((err, res) => {
        if (!err) {
          this.setState({
            contractAddress: address,
            votingQuestion: res
          });
        } else {
          logger.log(err);
        }
      });
    }
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

    // TODO Test web3 trx submission and log output to console
    let ballotContract = this.web3.eth.contract(abi).at(this.state.contractAddress);
    ballotContract.vote(numericVote, function(err,result){
      if(err){
        logger.log('err:' + err);
      }else{
        logger.log('result' + result);
      }
    });

    // TODO Remove everything below REST / Websocket related since now we need to wait for the TX to be mined
    // TODO Integrate if(result = 'receipt') or similar as soon as the Tx was mined.

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
              web3={this.state.web3}
              actions={{onClickHandler: this.requestQuestionClickHandler}}/>
          </Col>
          <Col {...smallColResponsiveProps}>
            <VoteBtnCard
              isConnected={this.state.isConnected}
              votingQuestion={this.state.votingQuestion}
              actions={{onClickHandler: this.submitVoteClickHandler}}/>
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

let abi = [{"constant":true,"inputs":[],"name":"getProposedQuestion","outputs":[{"name":"question","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"index","type":"uint256"}],"name":"getVote","outputs":[{"name":"voter","type":"address"},{"name":"vote","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"destroy","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getTotalVotes","outputs":[{"name":"totalVotes","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"openVoting","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"chosenVote","type":"uint8"}],"name":"vote","outputs":[{"name":"","type":"bool"},{"name":"","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"closeVoting","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"question","type":"string"},{"name":"zkVerificator","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":false,"name":"wasSuccessful","type":"bool"},{"indexed":false,"name":"reason","type":"string"}],"name":"VoteEvent","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":false,"name":"wasSuccessful","type":"bool"},{"indexed":false,"name":"reason","type":"string"}],"name":"ChangeEvent","type":"event"}];

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
