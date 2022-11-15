const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AlunoSchema = Schema({
    nome: String,
    email: String,
    senha: String,
    foto:  String,
});

module.exports = mongoose.model("aluno", AlunoSchema);