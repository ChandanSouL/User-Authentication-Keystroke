import React, { useState, useEffect } from 'react';
import { enqueueSnackbar } from 'notistack';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import axios from 'axios';
import HOST from './../../Constants';
import './index.scss';

export default function Index() {
    const [showBackDrop, setShowBackDrop] = useState(true);
    const [results, setResults] = useState([]);

    useEffect(() => {
        axios.post(
            HOST + '/app/trainTestResult',
            JSON.stringify({
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
                    setResults(res.data["result"]);
                    enqueueSnackbar(res.data["data"], {
                        variant: "success",
                    });
                } else {
                    enqueueSnackbar(res.data["data"], {
                        variant: "error",
                    });
                }
            }).catch((err) => {
                setShowBackDrop(false);
            });
    }, []);

    return (
        <div className="trainTestResultsPage">
            <div className="trainTestResultsTitle">
                Train/Test Results
            </div>
            <TableContainer>
                <Table style={{ width: "100%" }}>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">Date</TableCell>
                            <TableCell align="center">Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {results.map((row, index) => (
                            <TableRow
                                key={index}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row" align="center">
                                    {row.date}
                                </TableCell>
                                <TableCell align="center">{row.status}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
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
