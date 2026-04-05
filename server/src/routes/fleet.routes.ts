import { Router } from 'express';
import { getFleetSummary } from '../controllers/fleet.controller.js';

const fleetRoutes = Router();

fleetRoutes.get('/:ownerId/summary', getFleetSummary);

export default fleetRoutes;
