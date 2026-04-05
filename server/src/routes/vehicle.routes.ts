import { Router } from 'express';
import { createVehicle, getVehicleByPlate } from '../controllers/vehicle.controller.js';

const vehicleRoutes = Router();

vehicleRoutes.post('/', createVehicle);
vehicleRoutes.get('/:plate', getVehicleByPlate);

export default vehicleRoutes;