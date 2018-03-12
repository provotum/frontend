import React from "react";
import {Button, Card, Col, Form, Icon, Input, Row} from "antd";
import PropTypes from "prop-types";
import logger from "react-logger";
import axios from "axios/index";
import UpdatedTextInput from "../UpdatedTextInput";

class FetchQuestionBtnCard extends React.Component {
  constructor(props) {
    super(props);

    this.props.form.validateFields();
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      ballotContractAddress: ''
    };

    let fetchAddressIntervalId = setInterval(() => {
      axios.get("/ballot/address").then(response => {
        logger.log('Retrieved ballot contract address');

        if (!(response.data.hasOwnProperty('address')) || null === response.data.address) {
          logger.error('Response does not contain ballot contract address or is null');

          return;
        }

        clearInterval(fetchAddressIntervalId);

        this.setState({
          ballotContractAddress: response.data.address
        });
      }).catch(error => logger.error('Failed to retrieve ballot contract address: ' + error));
    }, 2000);
  }

  handleSubmit(e) {
    e.preventDefault();

    this.props.form.validateFields((err) => {
      if (!err) {
        let ballotContractAddress = document.getElementById('ballot-contract-address').value;

        if (! this.props.validators.addressValidator(ballotContractAddress)) {
          return;
        }

        this.props.actions.onClickHandler({'address': ballotContractAddress});
      }
    });
  }

  render() {
    let isButtonDisabled = ! this.props.isConnected;
    let isInputDisabled = !this.props.isConnected;


    return (
      <Card title="Fetch Question">
        <Form onSubmit={this.handleSubmit}>
          <Row>
            <Form.Item>
                <UpdatedTextInput
                  id={'ballot-contract-address'}
                  disabled={isInputDisabled}
                  value={this.state.ballotContractAddress}
                  type={'text'}
                  prefix={<Icon type="question-circle-o" style={{color: 'rgba(0,0,0,.25)'}}/>}
                  placeholder="Ballot Contract Address"
                />
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
