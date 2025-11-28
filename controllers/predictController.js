// controllers/predictController.js
const { getModelInfo, predict } = require("../services/tfModelService");
const tfModelService = require('../services/tfModelService');
const dbService = require('../services/dbService'); // Importamos el nuevo servicio


function health(req, res) {
  res.json({
    status: "ok",
    service: "predict"
  });
}
async function getPrediction(req, res) {
    const inputs = req.body; // Asumiendo que los datos llegan por POST
    
    try {
        // 1. Obtener predicción de la IA (Tu lógica actual)
        const prediction = await tfModelService.predict(inputs); 

        // 2. Guardar en Base de Datos (Nueva lógica de persistencia)
        // Guardamos tanto lo que entró (inputs) como lo que salió (prediction)
        const logGuardado = await dbService.guardarPrediccion(inputs, prediction);

        // 3. Responder al cliente
        res.status(200).send({ 
            mensaje: 'Predicción realizada y guardada',
            prediccion: prediction,
            id_registro: logGuardado._id 
        });

    } catch (err) {
        res.status(500).send({ mensaje: `Error en el proceso: ${err.message}` });
    }
}

function ready(req, res) {
  const info = getModelInfo();

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

async function doPredict(req, res) {
  const start = Date.now();

  try {
    const info = getModelInfo();
    if (!info.ready) {
      return res.status(503).json({
        error: "Model not ready",
        ready: false
      });
    }

    const { features, meta } = req.body;

    if (!features) {
      return res.status(400).json({ error: "Missing features" });
    }
    if (!meta || typeof meta !== "object") {
      return res.status(400).json({ error: "Missing meta object" });
    }

    const { featureCount } = meta;

    if (featureCount !== info.inputDim) {
      return res.status(400).json({
        error: `featureCount must be ${info.inputDim}, received ${featureCount}`
      });
    }

    if (!Array.isArray(features) || features.length !== info.inputDim) {
      return res.status(400).json({
        error: `features must be an array of ${info.inputDim} numbers`
      });
    }

    const prediction = await predict(features);
    const latencyMs = Date.now() - start;
    const timestamp = new Date().toISOString();

    // De momento sin MongoDB → predictionId null
    res.status(201).json({
      predictionId: null,
      prediction,
      timestamp,
      latencyMs
    });
  } catch (err) {
    console.error("Error en /predict:", err);
    res.status(500).json({ error: "Internal error" });
  }
}

module.exports = {
  health,
  ready,
  doPredict,
  getPrediction
};
