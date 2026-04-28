import Login from "./pages/login";    
import Register from "./pages/register";
import { AuthProvider } from "./context/AuthContext"; 

function App() {
  return (
    <AuthProvider>
      <div>
        <h1>Habit Tracker</h1>

        <Login />
        <hr />
        <Register />
      </div>
    </AuthProvider>
  );
}

export default App;