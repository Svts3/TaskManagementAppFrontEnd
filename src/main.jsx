import ReactDOM from "react-dom/client";
import { BrowserRouter } from 'react-router'
import { Route, Routes } from "react-router";
import SignUp from "./components/SignUp/SignUp";
import SignIn from "./components/SignIn/SignIn";
ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="sign-up" element={<SignUp/>}/>
      <Route path="sign-in" element={<SignIn/>}/>
    </Routes>
  </BrowserRouter>
)
