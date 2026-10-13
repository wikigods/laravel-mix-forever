import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { ScssModuleReact } from './ScssModule.jsx';

export function setupReactApp() {
    const domContainer = document.querySelector('#react-app');
    createRoot(domContainer).render(createElement(ScssModuleReact));
}
