import React, { useState, useEffect, useRef } from 'react';
import { conversationAPI, quoteAPI } from '../services/api';
import './Chat.css';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [showQuotesPanel, setShowQuotesPanel] = useState(false);
  const [expandedQuote, setExpandedQuote] = useState(null);
  const [collectedData, setCollectedData] = useState({});
  const [generatingQuotes, setGeneratingQuotes] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const heroSteps = [
    {
      title: 'Qualify buyers naturally',
      description: 'Gather property details, coverage needs, and risk profile with smart follow-up questions — no forms, no friction.'
    },
    {
      title: 'Answer questions',
      description: 'Guide buyers through the insurance process with clear, helpful responses.'
    },
    {
      title: 'Generate quotes in real time',
      description: 'Use collected information to present relevant quote options quickly.'
    },
    {
      title: 'Bind or hand off to a licensed agent',
      description: 'Complete the experience with a smooth agent handoff when needed.'
    }
  ];

  const formatDataValue = (value) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object') {
      // Handle common object structures
      if (value.street && value.city) {
        // Address object
        return `${value.street}, ${value.city}${value.state ? ', ' + value.state : ''}${value.zipCode ? ' ' + value.zipCode : ''}`;
      }
      if (value.type && value.yearBuilt) {
        // Property object
        return `${value.type} (${value.yearBuilt})`;
      }
      // Generic object - show key values
      const entries = Object.entries(value).filter(([k, v]) => v !== null && v !== undefined && v !== '');
      if (entries.length === 0) return 'N/A';
      return entries.map(([k, v]) => `${k}: ${v}`).join(', ');
    }
    return String(value);
  };

  const handleStopQuoteGeneration = () => {
    setGeneratingQuotes(false);
    setShowQuotesPanel(false);
    setQuotes([]);
  };

  const handleStartConversation = async () => {
    try {
      setLoading(true);
      const response = await conversationAPI.startConversation({
        userId: `user-${Date.now()}`,
        type: 'insurance_quote'
      });
      setConversationId(response.sessionId);
      setMessages([{
        id: response.sessionId,
        type: 'bot',
        text: response.message || 'Hi! 👋 I\'m your insurance assistant. How can I help you today?'
      }]);
    } catch (error) {
      console.error('Failed to start conversation:', error);
      console.error('Failed to start conversation:', error);
      setMessages([{
        type: 'bot',
        text: 'Sorry, I couldn\'t start the conversation. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !conversationId) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await conversationAPI.sendMessage(conversationId, input);
      
      // Store collected data from response
      if (response.collectedData) {
        setCollectedData(response.collectedData);
      }

      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'bot',
        text: response.reply || response.message
      }]);

      // Check if user confirmed details and we have collected data
      const userInput = input.toLowerCase();
      const isConfirmation = userInput.includes('yes') || userInput.includes('confirm') || 
                           userInput.includes('proceed') || userInput.includes('correct') ||
                           userInput.includes('right') || userInput.includes('ok');

      if (isConfirmation && response.collectedData && Object.keys(response.collectedData).length > 0) {
        // Automatically generate quotes when user confirms details
        setGeneratingQuotes(true);
        setTimeout(() => {
          if (generatingQuotes) { // Check if still generating
            handleGenerateQuotes();
          }
        }, 1000); // Small delay for better UX
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, {
        type: 'bot',
        text: 'Sorry, I couldn\'t process that. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuotes = async () => {
    if (!generatingQuotes) return; // Don't generate if stopped
    
    try {
      const response = await quoteAPI.generateQuote(conversationId);
      if (response.quotes && response.quotes.length > 0) {
        setQuotes(response.quotes);
        setShowQuotesPanel(true);
      }
    } catch (error) {
      console.error('Failed to generate quotes:', error);
    } finally {
      setGeneratingQuotes(false);
    }
  };

  const toggleQuoteExpansion = (index) => {
    setExpandedQuote(expandedQuote === index ? null : index);
  };

  if (!conversationId) {
    return (
      <div className="app-layout">
        <div className="hero-panel">
          <div className="hero-copy">
            <span className="hero-step">01</span>
            <h1>Improve your buyer experience</h1>
            <p>Your AI sales agent should be able to handle the full buyer journey, from first question to signed policy.</p>
          </div>
          <ol className="step-list">
            {heroSteps.map((step, index) => (
              <li key={index} className="step-item">
                <span className="step-index">0{index + 1}</span>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="chat-section">
          <div className="welcome-screen welcome-panel">
            <h1>🤖 Insurance Chat Engine</h1>
            <p>Get instant insurance quotes and assistance</p>
            <button onClick={handleStartConversation} disabled={loading} className="start-btn">
              {loading ? 'Starting...' : 'Start Chat'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <div className="hero-panel">
        <div className="hero-copy">
          <span className="hero-step">01</span>
          <h1>Improve your buyer experience</h1>
          <p>Your AI sales agent should be able to handle the full buyer journey, from first question to signed policy.</p>
        </div>
        <ol className="step-list">
          {heroSteps.map((step, index) => (
            <li key={index} className="step-item">
              <span className="step-index">0{index + 1}</span>
              <div>
                <strong>{step.title}</strong>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="chat-section">
        <div className="chat-main">
          <div className="chat-header">
            <h2>Insurance Assistant</h2>
            <p>Conversation ID: {conversationId.slice(0, 8)}...</p>
          </div>
          
          <div className="messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message message-${msg.type}`}>
                <div className="message-content">
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="message message-bot">
                <div className="message-content typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="input-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              {loading ? '...' : 'Send'}
            </button>
          </form>
        </div>
      </div>

      <div className="side-panels">
        <div className="request-response-panel">
          <div className="panel-header">
            <h3>Request & Response</h3>
          </div>
          <div className="panel-content">
            <div className="data-section">
              <h4>Collected Information</h4>
              {Object.keys(collectedData).length > 0 ? (
                <div className="data-grid">
                  {Object.entries(collectedData).map(([key, value]) => (
                    <div key={key} className="data-item">
                      <span className="data-label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                      <span className="data-value">{formatDataValue(value)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No information collected yet</p>
              )}
              {generatingQuotes && (
                <div className="action-section">
                  <button onClick={handleStopQuoteGeneration} className="stop-btn">
                    Stop Quote Generation
                  </button>
                  <p className="generating-text">Generating quotes...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {showQuotesPanel && (
          <div className="quotes-panel">
            <div className="quotes-header">
              <h3>Insurance Quotes</h3>
              <button onClick={() => setShowQuotesPanel(false)} className="close-btn">×</button>
            </div>
            <div className="quotes-content">
              {quotes.map((quote, index) => (
                <div key={index} className="quote-card">
                  <div className="quote-header" onClick={() => toggleQuoteExpansion(index)}>
                    <h4>{quote.provider || `Quote ${index + 1}`}</h4>
                    <span className="quote-price">${quote.premium || quote.price || 'N/A'}</span>
                    <span className="expand-icon">{expandedQuote === index ? '▼' : '▶'}</span>
                  </div>
                  {expandedQuote === index && (
                    <div className="quote-details">
                      <div className="property-details">
                        <h5>Property Details</h5>
                        <div className="details-grid">
                          <div className="detail-item">
                            <span className="label">Address:</span>
                            <span className="value">{quote.property?.address || 'N/A'}</span>
                          </div>
                          <div className="detail-item">
                            <span className="label">Type:</span>
                            <span className="value">{quote.property?.type || 'N/A'}</span>
                          </div>
                          <div className="detail-item">
                            <span className="label">Value:</span>
                            <span className="value">${quote.property?.value || 'N/A'}</span>
                          </div>
                          <div className="detail-item">
                            <span className="label">Year Built:</span>
                            <span className="value">{quote.property?.yearBuilt || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="quote-breakdown">
                        <h5>Quote Breakdown</h5>
                        <div className="breakdown-items">
                          <div className="breakdown-item">
                            <span className="label">Base Premium:</span>
                            <span className="value">${quote.basePremium || 'N/A'}</span>
                          </div>
                          <div className="breakdown-item">
                            <span className="label">Coverage:</span>
                            <span className="value">{quote.coverage || 'N/A'}</span>
                          </div>
                          <div className="breakdown-item">
                            <span className="label">Deductible:</span>
                            <span className="value">${quote.deductible || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
