import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import type { User } from '../../types/models';

interface JwtPayload {
  userId: string;
  email: string;
}

export const generateTokens = (user: User) => {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
  };

  const accessOptions: SignOptions = {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as any
  };

  const refreshOptions: SignOptions = {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, accessOptions);
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, refreshOptions);

  return { accessToken, refreshToken }; 
}; 

export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

export default {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
};