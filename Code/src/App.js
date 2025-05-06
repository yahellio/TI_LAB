import React, { useState, useRef } from 'react';
import { ElGamal } from './ElGamal';
import { PrimeNumberGenerator } from './PrimeNumberGenerator';
import { PrimitiveRootFinder } from './PrimitiveRootFinder';

function App() {
  const [elGamal] = useState(new ElGamal());
  const [primeP, setPrimeP] = useState('');
  const [primeStatus, setPrimeStatus] = useState('');
  const [primitiveRoots, setPrimitiveRoots] = useState([]);
  const [selectedG, setSelectedG] = useState('');
  const [privateKeyX, setPrivateKeyX] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [kValue, setKValue] = useState('');
  const [operation, setOperation] = useState('encrypt');
  const [inputData, setInputData] = useState('');
  const [outputData, setOutputData] = useState('');
  const [inputFileName, setInputFileName] = useState('');
  const fileInputRef = useRef(null);

  const handlePrimePChange = (e) => {
    const value = e.target.value;
    setPrimeP(value);
    
    if (value === '') {
      setPrimeStatus('');
      return;
    }
    
    const p = parseInt(value);
    if (isNaN(p)) {
      setPrimeStatus('Invalid number format');
      return;
    }
    
    const isPrime = PrimeNumberGenerator.isPrime(p);
    setPrimeStatus(isPrime ? 'Prime number' : 'Not a prime number');
  };

  const findPrimitiveRoots = () => {
    const p = parseInt(primeP);
    if (isNaN(p) || !PrimeNumberGenerator.isPrime(p)) {
      alert('Please enter a valid prime number first');
      return;
    }
    
    const roots = PrimitiveRootFinder.findPrimitiveRoots(p);
    setPrimitiveRoots(roots);
  };

  const generatePublicKey = () => {
    const p = parseInt(primeP);
    const g = parseInt(selectedG);
    const x = parseInt(privateKeyX);
    
    if (isNaN(p) || isNaN(g) || isNaN(x)) {
      alert('Please fill all fields with valid numbers');
      return;
    }
    
    if (x <= 1 || x >= p - 1) {
      alert('Private key x must be: 1 < x < p-1');
      return;
    }
    
    elGamal.generateKeys(p, g, x);
    setPublicKey(`Public key (p, g, y): (${p}, ${g}, ${elGamal.Y})`);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setInputFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      
      if (file.name.endsWith('.enc')) {
        if (data.length % 4 !== 0) {
          alert('Invalid .enc file format (must be divisible by 4 bytes)');
          return;
        }
        
        const pairs = [];
        for (let i = 0; i < data.length; i += 4) {
          const a = new DataView(data.buffer, i, 2).getUint16(0, true);
          const b = new DataView(data.buffer, i + 2, 2).getUint16(0, true);
          pairs.push(`(${a}, ${b})`);
        }
        setInputData(pairs.join(' '));
      } else {
        setInputData(Array.from(data).join(' '));
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const processFile = () => {
    if (!inputData) {
      alert('Please select a file first');
      return;
    }
    
    const k = parseInt(kValue);
    if (isNaN(k) || k <= 1 || k >= elGamal.P - 1) {
      alert(`k must be: 1 < k < ${elGamal.P - 1}`);
      return;
    }
    
    if (ElGamal.gcd(k, elGamal.P - 1) !== 1) {
      alert(`Number k=${k} must be coprime with p-1=${elGamal.P - 1}`);
      return;
    }
    
    try {
      if (operation === 'encrypt') {
        const bytes = inputData.split(' ').map(Number);
        const encryptedPairs = [];
        const encryptedData = [];
        
        for (const byte of bytes) {
          const { a, b } = elGamal.encrypt(byte, k);
          
          const aBytes = new Uint16Array([a]);
          const bBytes = new Uint16Array([b]);
          
          encryptedData.push(...new Uint8Array(aBytes.buffer));
          encryptedData.push(...new Uint8Array(bBytes.buffer));
          encryptedPairs.push(`(${a}, ${b})`);
        }
        
        setOutputData(encryptedPairs.join(' '));
      } else {
        const pairs = inputData.match(/\(\d+,\s*\d+\)/g);
        if (!pairs) {
          alert('Invalid input format for decryption');
          return;
        }
        
        const decryptedBytes = [];
        
        for (const pair of pairs) {
          const match = pair.match(/\d+/g);
          const a = parseInt(match[0]);
          const b = parseInt(match[1]);
          
          const decrypted = elGamal.decrypt(a, b);
          
          if (decrypted < 0 || decrypted > 255) {
            alert(`Error: invalid value ${decrypted}`);
            return;
          }
          
          decryptedBytes.push(decrypted);
        }
        
        setOutputData(decryptedBytes.join(' '));
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const saveOutput = async () => {
    if (!outputData) {
      alert('No data to save');
      return;
    }
    
    try {
      let data, defaultExt, fileTypes;
      
      if (operation === 'encrypt') {
        const pairs = outputData.match(/\(\d+,\s*\d+\)/g);
        const bytes = [];
        
        for (const pair of pairs) {
          const match = pair.match(/\d+/g);
          const a = parseInt(match[0]);
          const b = parseInt(match[1]);
          
          const aBytes = new Uint16Array([a]);
          const bBytes = new Uint16Array([b]);
          
          bytes.push(...new Uint8Array(aBytes.buffer));
          bytes.push(...new Uint8Array(bBytes.buffer));
        }
        
        data = new Uint8Array(bytes);
        defaultExt = '.enc';
        fileTypes = [{
          description: 'Encrypted Files',
          accept: { 'application/octet-stream': ['.enc'] }
        }];
      } else {
        const bytes = outputData.split(' ').map(Number);
        data = new Uint8Array(bytes);
        
        const originalExt = inputFileName.includes('.') 
          ? inputFileName.substring(inputFileName.lastIndexOf('.'))
          : '';
        
        defaultExt = originalExt || '.bin';
        fileTypes = [{
          description: 'All Files',
          accept: { 'application/octet-stream': ['*'] }
        }];
      }
      
      const blob = new Blob([data], { type: 'application/octet-stream' });
      
      if (window.showSaveFilePicker) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: `output${defaultExt}`,
            types: fileTypes
          });
          
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.error('Error saving file:', err);
            fallbackSave(blob, defaultExt);
          }
        }
      } else {
        fallbackSave(blob, defaultExt);
      }
    } catch (error) {
      alert(`Error saving file: ${error.message}`);
    }
  };

  const fallbackSave = (blob, ext) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `output${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container">
      <header>
        <h1>ElGamal Encryption System</h1>
      </header>

      <div className="main-content">
        <div className="panel key-generation">
          <h2>Key Generation</h2>
          <div className="form-group">
            <label>Prime number (p):</label>
            <div className="input-group">
              <input 
                type="text" 
                value={primeP} 
                onChange={handlePrimePChange} 
                placeholder="Enter a prime number"
              />
              <span className={`status ${primeStatus.includes('Prime') ? 'valid' : 'invalid'}`}>
                {primeStatus}
              </span>
            </div>
          </div>
          
          <button 
            className="btn primary" 
            onClick={findPrimitiveRoots} 
            disabled={!primeStatus.includes('Prime')}
          >
            Find Primitive Roots
          </button>
          
          {primitiveRoots.length > 0 && (
            <div className="roots-section">
              <p>Found {primitiveRoots.length} primitive roots:</p>
              <select 
                size="5" 
                onChange={(e) => setSelectedG(e.target.value)}
                className="roots-select"
              >
                {primitiveRoots.map((root, i) => (
                  <option key={i} value={root}>{root}</option>
                ))}
              </select>
            </div>
          )}
          
          <div className="form-group">
            <label>Selected root (g):</label>
            <input 
              type="text" 
              value={selectedG} 
              onChange={(e) => setSelectedG(e.target.value)} 
              readOnly={!!selectedG}
            />
          </div>
          
          <div className="form-group">
            <label>Private key (x):</label>
            <input 
              type="text" 
              value={privateKeyX} 
              onChange={(e) => setPrivateKeyX(e.target.value)} 
              placeholder="1 < x < p-1"
            />
          </div>

          <div className="form-group">
            <label>Random number (k):</label>
            <input 
              type="text" 
              value={kValue} 
              onChange={(e) => setKValue(e.target.value)} 
              placeholder="1 < k < p-1"
            />
          </div>
          
          <button className="btn primary" onClick={generatePublicKey}>
            Generate Public Key
          </button>
          
          {publicKey && <div className="public-key">{publicKey}</div>}
        </div>

        <div className="panel file-operations">
          <h2>File Operations</h2>
          
          <div className="form-group">
            <label>Select file:</label>
            <div className="file-input-group">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="file-input"
              />
              <button 
                className="btn secondary" 
                onClick={() => fileInputRef.current.click()}
              >
                Choose File
              </button>
              {inputFileName && <span className="file-name">{inputFileName}</span>}
            </div>
          </div>
          
          <div className="radio-group">
            <label className="radio-option">
              <input 
                type="radio" 
                checked={operation === 'encrypt'} 
                onChange={() => setOperation('encrypt')} 
              />
              Encrypt
            </label>
            <label className="radio-option">
              <input 
                type="radio" 
                checked={operation === 'decrypt'} 
                onChange={() => setOperation('decrypt')} 
              />
              Decrypt
            </label>
          </div>
          
          <div className="action-buttons">
            <button className="btn primary" onClick={processFile}>Process File</button>
            <button className="btn secondary" onClick={saveOutput}>Save Output</button>
          </div>
        </div>

        <div className="panel data-panel">
          <div className="data-section">
            <h3>Input Data</h3>
            <textarea 
              value={inputData} 
              readOnly 
              rows="5" 
              className="data-textarea"
            />
          </div>
          
          <div className="data-section">
            <h3>Output Data</h3>
            <textarea 
              value={outputData} 
              readOnly 
              rows="5" 
              className="data-textarea"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;