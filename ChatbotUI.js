import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ChatbotUI.css';
import RamanasoftLogo from './Ramanasoft_logo.jpeg';
import DataTable from './tableData';

const ChatbotUI = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
    setMessages(savedHistory);
    setHistory(savedHistory);
  }, []);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
    setHistory(messages);
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleLogout = () => {
    setMessages([]);
    setInputValue('');
    navigate('/');
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() !== '') {
      const inputMessage = { type: 'text', content: inputValue.trim(), isBot: false };
      setMessages(prevMessages => [...prevMessages, inputMessage]);
      setInputValue('');

      setIsLoading(true); 

      try {
        const options = {
          method: 'GET',
          url: 'http://localhost:5000/api/query/',
          params: { q: inputValue },
        };

        const response = await axios.request(options);
        console.log('API response:', response.data);

        let apiData;
        try {
          apiData = JSON.parse(response.data.response);
          console.log('Parsed API data:', apiData);
        } catch (e) {
          const botResponse = { type: 'text', content: response.data.response, isBot: true };
          setMessages(prevMessages => [...prevMessages, botResponse]);
          setIsLoading(false);
          return;
        }

        if (apiData.type === 'table' && Array.isArray(apiData.data)) {
          if (apiData.data.length > 0 && typeof apiData.data[0] === 'object') {
            const tableMessage = { type: 'table', content: apiData.data, isBot: true };
            setMessages(prevMessages => [...prevMessages, tableMessage]);
          } else {
            const errorMessage = { type: 'text', content: 'Invalid table data format received.', isBot: true };
            setMessages(prevMessages => [...prevMessages, errorMessage]);
          }
        } else if (typeof apiData.response === 'string') {
          const botResponse = { type: 'text', content: apiData.response, isBot: true };
          setMessages(prevMessages => [...prevMessages, botResponse]);
        } else {
          const errorMessage = { type: 'text', content: 'Unexpected response format.', isBot: true };
          setMessages(prevMessages => [...prevMessages, errorMessage]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        const errorMessage = { type: 'text', content: 'Error fetching data.', isBot: true };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleHistoryItemClick = (item) => {
    if (item.isBot) {
      setMessages(prevMessages => [...prevMessages, item]);
    } else {
      setInputValue(item.content);
    }
  };

  const handleMoreOptionsClick = (index) => {
    const selectedItem = history[index];
    setMessages(prevMessages => [...prevMessages, selectedItem]);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="chatbot-container">
      <div ref={sidebarRef} className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="history-container">
          <h4 className="history-heading">History</h4>
          <div className="history-list">
            {history.map((item, index) => (
              <div key={index} className="history-item-wrapper">
                <div
                  className={`history-item ${item.isBot ? 'bot-message' : 'user-message'}`}
                  onClick={() => handleHistoryItemClick(item)}
                >
                  {item.type === 'text' ? item.content : 'Table data'}
                </div>
                <div className="more-options" onClick={() => handleMoreOptionsClick(index)}>
                  <i className="fas fa-ellipsis-h"></i>
                </div>
              </div>
            ))}
          </div>
          <div className="sidebar-watermark">
            <span className="watermark">Ramanasoft</span>
          </div>
        </div>
        <div className="profile-section">
          <div className="profile-card">
            <img
              src="https://i.pinimg.com/736x/6d/1e/bf/6d1ebf50b4a2c395dabbd4f8c1670c4b.jpg"
              alt="Profile"
              className="profile-pic"
            />
            <div className="profile-name">Saikiran P</div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
      <div className="chat-window">
        <div className="chat-header">
          <button className="menu-button" onClick={toggleSidebar}>
            <i className="fas fa-bars"></i>
          </button>
          <img src={RamanasoftLogo} alt="logo" className="logo" />
          <h3>QTBot</h3>
        </div>
        <div className="chat-container">
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message-wrapper ${message.isBot ? 'bot-message' : 'user-message'}`}
              >
                {message.type === 'text' ? (
                  <div className={`message-bubble ${message.isBot ? 'bot-message' : 'user-message'}`}>
                    {message.content}
                  </div>
                ) : message.type === 'table' ? (
                  <div className="table-container">
                    <DataTable data={message.content} />
                  </div>
                ) : null}
              </div>
            ))}
            {isLoading && (
              <div className="message-wrapper bot-message">
                <div className="loader-container">
                  <div className="flipping-cards">
                    <div className="card">l</div>
                    <div className="card">o</div>
                    <div className="card">a</div>
                    <div className="card">d</div>
                    <div className="card">i</div>
                    <div className="card">n</div>
                    <div className="card">g</div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="input-container">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
          />
          <button onClick={handleSendMessage}>
            <i className="fas fa-arrow-circle-up"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotUI;

