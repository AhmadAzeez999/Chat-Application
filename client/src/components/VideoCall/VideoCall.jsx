import React from 'react';
import './VideoCall.css';

const VideoCall = ({ videoRef }) => 
{
    return (
        <div className="video-call">
            <video ref={videoRef} autoPlay></video>
        </div>
    );
};

export default VideoCall;
