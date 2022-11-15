const mongoose = require('mongoose')
const Schema = mongoose.Schema

const GrupoDeEstudoModelSchema = Schema({
    nome: String,
    meta: String,
    descricao: String,
    data_encontros: String,
    membros: [[]],
    material: String
});

module.exports = mongoose.model("grupo", GrupoDeEstudoModelSchema);