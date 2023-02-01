import React, { useState } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const handleInput = (e) => {
    setInput(e.target.value);
  };

  //function to get response from /api/data

  const idk = async (input) => {
    fetch('http://localhost:3000/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({input: input})
        })
        .then(response => response.json())
        .then(data => {
          console.log(data);
        }
        );
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    idk(input);
  };

  return (
    <div className="main">
      <h1 className='heading'>OpenAI Chat Bot</h1>
      <form className='input-group' onSubmit={handleSubmit}>
        <input className='input-field' placeholder='Enter Your Input' type="text" value={input} onChange={handleInput} />
        <button className='submit' type="submit">Submit</button>
      </form>
      <button onClick={() => idk(input)}>holl</button>
      <p className='result'>
        {result}
      </p>
    </div>
  );
}

export default App;