import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import App from './App';
import './App.css';

const app = ReactDOMClient.createRoot(document.getElementById("app"))
app.render(React.createElement(App));