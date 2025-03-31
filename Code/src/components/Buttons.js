import React from 'react';

class Buttons extends React.Component {
  render() {
    return React.createElement('div', { className: 'panel' },
      React.createElement('div', { className: 'buttons' },
        React.createElement('button', {
          onClick: this.props.encrypt,
          disabled: !this.props.originalText
        }, 'Зашифровать'),
        React.createElement('button', {
          onClick: this.props.decrypt,
          disabled: !this.props.originalText
        }, 'Расшифровать')
      )
    );
  }
}

export default Buttons;