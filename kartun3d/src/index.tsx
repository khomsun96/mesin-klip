import React from 'react';
import {registerRoot, Composition} from 'remotion';
import {Video} from './Video';
import ep from './ep.json';
const Root = () => <Composition id="Kartun" component={Video} width={1080} height={1920} fps={ep.fps} durationInFrames={Math.round(ep.dur * ep.fps)} />;
registerRoot(Root);
