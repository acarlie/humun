import React from 'react';
import SplashTemplate from './../components/SplashTemplate';

function NoMatch () {
  return (
    <SplashTemplate>
      <h1>404 Page Not Found</h1>
      <h1>
        <span role="img" aria-label="Face With Rolling Eyes Emoji">
          🙄
        </span>
      </h1>
    </SplashTemplate>
  );
}

export default NoMatch;
