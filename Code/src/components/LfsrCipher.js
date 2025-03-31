import React from 'react';
import Buttons from './Buttons';

class LfsrCipher extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      previewLength: 30,
      showWarning: false,
      errorMessage: ''
    };
  }

  generateKeyStream = (length) => {
    const { register } = this.props;
    let state = [...register]; 
    let keyStream = '';
    
    for (let i = 0; i < length; i++) {
      const feedback = state[28] ^ state[1];
      keyStream += state[28];
      state.pop();
      state.unshift(feedback);
    }
    
    return keyStream;
  };

  bitStringToBytes = (bitStr) => {
    const byteCount = Math.ceil(bitStr.length / 8);
    const bytes = new Uint8Array(byteCount);
    
    for (let i = 0; i < byteCount; i++) {
      const byteStr = bitStr.substr(i * 8, 8).padEnd(8, '0');
      bytes[i] = parseInt(byteStr, 2);
    }
    
    return bytes;
  };

  fileToBitString = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        const bytes = new Uint8Array(arrayBuffer);
        let bitStr = '';
        
        for (let byte of bytes) {
          bitStr += byte.toString(2).padStart(8, '0');
        }
        
        resolve(bitStr);
      };
      
      reader.readAsArrayBuffer(file);
    });
  };

  validateRegister = () => {
    const { register } = this.props;
    
    if (!register || register.length === 0) {
      this.setState({ 
        errorMessage: 'Ошибка: регистр не может быть пустым.',
        showWarning: true
      });
      return false;
    }
    
    if (register.length !== 29) {
      this.setState({ 
        errorMessage: 'Ошибка: длина регистра должна быть ровно 29 бит.',
        showWarning: true
      });
      return false;
    }
    
    this.setState({ showWarning: false, errorMessage: '' });
    return true;
  };

  processFile = async (isEncrypt) => {
    if (!this.validateRegister()) {
      return;
    }
    
    if (!this.validateRegister() || !this.props.file) {
        this.setState({ 
            showWarning: true,
            errorMessage: this.props.file ? '' : 'Ошибка: файл не выбран.'
        });
        return;
    }

    const { file, setKeyStream, setEncryptedText } = this.props;
    const previewBytes = 30; // Теперь работаем с байтами
    
    try {
        const fileBits = await this.fileToBitString(file);
        const keyBits = this.generateKeyStream(fileBits.length);
        
        const resultBits = Array.from(fileBits)
            .map((bit, i) => parseInt(bit) ^ parseInt(keyBits[i]))
            .join('');
        
            const createBytePreview = (bitStr) => {
              const totalBytes = bitStr.length / 8;
              if (totalBytes <= previewBytes * 2) {
                  return bitStr;
              }
              
              const startBits = bitStr.substring(0, previewBytes * 8);
              const endBits = bitStr.substring(bitStr.length - previewBytes * 8);
              return `${startBits}...${endBits}`;
          };
        
        setKeyStream(createBytePreview(keyBits));
        setEncryptedText(createBytePreview(resultBits));
        
        const blob = new Blob([this.bitStringToBytes(resultBits)], { type: file.type });
        
        const fileHandle = await window.showSaveFilePicker({
            suggestedName: `${isEncrypt ? 'encrypted' : 'decrypted'}_${file.name}`,
            types: [{
                description: "Files",
                accept: { [file.type]: [`.${file.name.split('.').pop()}`] },
            }],
        });
        
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        
    } catch (error) {
        console.error('Ошибка:', error);
        const userMessage = error.name === 'AbortError' 
            ? 'Сохранение отменено' 
            : `Ошибка: ${error.message}`;
        
        this.setState({ 
            errorMessage: userMessage,
            showWarning: true
        });
    }
  };

  encrypt = () => {
    this.processFile(true);
  };
  
  decrypt = () => {
    this.processFile(false);
  };

  render() {
    const { showWarning, errorMessage } = this.state;
    const { originalText } = this.props;
    
    return React.createElement('div', null,
      showWarning && React.createElement('div', { className: 'warning' }, errorMessage),
      React.createElement(Buttons, {
        encrypt: this.encrypt,
        decrypt: this.decrypt,
        originalText: originalText
      })
    );
  }
}

export default LfsrCipher;