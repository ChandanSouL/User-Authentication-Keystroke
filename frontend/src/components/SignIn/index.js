import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { enqueueSnackbar } from 'notistack';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import axios from 'axios';
import HOST from './../../Constants';
import './index.scss';

export default function Index({ onLogin }) {
    const [showBackDrop, setShowBackDrop] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    return (
        <div className="signInPage">
            <div className="signInTitle">
                Sign In
            </div>
            <div className="signInInputs">
                <TextField
                    className="signInInput"
                    label="Username"
                    value={username}
                    onChange={(e) => {
                        setUsername(e.target.value);
                    }}
                    variant="standard"
                    fullWidth
                />
                <TextField
                    className="signInInput"
                    label="Password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                    }}
                    type="password"
                    variant="standard"
                    fullWidth
                />
                <Button
                    className="signInButton"
                    variant="outlined"
                    fullWidth
                    onClick={() => {
                        setShowBackDrop(true);
                        axios.post(
                            HOST + '/app/signin',
                            JSON.stringify({
                                username: username,
                                password: password,
                            }),
                            {
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                withCredentials: true,
                            },
                        )
                            .then((res) => {
                                setShowBackDrop(false);
                                if (res.data['status'] === 200) {
                                    enqueueSnackbar(res.data["data"], {
                                        variant: "success",
                                    });
                                    onLogin(res.data["username"]);
                                    navigate('/');
                                } else {
                                    enqueueSnackbar(res.data["data"], {
                                        variant: "error",
                                    });
                                }
                            }).catch((err) => {
                                setShowBackDrop(false);
                            });
                    }}
                >Sign In</Button>
            </div>
            <Backdrop
                sx={{ color: '#fff', zIndex: 5 }}
                open={showBackDrop}
                onClick={null}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </div>
    );
}