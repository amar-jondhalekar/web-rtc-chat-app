import React, { createContext, useState, useRef, useEffect } from 'react';
import { io } from "socket.io-client"; // Correct way
import Peer from 'simple-peer';

const SocketContext = createContext();

const socket = io('http://localhost:5000');

const ContextProvider = ({ children }) => {
  const [stream, setStream] = useState(null);
  const [me, setMe] = useState('');
  const [call, setCall] = useState({ isReceivedCall: false, from: '', name: '', signal: {} });
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState('');

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    // Get user media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }
      })
      .catch((error) => {
        if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          console.error("No camera or microphone found.");
        } else {
          console.error("Error accessing media devices.", error);
        }
      });

    // Socket listeners
    socket.on('me', (id) => setMe(id));
    socket.on('calluser', ({ from, name: callerName, signal }) => {
      console.log(`Incoming call from ${callerName}`);
      setCall({ isReceivedCall: true, from, name: callerName, signal });
    });

    // Clean up socket listeners on unmount
    return () => {
      socket.off('me');
      socket.off('calluser');
    };
  }, []);

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({ initiator: false, trickle: false, stream: stream });

    peer.on('signal', (data) => {
      socket.emit('answercall', { signal: data, to: call.from });
    });

    peer.on('stream', (currentStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });

    peer.signal(call.signal);
    connectionRef.current = peer;   
  };

  const callUser = (id) => {
    if (!id) {
      console.error("ID to call is empty");
      return;
    }

    console.log("Calling user with ID:", id);
    const peer = new Peer({ initiator: true, trickle: false, stream: stream });

    peer.on('signal', (data) => {
      console.log('Sending signal:', data);
      socket.emit('calluser', { userToCall: id, signalData: data, from: me, name });
    });

    peer.on('stream', (currentStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });

    socket.on('callaccepted', (signal) => {
      console.log("Call accepted, signaling...");
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;   
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
    window.location.reload();
  };

  return (
    <SocketContext.Provider value={{ call, callAccepted, myVideo, userVideo, stream, name, setName, callEnded, me, callUser, answerCall, leaveCall }}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketContext, ContextProvider };
