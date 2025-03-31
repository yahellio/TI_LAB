import React from 'react';

class LfsrDisplay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rawInput: props.register.join('')
    };
  }

  handleRegisterChange = (e) => {
    const value = e.target.value;
    this.setState({ rawInput: value });
    
    const filteredValue = value.replace(/[^01]/g, '');
    
    this.props.setRegister(filteredValue.split('').map(Number));
    this.props.setRegisterLength(filteredValue.length);
  };

  handleLengthChange = (e) => {
    this.props.setRegisterLength(parseInt(e.target.value));
  };

  render() {
    return React.createElement('div', { className: 'panel' },
      React.createElement('div', { className: 'input-group' },
        React.createElement('label', null, 'Сеансовый ключ(29):'),
        React.createElement('input', {
          type: 'text',
          value: this.state.rawInput,
          onChange: this.handleRegisterChange,
        })
      ),
      React.createElement('div', { className: 'input-group' },
        React.createElement('label', null, 'Длина регистра:'),
        React.createElement('input', {
          type: 'number',
          value: this.props.registerLength,
          onChange: this.handleLengthChange,
          min: 1,
          max: 32,
          readOnly: true
        })
      )
    );
  }
}

export default LfsrDisplay;