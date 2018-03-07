import React from "react";
import PropTypes from "prop-types";

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

export default UpdatedTextInput;
