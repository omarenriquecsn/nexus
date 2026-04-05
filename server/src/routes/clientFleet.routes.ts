import { Router } from 'express';
import { getClientFleet } from '../controllers/client.controller.js';

const clientFleetRoutes = Router();

// GET /api/clients/:id/vehicles
clientFleetRoutes.get('/:id/vehicles', getClientFleet);

export default clientFleetRoutes;

// Placeholder for the route file
