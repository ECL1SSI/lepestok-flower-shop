import React from 'react';
import {createRoot} from 'react-dom/client';
import Storefront from '../components/storefront';
import '../app/globals.css';
createRoot(document.getElementById('root')!).render(<Storefront/>);
