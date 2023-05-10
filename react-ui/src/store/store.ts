import {configureStore} from "@reduxjs/toolkit";
import storage from 'reduxjs-toolkit-persist/lib/storage'
import arkanoidState from './arkanoid-state';
import {persistCombineReducers, persistStore} from "reduxjs-toolkit-persist";

const persistConfig = {
    key: 'root',
    storage
}

const rootReducer = persistCombineReducers(persistConfig, {arkanoidState});

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false
    })
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
