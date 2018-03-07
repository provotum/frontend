import React from "react";
import {Button, Card, Col, Form, Icon, Input, Badge, Row, Alert} from "antd";
import PropTypes from "prop-types";
import axios from "axios";
import UpdatedTextInput from "../UpdatedTextInput";

class ChallengeVoteBtnCard extends React.Component {
  constructor(props) {
    super(props);

    this.props.form.validateFields();
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      valid: null
    };

    this.backend = axios.create({
      baseURL: process.env.BACKEND
    });
  }

  handleSubmit(e) {
    e.preventDefault();

    this.props.form.validateFields((err) => {
      if (!err) {
        this.backend.post('/encryption/verify', {
          'ciphertext': document.getElementById('vote-ciphertext').value,
          'proof': document.getElementById('vote-proof').value
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
    });
  }

  render() {
    let isButtonDisabled = (!this.props.isConnected) || !this.props.ciphertext || !this.props.proof;

    let backgroundColor = (this.state.valid === null) ? '#d5d5d5' : ((this.state.valid) ? '#52c41a' : '#f5222d');
    let connectionStatus = (this.state.valid === null) ? 'not yet queried' : ((this.state.valid) ? 'success' : 'invalid');

    return (
      <Card title="Challenge Vote"
            extra={<Badge style={{backgroundColor: backgroundColor}} count={connectionStatus}/>}>

        <Form onSubmit={this.handleSubmit}>
          <Row>
            <Form.Item>
              <UpdatedTextInput
                id={'vote-ciphertext'}
                value={this.props.ciphertext} type={'text'}
                prefix={<Icon type="question-circle-o" style={{color: 'rgba(0,0,0,.25)'}}/>}
                placeholder="Your ciphertext?"/>
            </Form.Item>
          </Row>
          <Row>
            <Form.Item>
              <UpdatedTextInput
                id={'vote-proof'}
                value={this.props.proof} type={'text'}
                prefix={<Icon type="question-circle-o" style={{color: 'rgba(0,0,0,.25)'}}/>}
                placeholder="Your proof?"/>
            </Form.Item>
          </Row>
          <Row>
            <Col span={24} style={{textAlign: 'right'}}>
              <Button type="primary" htmlType="submit" disabled={isButtonDisabled ? "disabled" : false}>
                Challenge Vote
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    );
  }
}

ChallengeVoteBtnCard.propTypes = {
  isConnected: PropTypes.bool.isRequired,
  ciphertext: PropTypes.string,
  proof: PropTypes.string,
  form: PropTypes.object
};

export default Form.create()(ChallengeVoteBtnCard);
