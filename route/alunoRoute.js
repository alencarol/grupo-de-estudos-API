const alunoRoute = require('express').Router();
const express = require('express');
const aluno = require('../model/alunoModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs')

//rota POST para acdastrar o aluno
alunoRoute.post('/aluno/cadastro/nome=:nome/email=:email/senha=:senha', async(req, res) => {
    try{
        //recuperando informações do body
        const nome = req.params.nome
        const email = req.params.email
        const senha = req.params.senha
        const senhac = await bcrypt.hash(senha, 10)

        //verificando campos
        if(nome == undefined || email == undefined || senha == undefined || nome === "" || email === "" || senha === ""){
            res.json({mensagem: 'Erro: Há campos sem preenchimento'})

        }else{

            if(await aluno.findOne({email})!=null){ //verifica se o email já existe no banco
                res.json({mensagem: 'Erro: Email já cadastrado em outra conta'})
            }else{
                //se o email não existir no banco, o cadastro é feito
                await aluno.create({
                    nome,
                    email,
                    senha: senhac
                });

                res.json({mensagem: 'Aluno cadastrado com sucesso :)'})
            }
        }

    }catch(erro){
        res.json({mensagem: 'Erro no cadastro do aluno :('})
        console.log(erro)
    }
});

//rota GET para perquisas por email para validar login
alunoRoute.get('/aluno/login/email=:email/senha=:senha', async(req, res) => {
    try{
        user = await aluno.findOne({"email": req.params.email})
        if(user != null){ //verifica se existe 
            // res.json(resultado)

            if(await bcrypt.compare(req.params.senha, user.senha)){
                res.json(user);
                res.json({status: "Sucesso"})
            }

        }else{
            res.json({mensagem: 'Aluno não encontrado.'})
        }

    }catch(erro){
        res.json({mensagem: 'Erro na busca :('})
        console.log(erro)
    }
});

//rota GET para perquisas por id
alunoRoute.get('/aluno/id=:id', async(req, res) => {
    try{
        resultado = await aluno.findOne({"_id": req.params.id})
        if(resultado != null){ //verifica se existe e então retorna
            res.json(resultado)
        }else{
            res.json({mensagem: 'Aluno não encontrado.'})
        }

    }catch(erro){
        res.json({mensagem: 'Erro na busca :('})
        console.log(erro)
    }
});

//rota PUT - inserir nova foto
alunoRoute.put('/aluno/update/id=:id/foto=:foto', async(req, res) => {
    try{
        //recupera informações
        const id = req.params.id
        const nova_foto = req.params.foto

        //verifica informações
        if(id == undefined || id === "" || nova_foto == undefined || nova_foto === ""){
            res.json({mensagem: "Os campos não foram preenchidos"})
        }else{
            await aluno.findOneAndUpdate({"_id": id}, { $set: { foto: nova_foto }}, {new:true})
            res.json({mensagem: "Foto atualizada com sucesso!"})
        }
    }catch(erro){
        res.json({mensagem: "Erro na atualização"})
    }
});


//rota que retorna todos os alunos (só pra teste)
alunoRoute.get('/alunos', async(req, res) => {
    try{
        const resultado = await aluno.find({}) //SELECT * FROM aluno
        res.json(resultado);

    }catch(erro){
        res.json({mensagem: "Erro na busca :("})
    }
});

//DELETE - Remove um aluno específico pelo id (só pra teste)
alunoRoute.delete('/delete-aluno/id=:id', async (req, res) => {
    try {
        if(await aluno.findOne({"_id": req.params.id})!=null){
            await aluno.deleteOne({"_id": req.params.id});
            res.json({mensagem: 'Aluno removido com sucesso!'});
          }else{
            res.json({mensagem: 'Erro ao remover! Aluno não existe!'});
          } 
    } catch (error) {
        res.json({mensagem: 'Erro na exclusão!'});
    }
});

module.exports = alunoRoute;