const mongoose = require('mongoose');

const correoSchema = new mongoose.Schema({
  Apellidos: String,
  Nombres: String,
  Identificacion: String,
  Correo: String,
  Fecha_Nacimiento: Date,
});

const correoModel=correoSchema;

module.exports = {correoModel};