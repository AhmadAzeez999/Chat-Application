import React, { useContext } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import Chat from './pages/Chat';
import Register from './pages/Register';
import Login from './pages/Login';
import NavBar from './components/NavBar.jsx/NavBar';
import { AuthContext } from './context/AuthContext';
import { ChatContextProvider } from './context/ChatContext';
import UserSearch from './pages/UserSearch';
import { CallContextProvider } from './context/CallContext';

function App() 
{
	const { user } = useContext(AuthContext);

	return (
		<>
			<ChatContextProvider user={user}>
				<CallContextProvider user={user}>
					<NavBar/>
					<Routes>
						<Route path="/" element={user ? <Chat /> : <Login/>} />
						<Route path="/register" element={user ? <Chat /> : <Register/>} />
						<Route path="/login" element={user ? <Chat /> : <Login/>} />
						<Route path="/search" element={user ? <UserSearch /> : <Login/>} />
						<Route path="*" element={<Navigate to="/"/>} />
					</Routes>
				</CallContextProvider>
			</ChatContextProvider>
		</>
	)
}

export default App
