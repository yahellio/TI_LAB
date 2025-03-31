import React from 'react';

class TextDisplay extends React.Component {
  render() {
    const fullBinaryText = this.props.originalText 
      ? this.props.originalText.split('').map(char => 
          char.charCodeAt(0).toString(2).padStart(8, '0')
        ).join('')
      : '';
    
    let shortenedBinaryText = fullBinaryText;
    const totalBytes = fullBinaryText.length / 8;
    const previewBytes = 30;
    
    if (totalBytes > previewBytes * 2) {
        const startBits = fullBinaryText.substring(0, previewBytes * 8);
        const endBits = fullBinaryText.substring(fullBinaryText.length - previewBytes * 8);
        shortenedBinaryText = `${startBits}...${endBits}`;
    }


    return React.createElement('div', { className: 'panel' },
      React.createElement('div', { className: 'input-group' },
        React.createElement('label', null, 'Исходный текст:'),
        React.createElement('textarea', {
          readOnly: true,
          value: shortenedBinaryText,
        })
      ),
      React.createElement('div', { className: 'input-group' },
        React.createElement('label', null, 'Сгенерированный ключ:'),
        React.createElement('textarea', {
          readOnly: true,
          value: this.props.keyStream,
        })
      ),
      React.createElement('div', { className: 'input-group' },
        React.createElement('label', null, 'Зашифрованный текст:'),
        React.createElement('textarea', {
          readOnly: true,
          value: this.props.encryptedText,
        })
      )
    );
  }
}

export default TextDisplay;