// routes/predictRoutes.js
const express = require("express");
const router = express.Router();

const predictController = require("../controllers/predictController");

// Contrato del servicio PREDICT
router.get("/health", predictController.health);
router.get("/ready", predictController.ready);

// CAMBIO IMPORTANTE: Ahora apuntamos a 'getPrediction' que tiene la lógica de MongoDB
router.post("/predict", predictController.getPrediction);

module.exports = router;