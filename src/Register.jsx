import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

function Register() {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: ''
	});
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();
	const { register } = useAuth();

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setSuccess('');
		setIsLoading(true);

		try {
			const result = await register(formData);

			if (result.success) {
				setSuccess('Registration successful! You can now log in.');
				setTimeout(() => {
					navigate('/login');
				}, 2000);
			} else {
				setError(result.message || 'Registration failed. Please try again.');
			}
		} catch (err) {
			setError('An error occurred during registration. Please try again.');
			console.error('Register error:', err);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen bg-gray-100">
			<Navbar />
			<div className="ml-64 flex-1 flex items-center justify-center">
				<div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md space-y-6">
					<div>
						<h2 className="text-2xl font-bold text-center text-gray-900">
							Create your account
						</h2>
					</div>

					{error && (
						<div className="p-2 bg-red-100 text-red-700 rounded">
							{error}
						</div>
					)}

					{success && (
						<div className="p-2 bg-green-100 text-green-700 rounded">
							{success}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
							<input
								id="name"
								name="name"
								type="text"
								value={formData.name}
								onChange={handleChange}
								required
								className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
								disabled={isLoading}
							/>
						</div>

						<div>
							<label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
							<input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								value={formData.email}
								onChange={handleChange}
								required
								className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
								disabled={isLoading}
							/>
						</div>

						<div>
							<label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
							<input
								id="password"
								name="password"
								type="password"
								autoComplete="new-password"
								value={formData.password}
								onChange={handleChange}
								required
								className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
								disabled={isLoading}
							/>
						</div>

						<div>
							<button
								type="submit"
								className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
								disabled={isLoading}
							>
								{isLoading ? 'Registering...' : 'Register'}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}

export default Register;
