import React from 'react';
import './App.css';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import LoginPage from './pages/loginPage';
import RegisterPage from './pages/registerPage';
import UserPage from './pages/userPage';
import RankingPage from './components/ranking'; // 引入 RankingPage


 const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<LoginPage/>}>
        </Route>
        <Route path='/register' element={<RegisterPage/>}>
        </Route>
        <Route path='/user/:userID' element={<UserPage/>}>
        </Route>
        <Route path='/ranking' element={<RankingPage/>}>
        </Route>
      </Routes>
    </Router>
  )
}

export default App;
