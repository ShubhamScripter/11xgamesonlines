import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import cricketReducer from '../features/sports/cricketSlice';
import tennisReducer from '../features/sports/tennisSlice';
import soccerReducer from '../features/sports/soccerSlice';
import betReducer from '../features/sports/betReducer'
export const store = configureStore({
  reducer: {
    auth: authReducer,
    cricket: cricketReducer,
    tennis: tennisReducer,
    soccer: soccerReducer,
    bet: betReducer,
  },
});

export default store;
