// services/dbService.js
'use strict';
const PredictionLog = require('../models/predictionLog');

async function guardarPrediccion(inputs, resultado) {
    try {
        const nuevaPrediccion = new PredictionLog({
            datosEntrada: inputs,
            resultadoPrediccion: resultado
        });
        return await nuevaPrediccion.save();
    } catch (err) {
        throw new Error(`Error al guardar la predicción: ${err}`);
    }
}

module.exports = {
    guardarPrediccion
};