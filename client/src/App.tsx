import React from 'react';
import './App.css';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import LoginPage from './pages/loginPage';
import RegisterPage from './pages/registerPage';
import UserPage from './pages/userPage';
import RankingPage from './components/ranking'; // 引入 RankingPage
import Homepage from './pages/homePage';
import AdmissionDataPage from './pages/admissionPage';
import UniversityPage from './pages/universityPage'; 
import CommentPage from './components/commentProfile';
import UniversityInfoPage from './pages/UniversityInfoPage';


 const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<LoginPage/>}>
        </Route>
        <Route path='/home' element={<Homepage/>}>
        </Route>
        <Route path='/register' element={<RegisterPage/>}>
        </Route>
        <Route path='/user/:userID' element={<UserPage/>}>
        </Route>
        <Route path='/ranking' element={<RankingPage/>}>
        </Route>
        <Route path='/admission' element={<AdmissionDataPage/>}>
        </Route>
        <Route path='/university' element={<UniversityPage/>}>
        </Route>
        <Route path="/" element={<UniversityPage />} />
        <Route
          path="/university/:universityName"
          element={<UniversityInfoPage />}
        />
        <Route path='/comment' element={<CommentPage/>}>
        </Route>
      </Routes>
    </Router>
  )
}

export default App;
