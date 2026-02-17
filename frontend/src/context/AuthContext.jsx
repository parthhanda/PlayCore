import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Set default axios header
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }

    const checkUserLoggedIn = async () => {
        if (token) {
            try {
                const { data } = await axios.get('http://localhost:5000/api/auth/me');
                setUser(data);
            } catch (err) {
                console.error('Auth Check Failed:', err);
                if (err.response && err.response.status === 401) {
                    logout();
                }
            }
        }
        setLoading(false);
    };

    // Axios Interceptor for 401 handling (Token Expiry)
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 401) {
                    logout();
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, []);

    useEffect(() => {
        checkUserLoggedIn();
    }, [token]);

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            localStorage.setItem('token', data.token);
            setToken(data.token);
            setUser(data);
            return data;
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/register', userData);
            localStorage.setItem('token', data.token);
            setToken(data.token);
            setUser(data);
            return data;
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, error, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
