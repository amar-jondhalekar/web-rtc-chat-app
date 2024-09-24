import React, { useContext } from 'react';
import { Grid, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { SocketContext } from '../SocketContext';

// Styled components
const VideoContainer = styled(Grid)(({ theme }) => ({
    justifyContent: 'center',
    [theme.breakpoints.down('xs')]: {
        flexDirection: 'column',
    },
}));

const VideoPaper = styled(Paper)(({ theme }) => ({
    padding: '10px',
    border: '2px solid black',
    margin: '10px',
}));

const Video = styled('video')(({ theme }) => ({
    width: '550px',
    maxWidth: '100%', // Make the video responsive
    [theme.breakpoints.down('xs')]: {
        width: '300px',
    },
}));

const VideoPlayer = () => {
    const { name, callAccepted, myVideo, userVideo, callEnded, stream, call } = useContext(SocketContext);
    
    return (
        <VideoContainer container>
            {/* Our own video */}
            {stream && (
                <VideoPaper>
                    <Grid item xs={12}>
                        <Typography variant='h5' gutterBottom>{name || 'Name'}</Typography>
                        <Video playsInline muted ref={myVideo} autoPlay />
                    </Grid>
                </VideoPaper>
            )}
            {/* User's Video */}
            {callAccepted && !callEnded && (
                <VideoPaper>
                    <Grid item xs={12} md={6}>
                        <Typography variant='h5' gutterBottom>{call.name || 'Name'}</Typography>
                        <Video playsInline ref={userVideo} autoPlay />
                    </Grid>
                </VideoPaper>
            )}
        </VideoContainer>
    );
}

export default VideoPlayer;
