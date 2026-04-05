import { Router } from 'express';
import { createClient, getClients, searchClients } from '../controllers/client.controller.js';
import { getClientFleet } from '../controllers/client.controller.js';

const clientRoutes = Router();

clientRoutes.get('/', getClients);
clientRoutes.post('/', createClient);
clientRoutes.get('/:id/vehicles', getClientFleet); 
clientRoutes.get('/search', searchClients);
clientRoutes.put('/:id', createClient);

export default clientRoutes;