import React from 'react';
import './Home.css';
import WaterTracker from '../../components/WaterTracker/WaterTracker';
import MusicPlayer from '../../components/MusicPlayer/MusicPlayer';
import { useNotificationContext } from '../../context/NotificationContext';

export default function Home() {

  return (
    <div className="home-container">
      <MusicPlayer />
      <WaterTracker />

    
    </div>
  );
}
