import React, { useState } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const handleInput = (e) => {
    setInput(e.target.value);
  };

  const sendOpenAI = async (input) => {
    fetch('/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({input: input})
        })
        .then(response => response.json())
        .then(data => {
          setResult(data.message);
        }
        );
  };
  const handleSubmit = () => {
    sendOpenAI(input);
  };

  return (
    <div className="main">
      <h1 className='heading'>OpenAI Chat Bot</h1>
      <div className='input-group'>
        <input className='input-field' placeholder='Enter Your Input' type="text" value={input} onChange={handleInput} />
        <button className='submit' onClick={()=>handleSubmit()}>Submit</button>
      </div>
      <div className='result'>
        {result}
      </div>
    </div>
  );
}

export default App;