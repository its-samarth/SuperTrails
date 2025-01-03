import { configureStore, combineReducers } from '@reduxjs/toolkit';
import addressReducer from './addressSlice';
import { persistReducer, persistStore } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

// Combine reducers 
const rootReducer = combineReducers({
  address: addressReducer,
});

// Persist reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    }),
});

// Persistor
export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
