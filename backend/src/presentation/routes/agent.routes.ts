import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middlewares/authMiddleware';
import { AgentController } from '../controllers/AgentController';

export const agentRoutes = Router();
const controller = new AgentController();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

agentRoutes.use(authMiddleware);
agentRoutes.get('/', (req, res) => controller.getAgent(req as never, res));
agentRoutes.post('/', (req, res) => controller.configureAgent(req as never, res));
agentRoutes.patch('/pause', (req, res) => controller.togglePause(req as never, res));
agentRoutes.post('/context-file', upload.single('file'), (req, res) => controller.uploadContextFile(req as never, res));
