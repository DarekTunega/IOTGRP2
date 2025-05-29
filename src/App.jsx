import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate
  } from "react-router-dom";

  import './index.css';
  import Home from './Home';
  import Register from './Register';
  import Login from './Login';
  import Buildings from './Buildings';
  import ProtectedRoute from './components/ProtectedRoute';
  import BuildingDetail from './components/BuildingDetail';
  import { AuthProvider, useAuth } from './context/AuthContext';

  // Wrapper for Login that redirects if already logged in
  function LoginRoute() {
	const { isLoggedIn } = useAuth();
	return isLoggedIn ? <Navigate to="/" /> : <Login />;
  }

  function App() {
	return (
	  <AuthProvider>
		<Router>
		  <Routes>
			<Route path="/" element={<Home />} />
			<Route path="/login" element={<LoginRoute />} />
			<Route path="/register" element={<Register />} />

			{/* Protected Routes */}
			<Route
			  path="/buildings"
			  element={
				<ProtectedRoute>
				  <Buildings />
				</ProtectedRoute>
			  }
			/>
      {/* Route for individual building details */}
      <Route
        path="/buildings/:buildingId" // Dynamic route for building details
        element={
          <ProtectedRoute>
            <BuildingDetail />
          </ProtectedRoute>
        }
      />
		  </Routes>
		</Router>
	  </AuthProvider>
	);
  }

  export default App;
