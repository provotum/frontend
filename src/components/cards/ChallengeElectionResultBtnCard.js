import React from "react";
import {Badge, Button, Card, Col, Form, Icon, Input, Row} from "antd";
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
      sum: 0,
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
      'sum': document.getElementById('sum').value,
      'ciphertext': document.getElementById('ciphertext').value,
      'proof': document.getElementById('proof').value
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
    let isChallengeButtonDisabled = ! this.state.ciphertext || ! this.state.proof || ! this.state.sum;

    let backgroundColor = (this.state.valid === null) ? '#d5d5d5' : ((this.state.valid) ? '#52c41a' : '#f5222d');
    let connectionStatus = (this.state.valid === null) ? 'not yet queried' : ((this.state.valid) ? 'success' : 'invalid');

    return (
      <Card title="Challenge Election Result"
            extra={<Badge style={{backgroundColor: backgroundColor}} count={connectionStatus}/>}>

        <Form onSubmit={this.handleSubmit}>
          <Row>
            <Form.Item>
              <UpdatedTextInput
                id={'ciphertext'}
                value={this.state.ciphertext} type={'text'}
                prefix={<Icon type="question-circle-o" style={{color: 'rgba(0,0,0,.25)'}}/>}
                placeholder="ciphertext"/>
            </Form.Item>
          </Row>
          <Row>
            <Form.Item>
              <UpdatedTextInput
                id={'proof'}
                value={this.state.proof} type={'text'}
                prefix={<Icon type="question-circle-o" style={{color: 'rgba(0,0,0,.25)'}}/>}
                placeholder="proof"/>
            </Form.Item>
          </Row>
          <Row>
            <Form.Item>
              <UpdatedTextInput
                id={'sum'}
                value={this.state.sum} type={'text'}
                prefix={<Icon type="question-circle-o" style={{color: 'rgba(0,0,0,.25)'}}/>}
                placeholder="sum"/>
            </Form.Item>
          </Row>
          <Row>
            <Col span={24} style={{textAlign: 'right'}}>
              <Button.Group size={2}>
                <Button type="primary" htmlType="submit" disabled={isFetchButtonDisabled ? "disabled" : false}>
                  Fetch Results
                </Button>
                <Button type="default" htmlType="button" onClick={this.challengeSumProof} disabled={isChallengeButtonDisabled ? "disabled" : false}>
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
