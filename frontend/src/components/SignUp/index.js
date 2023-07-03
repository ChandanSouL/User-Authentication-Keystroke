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

export default function Index() {
    const [showBackDrop, setShowBackDrop] = useState(false);
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    return (
        <div className="signUpPage">
            <div className="signUpTitle">
                Sign Up
            </div>
            <div className="signUpInputs">
                <TextField
                    className="signUpInput"
                    label="Username"
                    value={username}
                    onChange={(e) => {
                        setUsername(e.target.value);
                    }}
                    variant="standard"
                    fullWidth
                />
                <TextField
                    className="signUpInput"
                    label="First Name"
                    value={firstName}
                    onChange={(e) => {
                        setFirstName(e.target.value);
                    }}
                    variant="standard"
                    fullWidth
                />
                <TextField
                    className="signUpInput"
                    label="Last Name"
                    value={lastName}
                    onChange={(e) => {
                        setLastName(e.target.value);
                    }}
                    variant="standard"
                    fullWidth
                />
                <TextField
                    className="signUpInput"
                    label="Email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                    }}
                    variant="standard"
                    fullWidth
                />
                <TextField
                    className="signUpInput"
                    label="Password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                    }}
                    type="password"
                    variant="standard"
                    fullWidth
                />
                <TextField
                    className="signUpInput"
                    label="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => {
                        setConfirmPassword(e.target.value);
                    }}
                    type="password"
                    variant="standard"
                    fullWidth
                />
                <Button
                    className="signUpButton"
                    variant="outlined"
                    fullWidth
                    onClick={() => {
                        if (password !== confirmPassword) {
                            enqueueSnackbar("Password doesn't match", {
                                variant: "error",
                            });
                            return;
                        }

                        setShowBackDrop(true);
                        axios.post(
                            HOST + '/app/signup',
                            JSON.stringify({
                                username: username,
                                firstName: firstName,
                                lastName: lastName,
                                email: email,
                                password: password,
                            }),
                            {
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                            },
                        )
                            .then((res) => {
                                setShowBackDrop(false);
                                if (res.data['status'] === 200) {
                                    enqueueSnackbar(res.data["data"], {
                                        variant: "success",
                                    });
                                    navigate('/signIn');
                                } else {
                                    enqueueSnackbar(res.data["data"], {
                                        variant: "error",
                                    });
                                }
                            }).catch((err) => {
                                setShowBackDrop(false);
                            });
                    }}
                >Sign Up</Button>
            </div>
            <Backdrop
                sx={{ color: '#fff', zIndex: 5 }}
                open={showBackDrop}
                onClick={null}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </div>
    )
}