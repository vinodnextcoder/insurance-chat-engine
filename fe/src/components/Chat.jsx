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
  const [messageCounter, setMessageCounter] = useState(0);
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
    // Handle null and undefined
    if (value === null || value === undefined) return 'N/A';
    
    // Handle empty strings after trimming
    if (typeof value === 'string' && value.trim() === '') return 'N/A';
    
    // Handle booleans
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    
    // Handle numbers
    if (typeof value === 'number') return value.toString();
    
    // Handle strings (including UUIDs and session IDs)
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed || 'N/A';
    }
    
    // Handle arrays
    if (Array.isArray(value)) {
      if (value.length === 0) return 'N/A';
      return value.map(v => formatDataValue(v)).join(', ');
    }
    
    // Handle objects
    if (typeof value === 'object') {
      try {
        // Handle common object structures - Address
        if (value.street && value.city) {
          const parts = [value.street, value.city];
          if (value.state) parts.push(value.state);
          if (value.zipCode) parts.push(value.zipCode);
          return parts.join(', ');
        }
        
        // Handle common object structures - Property
        if (value.type && value.yearBuilt) {
          return `${value.type} (${value.yearBuilt})`;
        }
        
        // Generic object - show key values
        const entries = Object.entries(value).filter(
          ([k, v]) => v !== null && v !== undefined && v !== '' && k !== 'id' && k !== '_id'
        );
        
        if (entries.length === 0) return 'N/A';
        
        const formattedEntries = entries.map(([k, v]) => `${k}: ${formatDataValue(v)}`);
        return formattedEntries.join(' | ');
      } catch (e) {
        console.error('Error formatting object:', e);
        return 'Complex Value';
      }
    }
    
    // Fallback for any other type
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
      setMessageCounter(1);
      // Set sessionId in collectedData immediately
      setCollectedData({
        sessionId: response.sessionId
      });
      setMessages([{
        id: `msg-0`,
        type: 'bot',
        text: response.message || 'Hi! 👋 I\'m your insurance assistant. How can I help you today?'
      }]);
      console.log('Conversation started. Session ID:', response.sessionId);
    } catch (error) {
      console.error('Failed to start conversation:', error);
      setMessages([{
        id: `msg-error-${Date.now()}`,
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

    const userMessageId = `msg-${messageCounter}`;
    const userMessage = {
      id: userMessageId,
      type: 'user',
      text: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setMessageCounter(messageCounter + 1);

    try {
      const response = await conversationAPI.sendMessage(conversationId, input);
      
      if (response.collectedData) {
        console.log('Collected data received:', response.collectedData);
        console.log('Fields in collected data:', Object.keys(response.collectedData));
        // Merge with existing collectedData to preserve sessionId
        setCollectedData(prev => ({
          ...prev,
          ...response.collectedData
        }));
      }

      const botMessageId = `msg-${messageCounter + 1}`;
      setMessages(prev => [...prev, {
        id: botMessageId,
        type: 'bot',
        text: response.reply || response.message || 'Unable to process response'
      }]);

      setMessageCounter(messageCounter + 2);

      const userInput = input.toLowerCase();
      const isConfirmation = userInput.includes('yes') || userInput.includes('confirm') || 
                           userInput.includes('proceed') || userInput.includes('correct') ||
                           userInput.includes('right') || userInput.includes('ok');

      if (isConfirmation && response.collectedData && Object.keys(response.collectedData).length > 0) {
        setGeneratingQuotes(true);
        setTimeout(() => {
          handleGenerateQuotes();
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, {
        id: `msg-error-${Date.now()}`,
        type: 'bot',
        text: 'Sorry, I couldn\'t process that. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuotes = async () => {
    try {
      const response = await quoteAPI.generateQuote(conversationId);
      console.log('Quote response received:', response);
      if (response.quotes && response.quotes.length > 0) {
        console.log('Quote structure:', response.quotes[0]);
        console.log('Available fields in quote:', Object.keys(response.quotes[0]));
        setQuotes(response.quotes);
        setShowQuotesPanel(true);
      } else {
        console.warn('No quotes returned in response');
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
            {messages.map((msg, idx) => (
              <div key={msg.id || `msg-${idx}`} className={`message message-${msg.type}`}>
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
              {quotes.map((quote, index) => {
                // Get the primary display value for header
                const carrierName = quote.carrier || quote.provider || `Quote ${index + 1}`;
                const totalPrice = quote.total_premium || quote.premium || quote.price || 'N/A';
                
                // Get all quote fields excluding internal fields
                const quoteFields = Object.entries(quote).filter(([key]) => !['_id', 'id'].includes(key));
                
                return (
                  <div key={index} className="quote-card">
                    <div className="quote-header" onClick={() => toggleQuoteExpansion(index)}>
                      <h4>{carrierName}</h4>
                      <span className="quote-price">${totalPrice}</span>
                      <span className="expand-icon">{expandedQuote === index ? '▼' : '▶'}</span>
                    </div>
                    {expandedQuote === index && (
                      <div className="quote-details">
                        <div className="quote-breakdown">
                          <h5>Quote Breakdown</h5>
                          <div className="breakdown-items">
                            {quoteFields.map(([key, value]) => {
                              // Format field names for display
                              const displayKey = key
                                .replace(/_/g, ' ')
                                .replace(/([A-Z])/g, ' $1')
                                .replace(/^./, str => str.toUpperCase())
                                .trim();
                              
                              // Format value for display
                              let displayValue = formatDataValue(value);
                              // Add $ for currency-like fields
                              if (['premium', 'fees', 'taxes', 'total_premium', 'total premium', 'base premium', 'deductible', 'price'].some(term => displayKey.toLowerCase().includes(term))) {
                                if (displayValue !== 'N/A' && !isNaN(displayValue)) {
                                  displayValue = `$${displayValue}`;
                                }
                              }
                              
                              return (
                                <div key={key} className="breakdown-item">
                                  <span className="label">{displayKey}:</span>
                                  <span className="value">{displayValue}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
