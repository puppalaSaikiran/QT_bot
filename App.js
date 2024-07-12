import React from 'react';
import RegisterButton from './register';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatbotUI from './ChatbotUI';
import Login from './login';
import './App.css';
// import GetQuote from './get';


function App() {
  return (
    <>
     <Router>
       <Routes>
         <Route path="/" element={<Login />} /> 
         <Route path="/register" element={<RegisterButton />} />
         <Route path="/ChatbotUI" element={<ChatbotUI />} />
       </Routes>
     </Router>
    <forgot/>
   
    </>
  );
}

export default App;
