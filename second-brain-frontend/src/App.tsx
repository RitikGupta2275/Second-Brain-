import { Dashboard } from "./pages/dashboard";
import { Signup } from "./pages/Signup";
import { Signin } from "./pages/Signin";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ShareBrain } from "./pages/ShareBrain";
import { ProtectedRoute } from "./components/ui/ProtectedRoute";
import { NoPage } from "./pages/NoPage";

function App() {
  return <BrowserRouter>
    <Routes>
      <Route path="/signup" element={<Signup/>}/>
      <Route path="/signin" element={<Signin/>}/>
      <Route path="/share/:hash" element={<ShareBrain/>}/>

      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Dashboard/>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NoPage/>}/>

    </Routes>
  </BrowserRouter>
}

export default App 