import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app.jsx';
import './style.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx'; 

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<BrowserRouter>
      <AuthProvider> {}
			  <App />
      </AuthProvider>
		</BrowserRouter>
	</React.StrictMode>,
);