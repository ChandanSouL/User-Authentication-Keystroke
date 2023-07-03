import React, { useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import axios from 'axios';
import HOST from './../../Constants';
import "./index.scss";

export default function Index() {
    const [showBackDrop, setShowBackDrop] = useState(false);
    const screens = ['q1', 'q2'];
    const navigate = useNavigate();
    const [currentScreen, setCurrentScreen] = useState(screens[0]);
    const [downtime, setDownTime] = useState(0);
    const [q1, setQ1] = useState('');
    const [q1Keystrokes, setQ1Keystrokes] = useState([]);
    const [q2, setQ2] = useState('');
    const [q2Keystrokes, setQ2Keystrokes] = useState([]);

    const keyDown = (e) => {
        setDownTime(Date.now());
    };
    const keyUp = (e) => {
        if (currentScreen === screens[0])
            setQ1Keystrokes(q1Keystrokes => [...q1Keystrokes, {
                key: e.key.charCodeAt(0),
                downTime: downtime,
                upTime: Date.now(),
            }]);
        else if (currentScreen === screens[1])
            setQ2Keystrokes(q2Keystrokes => [...q2Keystrokes, {
                key: e.key.charCodeAt(0),
                downTime: downtime,
                upTime: Date.now(),
            }]);
    };

    return (
        <div className="trainTestPage">
            <div className="trainTestTitle">
                Train/Test Data
            </div>
            <br />
            {currentScreen === screens[0] && <TextField
                className="trainTestInput"
                label="Question 1. Write a brief introduction about yourself."
                rows={10}
                value={q1}
                onChange={(e) => {
                    setQ1(e.target.value);
                }}
                onKeyDown={keyDown}
                onKeyUp={keyUp}
                variant="standard"
                multiline
                fullWidth
            />}
            {currentScreen === screens[1] && <TextField
                className="trainTestInput"
                label="Question 2. Which is your preferred social media platform, and why?"
                rows={10}
                value={q2}
                onChange={(e) => {
                    setQ2(e.target.value);
                }}
                onKeyDown={keyDown}
                onKeyUp={keyUp}
                variant="standard"
                multiline
                fullWidth
            />}
            <div className="trainTestNote">
                Note: Answer the following question in less than 50 words
            </div>
            <Button
                className="trainTestButton"
                variant="outlined"
                fullWidth
                onClick={() => {
                    if (currentScreen === screens[0]) {
                        setCurrentScreen(screens[1]);
                    } else if (currentScreen === screens[1]) {
                        axios.post(
                            HOST + '/app/trainTest',
                            JSON.stringify({
                                q1Keystrokes: q1Keystrokes,
                                q2Keystrokes: q2Keystrokes,
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
                                    navigate("/");
                                } else {
                                    enqueueSnackbar(res.data["data"], {
                                        variant: "error",
                                    });
                                }
                            }).catch((err) => {
                                setShowBackDrop(false);
                            });
                    }
                }}
            >Submit</Button>
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