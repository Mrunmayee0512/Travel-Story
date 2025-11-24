import { BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import React from 'react'
import Navbar from "./components/Navbar";
import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp';
import Home from './pages/Home/Home';
import Stories from "./pages/Stories/Stories";
import CreateStory from "./pages/Stories/CreateStory";
import Homepage from './pages/Auth/Homepage';

const App = () => {
    return (
        <div>
          <Router>
            <Routes>
              {/* <Route path="/" exact element={<Root />} /> */}
              <Route path="/" element={<Homepage />} />
              <Route path="/dashboard" exact element={<Home />} />
              <Route path="/login" exact element={<Login />} />
              <Route path="/signup" exact element={<SignUp />} />
              <Route path="/stories" element={<Stories />} />
                <Route path="/create-story" element={<CreateStory />} />
            </Routes>
          </Router>
        </div>
    )
}

//Define the Root component to handle the initial redirect
const Root = () => {
  //Check if token exists in localStorage
  const isAuthenticated = !!localStorage.getItem('token');

  //Redirect to dashboard if authenticated, otherwise to login
  return isAuthenticated ?(
    <Navigate to="/dashboard" />
  ) : (
    <Navigate to="/login" />
  );
  };

export default App 