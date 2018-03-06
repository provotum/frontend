import React from "react";
import {Button, Card, Col, Form, Icon, Input, Row, Alert} from "antd";
import PropTypes from "prop-types";

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class VoteBtnCard extends React.Component {
  constructor(props) {
    super(props);

    this.props.form.validateFields();
    this.onGenerateProofClickSubmitHandler = this.onGenerateProofClickSubmitHandler.bind(this);
    this.onVoteClickSubmitHandler = this.onVoteClickSubmitHandler.bind(this);

    this.state = {
      voteSubmitted: false
    };
  }

  onGenerateProofClickSubmitHandler(e) {
    e.preventDefault();

    this.props.form.validateFields((err) => {
      if (!err) {
        this.props.actions.onGenerateProofClickHandler(this.props.form.getFieldsValue());
      }
    });
  }

  onVoteClickSubmitHandler(e) {
    e.preventDefault();

    this.props.form.validateFields((err) => {
      if (!err) {
        this.props.actions.onSubmitVoteClickHandler(this.props.form.getFieldsValue());
        this.setState({
            voteSubmitted: true
        });
      }
    });
  }


  render() {
    const {getFieldDecorator, getFieldsError} = this.props.form;

    let isButtonDisabled = (!this.props.isConnected) || this.state.voteSubmitted || null === this.props.votingQuestion || hasErrors(getFieldsError());

    return (
      <Card title="Vote Panel">
        <Alert message="Voting Question"
               description={this.props.votingQuestion ? this.props.votingQuestion : 'Not yet fetched'} type="info"/>
        <Form onSubmit={this.onGenerateProofClickSubmitHandler}>
          <Row>
            <Form.Item>
              {getFieldDecorator('vote', {
                rules: [{required: true, message: 'Please enter your vote'}]
              })(
                <Input type={'number'} prefix={<Icon type="question-circle-o" style={{color: 'rgba(0,0,0,.25)'}}/>}
                       placeholder="Your vote?"/>
              )}
            </Form.Item>
          </Row>
          <Row>
            <Col span={24} style={{textAlign: 'right'}}>
              <Button type="primary" htmlType="submit" disabled={isButtonDisabled ? "disabled" : false}>Encrypt
                Vote</Button>
              <Button type={"default"} onClick={this.onVoteClickSubmitHandler}
                      disabled={isButtonDisabled ? "disabled" : false}>Submit Vote</Button>
            </Col>
          </Row>
        </Form>
      </Card>
    );
  }
}

VoteBtnCard.propTypes = {
  isConnected: PropTypes.bool.isRequired,
  votingQuestion: PropTypes.string,
  actions: PropTypes.shape({
    onGenerateProofClickHandler: PropTypes.func.isRequired,
    onSubmitVoteClickHandler: PropTypes.func.isRequired
  }),
  form: PropTypes.object
};

export default Form.create()(VoteBtnCard);
