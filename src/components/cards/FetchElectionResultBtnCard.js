import React from "react";
import {Badge, Button, Card, Col, Form, Icon, Input, Row} from "antd";
import PropTypes from "prop-types";
import axios from "axios/index";
import logger from "react-logger";

class UpdatedTextInput extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      value: props.value
    };

    this.handleChange = this.handleChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.hasOwnProperty('value') && nextProps.value) {
      this.setState({
        value: nextProps.value
      });
    }
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  render() {
    return (
      <div>
        <input id={this.props.id} className={"ant-input"} type={"value"}
               value={this.state.value ? this.state.value : ''} onChange={this.handleChange}/>
      </div>
    );
  }
}

UpdatedTextInput.propTypes = {
  id: PropTypes.string,
  value: PropTypes.any
};

class FetchElectionResultBtnCard extends React.Component {
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
    let isButtonDisabled = (!this.props.isConnected);

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
              <Button type="primary" htmlType="submit" disabled={isButtonDisabled ? "disabled" : false}>
                Fetch Results
              </Button>
              <Button type="default" htmlType="button" onClick={this.challengeSumProof} disabled={isButtonDisabled ? "disabled" : false}>
                Challenge Sum Proof
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    );
  }
}

FetchElectionResultBtnCard.propTypes = {
  isConnected: PropTypes.bool.isRequired,
  ballotContract: PropTypes.object,
  form: PropTypes.object
};

export default Form.create()(FetchElectionResultBtnCard);
