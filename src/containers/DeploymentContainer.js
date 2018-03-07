import React from "react";
import StompClient from "provotum-stomp-client";
import logger from "react-logger";
import EventLogCard from "../components/cards/EventLogCard";
import StatusCard from "../components/cards/StatusCard";
import FetchQuestionBtnCard from "../components/cards/FetchQuestionBtnCard";
import {Col, Row} from "antd";
import axios from "axios";
import Web3 from "web3";
import VoteBtnCard from "../components/cards/VoteBtnCard";
import ethTx from "ethereumjs-tx";
import ethUtil from "ethereumjs-util";
import ChallengeVoteBtnCard from "../components/cards/ChallengeVoteBtnCard";
import ChallengeElectionResultsBtnCard from "../components/cards/ChallengeElectionResultBtnCard";

class DeploymentContainer extends React.Component {

  constructor(props) {
    super(props);

    let provider = new Web3.providers.HttpProvider(process.env.GETH_NODE);
    this.web3 = new Web3(provider);

    this.state = {
      lastOccurredEvent: null,
      isConnected: false,
      contractAddress: null,
      votingQuestion: null,
      votingTrxHash: null,
      votingPrivateKey: null,
      ciphertext: null,
      proof: null,
      random: null,
      ballotContract: null
    };

    this.requestQuestion = this.requestQuestion.bind(this);
    this.requestQuestionClickHandler = this.requestQuestionClickHandler.bind(this);
    this.generateProofClickHandler = this.generateProofClickHandler.bind(this);
    this.submitVoteClickHandler = this.submitVoteClickHandler.bind(this);

    axios.defaults.baseURL = process.env.BACKEND;
  }

  componentDidMount() {
    this.stompClient = new StompClient(
      process.env.BACKEND,
      "/sockjs-websocket",
      () => logger.log("[stompclient] disconnected")
    );

    // use arrow function so that the "this" keyword within them is actually referring to this class.
    if (!this.state.isConnected) {
      this.stompClient.connect(() => this.successCallback(), () => this.errorCallback());
    }

    // create second axio instance only for retrieving private key from Mock Identity Provider
    if (this.state.votingPrivateKey == null) {
      let mockIdentityProvider = axios.create({
        baseURL: process.env.MOCK_IDENTITY_PROVIDER
      });

      mockIdentityProvider.get('/wallets/next')
        .then((response) => {
          this.setState({
            votingPrivateKey: response.data["private-key"],
            lastOccurredEvent: {
              id: Date.now(),
              status: 'success',
              message: 'Private Key retrieved from Identity Provider'
            }
          });
        })
        .catch(function (error) {
          this.setState({
            lastOccurredEvent: {
              id: Date.now(),
              status: 'success',
              message: 'Failed to retrieve private key from identity provider: ' + error
            }
          });
        });
    }
  }

  successCallback() {
    this.setState({
      isConnected: true
    });
  }

  errorCallback(msg) {
    logger.error("Failed to connect to backend: " + msg);
    this.setState({
      isConnected: false
    });

    this.reconnect();
  }

  reconnect() {
    logger.log('Attempting to reconnect to backend...');
    this.stompClient = new StompClient(
      process.env.BACKEND,
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
    // Instantiate contract from abi & contract address provided via GUI
    let ballotContract = this.web3.eth.contract(abi).at(address);

    this.setState({
      ballotContract: ballotContract
    });

    ballotContract.getProposedQuestion((err, res) => {
      if (!err) {
        this.setState({
          contractAddress: address,
          votingQuestion: res,
          lastOccurredEvent: {
            id: Date.now(),
            status: 'success',
            message: 'Fetched voting question from blockchain: ' + res
          }
        });
      } else {
        this.setState({
          lastOccurredEvent: {
            id: Date.now(),
            status: 'error',
            message: 'Failed to retrieve voting question from blockchain: ' + err
          }
        });
      }
    });
  }

  generateProofClickHandler(vote) {
    this.generateProof(vote);
  }

  generateProof(vote) {
    let numericVote = parseInt(vote.vote);

    axios.post("/encryption/generate", {
      vote: numericVote
    }).then(response => {
      logger.log('Retrieved encrypted vote and proof');

      if (!(response.data.hasOwnProperty('ciphertext') && response.data.hasOwnProperty('proof') && response.data.hasOwnProperty('random'))) {
        logger.error('Response does not contain ciphertext, proof and/or random. Not submitting vote.');

        return;
      }

      this.setState({
        ciphertext: response.data.ciphertext,
        proof: response.data.proof,
        random: response.data.random
      });
    }).catch(error => logger.error('Failed to retrieve encrypted vote and proof: ' + error));
  }

  submitVoteClickHandler() {
    this.submitVote();
  }

  submitVote() {
    let rawTxTo = this.state.contractAddress;
    let block = this.web3.eth.getBlock("latest");
    const privKeyBuffer = Buffer.from(this.state.votingPrivateKey, 'hex');
    let rawTxFrom = '0x' + ethUtil.privateToAddress(privKeyBuffer).toString('hex');
    let rawTxGasLimit = block.gasLimit;
    let rawTxGasPrice = this.web3.toHex("22000000000");
    let rawTxNonce = "0x00";
    let rawTxValue = "0x0";

    let ballotContract = this.web3.eth.contract(abi).at(this.state.contractAddress);
    let rawTxData = ballotContract.vote.getData(this.state.ciphertext, this.state.proof, this.state.random.valueOf());
    let rawTxGas = this.web3.eth.estimateGas({to: rawTxTo, data: rawTxData});

    const txParams = {
      nonce: rawTxNonce,
      gasPrice: rawTxGasPrice,
      gasLimit: rawTxGasLimit,
      to: rawTxTo,
      from: rawTxFrom,
      value: rawTxValue,
      data: rawTxData,
      gas: rawTxGas,
      chainId: 15
    };

    const tx = new ethTx(txParams);
    tx.sign(privKeyBuffer);
    const serializedTx = tx.serialize();
    const rawTx = '0x' + serializedTx.toString('hex');
    this.web3.eth.sendRawTransaction(rawTx.toString(), (err, trx) => {
      // Nonce too low after one try (Obviously would need to be increased,
      // but this is actually not bad, so there can't be two votes with the same
      // private key

      this.setState({
        lastOccurredEvent: {
          id: Date.now(),
          status: 'success',
          message: 'Your vote has been submitted to the blockchain',
          transaction: trx
        }
      });
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
              actions={{onClickHandler: this.requestQuestionClickHandler}}
              validators={{addressValidator: this.web3.isAddress}}
            />
            <VoteBtnCard
              isConnected={this.state.isConnected}
              votingQuestion={this.state.votingQuestion}
              actions={{
                onGenerateProofClickHandler: this.generateProofClickHandler,
                onSubmitVoteClickHandler: this.submitVoteClickHandler
              }}
            />
          </Col>
          <Col {...smallColResponsiveProps}>
            <ChallengeVoteBtnCard
              isConnected={this.state.isConnected}
              ciphertext={this.state.ciphertext}
              proof={this.state.proof}
            />
            <ChallengeElectionResultsBtnCard
              isConnected={this.state.isConnected}
              ballotContract={this.state.ballotContract}
            />
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

let abi = [
  {
    "constant": true,
    "inputs": [],
    "name": "getProposedQuestion",
    "outputs": [
      {
        "name": "question",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "sum",
        "type": "uint256"
      },
      {
        "name": "ciphertext",
        "type": "string"
      },
      {
        "name": "proof",
        "type": "string"
      }
    ],
    "name": "setSumProof",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "getVote",
    "outputs": [
      {
        "name": "voter",
        "type": "address"
      },
      {
        "name": "ciphertext",
        "type": "string"
      },
      {
        "name": "proof",
        "type": "string"
      },
      {
        "name": "random",
        "type": "bytes"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "destroy",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "ciphertext",
        "type": "string"
      },
      {
        "name": "proof",
        "type": "string"
      },
      {
        "name": "random",
        "type": "bytes"
      }
    ],
    "name": "vote",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      },
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getSumProof",
    "outputs": [
      {
        "name": "sum",
        "type": "uint256"
      },
      {
        "name": "ciphertext",
        "type": "string"
      },
      {
        "name": "proof",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getTotalVotes",
    "outputs": [
      {
        "name": "totalVotes",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "openVoting",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "closeVoting",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "name": "question",
        "type": "string"
      },
      {
        "name": "zkVerificator",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "_from",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "wasSuccessful",
        "type": "bool"
      },
      {
        "indexed": false,
        "name": "reason",
        "type": "string"
      }
    ],
    "name": "VoteEvent",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "_from",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "wasSuccessful",
        "type": "bool"
      },
      {
        "indexed": false,
        "name": "reason",
        "type": "string"
      }
    ],
    "name": "ChangeEvent",
    "type": "event"
  }
];

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
