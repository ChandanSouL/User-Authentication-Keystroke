import React, { useState, Fragment, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import { SnackbarProvider } from 'notistack';
import { enqueueSnackbar } from 'notistack';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Header from './components/Header';
import Home from './components/Home';
import TrainTest from './components/TrainTest';
import TrainTestUpload from './components/TrainTestUpload';
import TrainTestResults from './components/TrainTestResults';
import TakeTest from './components/TakeTest';
import TakeTestUpload from './components/TakeTestUpload';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import axios from 'axios';
import HOST from './Constants';
import './App.scss';

function App() {
  const [showBackDrop, setShowBackDrop] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loggedUser, setLoggedUser] = useState('');
  const location = useLocation();

  useEffect(() => {
    axios.post(
      HOST + '/app/isAuth',
      JSON.stringify({}),
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
          setLoggedIn(true);
          setLoggedUser(res.data["username"]);
        } else {
          enqueueSnackbar(res.data["data"], {
            variant: "error",
          });
        }
      }).catch((err) => {
        setShowBackDrop(false);
      });

  }, [setLoggedIn, setLoggedUser]);

  return (
    <Fragment>
      <Header
        loggedIn={loggedIn}
        loggedUser={loggedUser}
        logout={() => {
          setShowBackDrop(true);
          axios.post(
            HOST + '/app/signout',
            JSON.stringify({}),
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
                setLoggedIn(false);
                setLoggedUser('');
              } else {
                enqueueSnackbar(res.data["data"], {
                  variant: "error",
                });
              }
            }).catch((err) => {
              setShowBackDrop(false);
            });
        }}
      >
        <SwitchTransition className="transition" mode="out-in">
          <CSSTransition
            key={location.key}
            timeout={450}
            classNames="fade"
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/trainTest" element={<TrainTest />} />
              <Route path="/trainTestUpload" element={<TrainTestUpload />} />
              <Route path="/trainTestResults" element={<TrainTestResults />} />
              <Route path="/takeTest" element={<TakeTest />} />
              <Route path="/takeTestUpload" element={<TakeTestUpload />} />
              <Route path="/signUp" element={<SignUp />} />
              <Route path="/signIn" element={<SignIn onLogin={(username) => {
                setLoggedIn(true);
                setLoggedUser(username);
              }} />} />
            </Routes>
          </CSSTransition>
        </SwitchTransition>
      </Header >
      <SnackbarProvider anchorOrigin={{
        "horizontal": "right",
        "vertical": "top"
      }}

      />
      <Backdrop
        sx={{ color: '#fff', zIndex: 5 }}
        open={showBackDrop}
        onClick={null}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Fragment>
  );
}

export default App;
