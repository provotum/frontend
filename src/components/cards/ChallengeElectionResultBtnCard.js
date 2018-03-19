import React from "react";
import {Badge, Button, Card, Col, Form, Icon, Tooltip, Row} from "antd";
import PropTypes from "prop-types";
import axios from "axios/index";
import logger from "react-logger";
import UpdatedTextInput from "../UpdatedTextInput";

class ChallengeElectionResultBtnCard extends React.Component {
  constructor(props) {
    super(props);

    this.props.form.validateFields();
    this.handleSubmit = this.handleSubmit.bind(this);
    this.challengeSumProof = this.challengeSumProof.bind(this);

    this.state = {
      valid: null,
      sum: null,
      ciphertext: '',
      proof: ''
    };

    this.backend = axios.create({
      baseURL: process.env.BACKEND
    });
  }

  handleSubmit(e) {
    e.preventDefault();

    this.props.form.validateFields((err) => {
      if (!err) {

        this.props.ballotContract.getSumProof((err, res) => {
          if (err || (!Array.isArray(res))) {
            logger.error("There was an error while fetching the proof of the sum");
            logger.error(err);
            logger.error(res);
            return;
          }

          // the result is an array with 3 entries
          // the first: sum as BigNumber.js
          // the second: the ciphertext
          // the third: the proof

          let sum = res[0].toNumber();
          let ciphertext = res[1];
          let proof = res[2];

          this.setState({
            sum: sum,
            ciphertext: ciphertext,
            proof: proof
          });

        });
      }
    });
  }

  challengeSumProof(e) {
    e.preventDefault();

    this.backend.post('/encryption/verify-sum', {
      'sum': document.getElementById('election-sum-sum').value,
      'ciphertext': document.getElementById('election-sum-ciphertext').value,
      'proof': document.getElementById('election-sum-proof').value
    }).then(() => {
      this.setState({
        valid: true
      });
    }).catch(() => {
      this.setState({
        valid: false
      });
    });
  }

  render() {
    let isFetchButtonDisabled = (!this.props.isConnected) || !this.props.ballotContract;
    let isChallengeButtonDisabled = !this.state.ciphertext || !this.state.proof || (0 !== this.state.sum && !this.state.sum);

    let backgroundColor = (this.state.valid === null) ? '#d5d5d5' : ((this.state.valid) ? '#52c41a' : '#f5222d');
    let connectionStatus = (this.state.valid === null) ? 'not yet queried' : ((this.state.valid) ? 'success' : 'invalid');

    return (
      <Card title="Challenge Election Result"
            extra={<Badge style={{backgroundColor: backgroundColor}} count={connectionStatus}/>}>
        <span>The election result is available after the voting authorities have published the results to the ballot contract.</span>
        <Form onSubmit={this.handleSubmit}>
          <Row>
            <Form.Item>
              <Card.Meta description={"Election Sum Ciphertext"}/>
              <UpdatedTextInput
                id={'election-sum-ciphertext'}
                value={this.state.ciphertext} type={'text'}
                prefix={<Icon type="question-circle-o" style={{color: 'rgba(0,0,0,.25)'}}/>}
                placeholder="ciphertext"/>
            </Form.Item>
          </Row>
          <Row>
            <Form.Item>
              <Card.Meta description={"Election Sum Proof"}/>
              <UpdatedTextInput
                id={'election-sum-proof'}
                value={this.state.proof} type={'text'}
                prefix={<Icon type="question-circle-o" style={{color: 'rgba(0,0,0,.25)'}}/>}
                placeholder="proof"/>
            </Form.Item>
          </Row>
          <Row>
            <Form.Item>
              <Tooltip title="Note, that only the sum of supporting votes is displayed. To obtain the voting result, you may
                look at the total vote-transactions and subtract the sum displayed below.">
                <span>Election Sum <Icon type="question-circle"/></span>
              </Tooltip>
              <UpdatedTextInput
                id={'election-sum-sum'}
                value={(this.state.sum !== null) ? this.state.sum.toString() : this.state.sum} type={'text'}
                prefix={<Icon type="question-circle-o" style={{color: 'rgba(0,0,0,.25)'}}/>}
                placeholder="sum"/>
            </Form.Item>
          </Row>
          <Row>
            <Col span={24} style={{textAlign: 'right'}}>
              <Button.Group size={2}>
                <Button type="default" htmlType="submit" disabled={isFetchButtonDisabled ? "disabled" : false}>
                  Fetch Results
                </Button>
                <Button type="primary" htmlType="button" onClick={this.challengeSumProof}
                        disabled={isChallengeButtonDisabled ? "disabled" : false}>
                  Challenge Sum
                </Button>
              </Button.Group>
            </Col>
          </Row>
        </Form>
      </Card>
    );
  }
}

ChallengeElectionResultBtnCard.propTypes = {
  isConnected: PropTypes.bool.isRequired,
  ballotContract: PropTypes.object,
  form: PropTypes.object
};

export default Form.create()(ChallengeElectionResultBtnCard);
