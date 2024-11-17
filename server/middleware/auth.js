import { Clerk } from '@clerk/clerk-sdk-node';

const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

export const authMiddleware = async (req, res, next) => {
  try {
    const sessionToken = req.headers.authorization?.split(' ')[1];
    
    if (!sessionToken) {
      return res.status(401).json({ 
        status: 'error',
        message: 'No authentication token provided' 
      });
    }

    const session = await clerk.sessions.verifySession(sessionToken);
    
    if (!session) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Invalid session token' 
      });
    }

    req.user = session.userId;
    next();
  } catch (error) {
    next(error);
  }
};