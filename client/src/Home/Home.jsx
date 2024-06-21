import React from 'react';

import NavHome from '../global_components/NavHome';
import HomePost from './home_components/HomePost';

const Home = () => {
  return (
    <>
      <NavHome />
      <h1>welcome home</h1>
      <HomePost />
    </>
  );
};

export default Home;
