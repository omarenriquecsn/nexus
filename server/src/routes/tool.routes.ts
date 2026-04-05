import { Router } from 'express';
import { createLoan, returnTool, getActiveLoans } from '../controllers/tool.controller.js';

const toolRoutes = Router();

toolRoutes.post('/loans', createLoan);
toolRoutes.get('/loans/active', getActiveLoans);
toolRoutes.patch('/loans/:id/return', returnTool);

export default toolRoutes;