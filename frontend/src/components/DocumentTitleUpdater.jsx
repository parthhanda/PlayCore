import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const routeTitles = {
    '/': 'Home',
    '/login': 'Login',
    '/register': 'Register',
    '/dashboard': 'Dashboard',
    '/profile': 'Profile',
    '/players': 'Players',
    '/squads': 'Squads',
    '/tournaments': 'Tournaments',
    '/contact': 'Contact',
    '/about': 'About',
    '/legal': 'Legal',
    '/news': 'News',
    '/admin/panel': 'Admin Dashboard',
};

const DocumentTitleUpdater = () => {
    const location = useLocation();

    useEffect(() => {
        let pageName = routeTitles[location.pathname];

        if (!pageName) {
            if (location.pathname.startsWith('/u/')) pageName = 'Profile';
            else if (location.pathname.startsWith('/squads/')) pageName = 'Squad Profile';
            else if (location.pathname.startsWith('/tournaments/create')) pageName = 'Create Tournament';
            else if (location.pathname.startsWith('/tournaments/')) pageName = 'Tournament Detail';
            else if (location.pathname.startsWith('/news/')) pageName = 'News';
            else if (location.pathname.startsWith('/admin/news/create')) pageName = 'Create News';
            else if (location.pathname.startsWith('/admin/')) pageName = 'Admin';
        }

        if (pageName && location.pathname !== '/') {
            document.title = `PlayCore - ${pageName}`;
        } else {
            document.title = 'PlayCore';
        }
    }, [location]);

    return null;
};

export default DocumentTitleUpdater;
