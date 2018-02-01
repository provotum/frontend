import React from "react";
import {Button} from "antd";
import PropTypes from "prop-types";


class ClearBtn extends React.Component {

  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  onClick(e) {
    e.preventDefault();

    // let's see
    this.props.actions.onClickHandler(e);
  }

  render() {
    return (
      <Button type="danger" onClick={this.onClick}>Clear</Button>
    );
  }
}

ClearBtn.propTypes = {
  actions: PropTypes.shape({
    onClickHandler: PropTypes.func.isRequired
  }).isRequired
};

export default ClearBtn;
