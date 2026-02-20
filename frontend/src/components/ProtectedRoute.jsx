import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

// eslint-disable-next-line react/prop-types
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div className="text-neon-blue p-10 text-center animate-pulse">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
