import React from "react";
import {Badge, Card, Steps, Icon} from "antd";
import PropTypes from "prop-types";

const Step = Steps.Step;

export default class StatusCard extends React.Component {

  constructor(props) {
    super(props);

    this.getCurrentStep = this.getCurrentStep.bind(this);
  }

  getCurrentStep() {
    let index = (this.props.isConnected ? 1 : 0)
      | ((this.props.votingQuestion) ? 2 : 0)
      | ((this.props.votingTrxHash) ? 4 : 0);


    switch (index) {
      case 7:
        return 2;
      case 3:
        return 1;
      case 1:
        return 0;
      default:
        return 0;
    }
  }

  render() {
    let backgroundColor = (this.props.isConnected) ? '#52c41a' : '#f5222d';
    let connectionStatus = (this.props.isConnected) ? 'connected' : 'disconnected';

    let stepConfiguration = {
      current: 0,
      steps: [
        {
          title: "Ready",
          content: "Backend Application is ready to retrieve your vote."
        },
        {
          title: "Vote",
          content: "Submit your vote to the platform"
        },
        {
          title: "Accepted",
          content: "Your vote has been accepted in transaction: " + this.props.votingTrxHash
        }
      ]
    };

    const currentStep = this.getCurrentStep();

    return (
      <Card title="Current Status" extra={<Badge style={{backgroundColor: backgroundColor}} count={connectionStatus}/>}>
        <Steps current={currentStep} size="small">
          {stepConfiguration.steps.map((item, idx) => <Step key={item.title} title={item.title} icon={(() => ((idx === currentStep && currentStep === 0 && ! this.props.isConnected)) ? <Icon type="loading"/> : '')()}/>)}
        </Steps>
        <div className="steps-content" style={{background: "#fafafa", marginTop: "16px", padding: '10px'}}>
          {stepConfiguration.steps[this.getCurrentStep()].content}
        </div>
      </Card>
    );
  }
}

StatusCard.propTypes = {
  isConnected: PropTypes.bool.isRequired,
  votingQuestion: PropTypes.string,
  votingTrxHash: PropTypes.string
};
