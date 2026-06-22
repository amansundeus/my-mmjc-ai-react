import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ssoLogin } from '../../services/api';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tokenInput, setTokenInput] = useState('');

  // Handle automatic login if token is in the URL (e.g. ?token=XYZ)
  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      handleSsoLogin(urlToken);
    }
  }, [searchParams]);

  const handleSsoLogin = async (tokenString) => {
    if (!tokenString) return;
    
    setLoading(true);
    setError(null);
    try {
      // Create payload matching {"additionalProp1": "string"}
      // Backend expects a map of strings, we'll send the token.
      const payload = {
        token: tokenString,
        additionalProp1: tokenString // Fallback in case backend strictly maps to this
      };
      
      const response = await ssoLogin(payload);
      
      // Store token (assuming response contains token or we reuse the SSO token)
      const jwtToken = response?.token || response?.accessToken || tokenString;
      localStorage.setItem('mmjc_token', jwtToken);
      
      // Navigate to dashboard
      navigate('/');
    } catch (err) {
      console.error('SSO Login Error:', err);
      setError(err.message || 'Failed to authenticate via SSO. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    handleSsoLogin(tokenInput);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <span className="login-logo-icon">M</span>
            <h2>MMJC AI Platform</h2>
          </div>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        {error && (
          <div className="login-error">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 15A7 7 0 108 1a7 7 0 000 14zM8 4.5v4.5M8 11.5v.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleManualSubmit} className="login-form">
          <div className="login-form-group">
            <label htmlFor="token">Manual Token Entry (Dev)</label>
            <input 
              type="text" 
              id="token" 
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Paste your onemmjc.in token here..."
              disabled={loading}
              required
            />
          </div>
          <button type="submit" className="login-submit-btn" disabled={loading || !tokenInput}>
            {loading ? 'Authenticating...' : 'Authenticate with Token'}
          </button>
        </form>

        <div className="login-footer">
          <p>Secure Single Sign-On powered by MMJC.</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
