import React from "react";
import {Button, Card, Col, Form, Icon, Input, Row} from "antd";
import PropTypes from "prop-types";

class FetchQuestionBtnCard extends React.Component {
  constructor(props) {
    super(props);

    this.props.form.validateFields();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();

    this.props.form.validateFields((err) => {
      if (!err) {
        this.props.actions.onClickHandler(this.props.form.getFieldsValue());
      }
    });
  }

  render() {
    const {getFieldDecorator, getFieldsError} = this.props.form;

    let isButtonDisabled = ! this.props.isConnected;
    let isInputDisabled = !this.props.isConnected;


    return (
      <Card title="Fetch Question Panel">
        <Form onSubmit={this.handleSubmit}>
          <Row>
            <Form.Item>
              {getFieldDecorator('address', {
                rules: [
                  {
                    required: true,
                    message: 'Please enter the ballot contract address',
                    validator: (rule, value, callback) => {
                      // avoid firing this validator if the value is not present
                      if (undefined === value) {
                        callback(false);
                      } else {
                        if (this.props.validators.addressValidator(value)) {
                          // no argument -> validation is ok
                          callback();
                        } else {
                          callback(false);
                        }
                      }
                    }
                  }
                ]
              })(
                <Input
                  disabled={isInputDisabled}
                  prefix={<Icon type="question-circle-o" style={{color: 'rgba(0,0,0,.25)'}}/>}
                  placeholder="Ballot Contract Address"
                />
              )}
            </Form.Item>
          </Row>
          <Row>
            <Col span={24} style={{textAlign: 'right'}}>
              <Button type="primary" htmlType="submit" disabled={isButtonDisabled ? "disabled" : false}>Fetch
                details</Button>
            </Col>
          </Row>
        </Form>
      </Card>
    );
  }
}

FetchQuestionBtnCard.propTypes = {
  isConnected: PropTypes.bool.isRequired,
  actions: PropTypes.shape({
    onClickHandler: PropTypes.func.isRequired
  }),
  validators: PropTypes.shape({
    addressValidator: PropTypes.func.isRequired
  }),
  form: PropTypes.object
};

export default Form.create()(FetchQuestionBtnCard);
