import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import './normalize.scss'
import App from './App';
import {BrowserRouter} from "react-router-dom";
import {Provider} from "react-redux";
import {PersistGate} from "reduxjs-toolkit-persist/integration/react";
import {store, persistor} from "./store/store";

ReactDOM.render(
    <BrowserRouter>
        <Provider store={store}>
            <PersistGate persistor={persistor}>
                <App/>
            </PersistGate>
        </Provider>
    </BrowserRouter>,
    document.getElementById('root')
);

