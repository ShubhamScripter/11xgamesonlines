import api from '../utils/axiosConfig.js';

/** Amount sent to casino API — allows 0 balance so games still open. */
export const getCasinoWalletAmount = (user) => {
  const n = Number(user?.avbalance);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100) / 100;
};

// Start casino game
export const startCasinoGame = async (userName, game_uid, credit_amount) => {
  const amount = Math.max(0, Number(credit_amount) || 0);
  try {
    const response = await api.post('/casino/start', {
      userName,
      game_uid,
      credit_amount: amount,
    });
    const data = response.data;
    if (!data?.success) {
      throw new Error(data?.message || 'Game launch failed');
    }
    if (!data?.gameUrl) {
      throw new Error('No game URL returned from server');
    }
    return data;
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }
    if (error instanceof Error && !error.response) {
      throw error;
    }
    const msg =
      error.response?.data?.message ||
      error.message ||
      'Game launch failed';
    console.error('Error starting casino game:', msg);
    const err = new Error(msg);
    err.response = error.response;
    throw err;
  }
};

/** Login check + launch; no minimum balance required. */
export const launchCasinoGameForUser = async (user, game_uid) => {
  if (!user?.userName) {
    throw new Error('Please login to play casino games');
  }
  return startCasinoGame(
    user.userName,
    game_uid,
    getCasinoWalletAmount(user)
  );
};

/** Launch using a sportsBook / casino JSON game object. */
export const launchCasinoGameFromRecord = async (user, game) => {
  if (!game?.game_uid) {
    throw new Error('Invalid game');
  }
  return launchCasinoGameForUser(user, game.game_uid);
};

// Get user balance (if needed)
export const getUserBalance = async () => {
  try {
    const response = await api.get('/user/balance');
    return response.data;
  } catch (error) {
    console.error('Error getting user balance:', error);
    throw error;
  }
};
