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
        if (!this.props.isConnected || null === this.props.votingQuestion || hasErrors(getFieldsError())) {
            isButtonDisabled = true;
        }

        return (
            <Card title="Vote Panel">
                <Alert message="Voting Question" description={this.props.votingQuestion ? this.props.votingQuestion : 'Not yet fetched'} type="info" />
                <Form onSubmit={this.handleSubmit}>
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
                            <Button type="primary" htmlType="submit" disabled={isButtonDisabled ? "disabled" : false}>Vote</Button>
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
        onClickHandler: PropTypes.func.isRequired
    }),
    form: PropTypes.object
};

export default Form.create()(VoteBtnCard);
