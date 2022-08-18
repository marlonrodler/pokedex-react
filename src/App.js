import React from 'react'
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";

import './App.css';

import Pokedex from './pages/Pokedex'

function App() {
  return (
    <Router>
        <Routes>
          <Route path='/' element={<Pokedex/>} />
        </Routes>
    </Router>
  );
}

export default App;