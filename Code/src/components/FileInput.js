import React from 'react';

class FileInput extends React.Component {
  handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    this.props.setFile(file);
    
    try {
      const content = await file.text();
      this.props.setOriginalText(content);
    } catch (error) {
      console.error('Error reading file:', error);
    }
  };

  render() {
    return React.createElement('div', { className: 'panel' },
      React.createElement('div', { className: 'input-group' },
        React.createElement('label', null, 'Выберите файл:'),
        React.createElement('input', {
          type: 'file',
          onChange: this.handleFileChange
        })
      )
    );
  }
}

export default FileInput;