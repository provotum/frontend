import React from "react";
import {Button, Card, Col, Form, Icon, Input, Row} from "antd";
import PropTypes from "prop-types";

function hasErrors(fieldsError) {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
}

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

        let isButtonDisabled = false;
        if (!this.props.isConnected || hasErrors(getFieldsError())) {
            isButtonDisabled = true;
        }

        return (
            <Card title="Fetch Question Panel">
                <Form onSubmit={this.handleSubmit}>
                    <Row>
                        <Form.Item>
                            {getFieldDecorator('address', {
                                rules: [{required: true, message: 'Please enter the ballot contract address'}]
                            })(
                                <Input prefix={<Icon type="question-circle-o" style={{color: 'rgba(0,0,0,.25)'}}/>}
                                       placeholder="Ballot Contract Address"/>
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
    form: PropTypes.object
};

export default Form.create()(FetchQuestionBtnCard);
