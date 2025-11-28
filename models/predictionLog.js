// models/predictionLog.js
'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PredictionLogSchema = new Schema({
    fecha: { type: Date, default: Date.now },
    datosEntrada: { type: Object, required: true }, // Los datos que usaste para predecir
    resultadoPrediccion: { type: Number, required: true } // El consumo predicho
});

module.exports = mongoose.model('PredictionLog', PredictionLogSchema);