import { Router } from "express";
import {
  createDiagnostic,
  getDiagnostics,
  getPriorityDiagnostics,
  getCriticalDiagnostics,
  confirmDiagnosticDelivery,
  getPublicDiagnostic,
  acceptDiagnosticReport,
} from "../controllers/diagnostic.controller";

const diagnosticRoutes = Router();

diagnosticRoutes.get("/", getDiagnostics);
diagnosticRoutes.get("/priority", getPriorityDiagnostics);
diagnosticRoutes.get("/critical", getCriticalDiagnostics);
diagnosticRoutes.get("/:id/public", getPublicDiagnostic);
diagnosticRoutes.post("/", createDiagnostic);
diagnosticRoutes.patch("/:id/deliver", confirmDiagnosticDelivery);
diagnosticRoutes.patch("/:id/confirm-client", acceptDiagnosticReport);

export default diagnosticRoutes;
