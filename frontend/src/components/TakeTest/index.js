import React, { useState } from 'react';
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
    const [result, setResult] = useState("");
    const [downtime, setDownTime] = useState(0);
    const [question, setQuestion] = useState('');
    const [questionKeystrokes, setQuestionKeystrokes] = useState([]);

    const keyDown = (e) => {
        setDownTime(Date.now());
    };
    const keyUp = (e) => {
        setQuestionKeystrokes(questionKeystrokes => [...questionKeystrokes, {
            key: e.key.charCodeAt(0),
            downTime: downtime,
            upTime: Date.now(),
        }]);
    };

    return (
        <div className="takeTestPage">
            <div className="takeTestTitle">
                Take Test
            </div>
            <br />
            {!result && <TextField
                className="takeTestInput"
                label="Question 1. Write a brief introduction about yourself."
                rows={10}
                value={question}
                onChange={(e) => {
                    setQuestion(e.target.value);
                }}
                onKeyDown={keyDown}
                onKeyUp={keyUp}
                variant="standard"
                multiline
                fullWidth
            />}
            {!result && <div className="takeTestNote">
                Note: Answer the following question in less than 50 words
            </div>}
            {!result && <Button
                className="takeTestButton"
                variant="outlined"
                fullWidth
                onClick={() => {
                    axios.post(
                        HOST + '/app/testResult',
                        JSON.stringify({
                            questionKeystrokes: questionKeystrokes,
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
                                setResult(res.data["result"]);
                            } else {
                                enqueueSnackbar(res.data["data"], {
                                    variant: "error",
                                });
                            }
                        }).catch((err) => {
                            setShowBackDrop(false);
                        });
                }}
            >Submit</Button>}
            {result && <div className="takeTestResult">Result: {result}</div>}
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