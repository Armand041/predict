// controllers/predictController.js
'use strict';

const tfModelService = require('../services/tfModelService');
const dbService = require('../services/dbService');

/**
 * Endpoint de salud para verificar que el servicio responde.
 */
function health(req, res) {
    res.json({
        status: "ok",
        service: "predict"
    });
}

/**
 * Endpoint para verificar si el modelo de IA ya está cargado en memoria.
 */
function ready(req, res) {
    const info = tfModelService.getModelInfo();

    if (!info.ready) {
        return res.status(503).json({
            ready: false,
            modelVersion: info.modelVersion,
            message: "Model is still loading"
        });
    }

    res.json({
        ready: true,
        modelVersion: info.modelVersion
    });
}

/**
 * Función principal: Valida, Predice y Guarda en BD.
 */
async function getPrediction(req, res) {
    const start = Date.now();

    try {
        // 1. Verificamos que el modelo esté listo
        const info = tfModelService.getModelInfo();
        if (!info.ready) {
            return res.status(503).json({
                error: "Model not ready",
                ready: false
            });
        }

        // 2. Extraemos y validamos los datos de entrada
        const { features, meta } = req.body;

        if (!features) {
            return res.status(400).json({ error: "Missing features" });
        }
        
        // Validación opcional de meta (según tu código anterior)
        if (!meta || typeof meta !== "object") {
             // Si meta es obligatorio, descomenta la siguiente línea:
             // return res.status(400).json({ error: "Missing meta object" });
             console.log("Advertencia: No se recibió objeto meta");
        }

        // Validación de dimensiones (según tu código anterior)
        if (info.inputDim && features.length !== info.inputDim) {
             return res.status(400).json({
                error: `features must be an array of ${info.inputDim} numbers`
             });
        }

        // 3. Realizamos la predicción con la IA
        const prediction = await tfModelService.predict(features);
        
        // Calculamos métricas de tiempo
        const latencyMs = Date.now() - start;
        const timestamp = new Date().toISOString();

        // 4. PERSISTENCIA: Guardamos en MongoDB
        // Pasamos el cuerpo completo (req.body) para guardar features y meta
        const logGuardado = await dbService.guardarPrediccion(req.body, prediction);

        // 5. Respondemos al cliente con el ID REAL de la base de datos
        res.status(201).json({
            predictionId: logGuardado._id, // ¡Aquí ya no será null!
            prediction: prediction,
            timestamp: timestamp,
            latencyMs: latencyMs
        });

    } catch (err) {
        console.error("Error en getPrediction:", err);
        res.status(500).json({ 
            error: "Internal error",
            details: err.message 
        });
    }
}

// Exportamos las funciones
// IMPORTANTE: Asegúrate de que tu archivo de rutas use 'getPrediction'
module.exports = {
    health,
    ready,
    getPrediction 
};