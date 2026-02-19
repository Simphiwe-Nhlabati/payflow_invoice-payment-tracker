import { Router } from 'express';
import type { Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate';
import { validateRequest } from '../middleware/validateRequest';
import { loginSchema, registerSchema, updateProfileSchema } from '../../types/schemas';
import { UserService } from '../services/userService';
import type { AuthenticatedRequest } from '../types/express';

const router = Router();

// Register endpoint
router.post('/register', validateRequest(registerSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userData = req.body;

    const user = await UserService.register(userData);

    // Generate tokens for automatic login after registration
    const result = await UserService.login({
      email: userData.email,
      password: userData.password
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (error) {
    // Pass error to global error handler
    next(error);
  }
});

// Login endpoint
router.post('/login', validateRequest(loginSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const credentials = req.body;

    const result = await UserService.login(credentials);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (error) {
    // Pass error to global error handler
    next(error);
  }
});

// Get current user profile
router.get('/profile', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;

    const user = await UserService.getUserProfile(userId);

    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: { user },
    });
  } catch (error) {
    // Pass error to global error handler
    next(error);
  }
});

// Update user profile
router.put('/profile', authenticate, validateRequest(updateProfileSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const updateData = req.body;

    const user = await UserService.updateUserProfile(userId, updateData);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    });
  } catch (error) {
    // Pass error to global error handler
    next(error);
  }
});

// Logout - client-side operation, no server logic needed
router.post('/logout', (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

export default router;