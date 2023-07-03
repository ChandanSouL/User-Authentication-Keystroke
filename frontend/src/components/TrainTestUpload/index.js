import React, { useState, useRef } from "react";
import { enqueueSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import GetAppIcon from '@mui/icons-material/GetApp';
import axios from 'axios';
import HOST from './../../Constants';
import "./index.scss";

export default function Index() {
    const navigate = useNavigate();
    const [showBackDrop, setShowBackDrop] = useState(false);
    const [input, setInput] = useState('');
    const inputRef = useRef(null);

    const submit = async (file) => {
        let text = await file.text();
        setInput(text);
    };

    const onDrop = (e) => {
        e.preventDefault();
        console.log(e)

        if (e.dataTransfer && e.dataTransfer.items) {
            for (let i = 0; i < e.dataTransfer.items.length; i++) {
                if (e.dataTransfer.items[i].kind === 'file') {
                    let file = e.dataTransfer.items[i].getAsFile();
                    if (file.name.endsWith('.csv')) {
                        submit(file);
                        return;
                    }
                }
            }
        }

        if (e.target && e.target.files) {
            for (let i = 0; i < e.target.files.length; i++) {
                let file = e.target.files[i];
                if (file.name.endsWith('.csv')) {
                    submit(file);
                    return;
                }
            }
        }
    };

    return (
        <div className="trainTestUploadPage">
            <div className="trainTestUploadTitle">
                Train/Test Data Upload
            </div>
            <div className="trainTestUploadDiv" onDrop={(e) => onDrop(e)}>
                <input
                    ref={inputRef}
                    type="file"
                    className="trainTestUploadDivInput"
                    name="file"
                    accept=".csv"
                    onChange={(e) => onDrop(e)}
                />
                <div className="trainTestUploadDivSelect">
                    <GetAppIcon className="appIcon" />
                    <p>Choose Train/Test data</p>
                </div>
            </div>
            <Button
                className="trainTestUploadButton"
                variant="outlined"
                fullWidth
                onClick={() => {
                    axios.post(
                        HOST + '/app/trainTestUpload',
                        JSON.stringify({
                            keyStrokes: input,
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