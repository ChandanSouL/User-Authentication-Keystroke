import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import './index.scss';

const headers = {
    '/': 'Home',
};

const loggedOutHeaders = {
    '/signUp': 'Sign Up',
    '/signIn': 'Sign In',
};

const loggedInHeaders = {
    '/trainTest': 'Train / Test',
    '/trainTestUpload': 'Train / Test Upload',
    '/trainTestResults': 'Train / Test Results',
    '/takeTest': 'Take Test',
    '/takeTestUpload': 'Take Test Upload',
};

export default function Index({ loggedIn, logout, children }) {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (loggedIn) {
            if (!(location.pathname in headers) && !(location.pathname in loggedInHeaders)) {
                navigate('/');
            }
        } else {
            if (!(location.pathname in headers) && !(location.pathname in loggedOutHeaders)) {
                navigate('/');
            }
        }
    }, [loggedIn, location.pathname, navigate]);

    const getLink = (key, value) => {
        return (
            <div
                key={key}
                className={`l-nav-link${location.pathname === key ? ' active' : ''}`}
                onClick={() => navigate(key)}
            >
                {value}
            </div>
        );
    };

    return (
        <div className="app">
            <div className="l-navbar">
                <div className="l-header">
                    <LocalLibraryIcon className="l-header-logo" />
                    Key Stroke
                </div>
                <div className="l-nav-links">
                    {Object.keys(headers).map((key) => {
                        return getLink(key, headers[key]);
                    })}
                    {loggedIn ?
                        Object.keys(loggedInHeaders).map((key) => {
                            return getLink(key, loggedInHeaders[key]);
                        }) :
                        Object.keys(loggedOutHeaders).map((key) => {
                            return getLink(key, loggedOutHeaders[key]);
                        })
                    }
                    {loggedIn &&
                        <div
                            className={`l-nav-link`}
                            onClick={() => logout()}
                        >
                            Logout
                        </div>
                    }
                </div>
            </div>
            <div className="r-navbar">
                {children}
            </div>
        </div>
    );
}
