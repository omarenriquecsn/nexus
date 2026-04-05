import express from 'express';
import cors from 'cors';
import { prisma } from './config/db'; // Importamos la instancia centralizada
import diagnosticRoutes  from './routes/diagnostic.routes';
import clientRoutes from './routes/client.routes';
import fleetRoutes from './routes/fleet.routes.js';
import vehicleRoutes from './routes/vehicle.routes.js';
import toolRoutes from './routes/tool.routes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/diagnostics', diagnosticRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/fleet', fleetRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/tools', toolRoutes);
// Función de arranque
async function startServer() {
  try {
    // 1. Intentar conectar a la DB antes de nada
    console.log('⏳ Conectando a la base de datos...');
    await prisma.$connect();
    console.log('✅ Base de datos conectada.');

    // 2. Una vez conectada, levantamos Express
    app.listen(PORT, () => {
      console.log(`🚀 Nexus Core operativo en http://localhost:${PORT}`);
    });
    
  } catch (error) {
    console.error('❌ Error crítico al iniciar el servidor:');
    console.error(error);
    
    // Si no hay base de datos, cerramos el proceso para no dejar un "zombie"
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();