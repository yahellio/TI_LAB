import React from 'react';
import LfsrDisplay from './components/LfsrDisplay';
import TextDisplay from './components/TextDisplay';
import FileInput from './components/FileInput';
import LfsrCipher from './components/LfsrCipher';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      register: Array(29).fill(1), 
      registerLength: 29,
      originalText: '',
      keyStream: '',
      encryptedText: '',
      file: null
    };
  }

  render() {
    return React.createElement('div', { className: 'app' },
      React.createElement('header', { className: 'header' },
        React.createElement('h1', { className: 'logo' }, 'LFSR Шифратор')
      ),
      
      React.createElement('main', { className: 'main-content' },
        React.createElement(FileInput, {
          setFile: (file) => this.setState({ file }),
          setOriginalText: (text) => this.setState({ originalText: text })
        }),
        
        React.createElement(LfsrDisplay, {
          register: this.state.register,
          registerLength: this.state.registerLength,
          setRegister: (reg) => this.setState({ register: reg }),
          setRegisterLength: (len) => this.setState({ registerLength: len })
        }),
        
        React.createElement(TextDisplay, {
          originalText: this.state.originalText,
          keyStream: this.state.keyStream,
          encryptedText: this.state.encryptedText
        }),
        
        React.createElement(LfsrCipher, {
          register: this.state.register,
          originalText: this.state.originalText,
          keyStream: this.state.keyStream,
          encryptedText: this.state.encryptedText,
          setKeyStream: (key) => this.setState({ keyStream: key }),
          setEncryptedText: (text) => this.setState({ encryptedText: text }),
          file: this.state.file
        })
      )
    );
  }
}

export default App;