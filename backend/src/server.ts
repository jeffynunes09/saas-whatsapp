import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authRoutes } from './presentation/routes/auth.routes';
import { agentRoutes } from './presentation/routes/agent.routes';
import { conversationRoutes } from './presentation/routes/conversation.routes';
import { whatsappRoutes } from './presentation/routes/whatsapp.routes';
import { subscriptionRoutes } from './presentation/routes/subscription.routes';
import { webhookRoutes } from './presentation/routes/webhook.routes';
import { intentRoutes } from './presentation/routes/intent.routes';
import { appointmentRoutes } from './presentation/routes/appointment.routes';
import { orderRoutes } from './presentation/routes/order.routes';
import { errorMiddleware } from './presentation/middlewares/errorMiddleware';

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigin = process.env.ALLOWED_ORIGIN ?? 'http://localhost:3001';
app.use(cors({ origin: allowedOrigin }));

// Raw body para o webhook Kiwify (deve vir ANTES do express.json global)
// Necessário para validação HMAC: o body-parser marca req._body=true,
// fazendo o express.json subsequente pular a rota.
app.use('/webhooks/kiwify', express.raw({ type: '*/*' }));

app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/webhooks', webhookRoutes);
app.use('/api/agent/intents', intentRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/orders', orderRoutes);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
