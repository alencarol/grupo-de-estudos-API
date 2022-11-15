const grupoRoute = require('express').Router()
const { json } = require('express');
const express = require('express');
const { $where } = require('../model/grupoModel');
const grupo = require('../model/grupoModel')


//rota POST para cadastro de grupo de estudo no banco
grupoRoute.post('/grupo/cadastro/nome=:nome/meta=:meta/desc=:desc/data=:data/membro=:membro', async(req, res) => {
    try{
        //recuperando informações
        const nome = req.params.nome
        const meta = req.params.meta
        const descricao = req.params.desc
        const data_encontros = req.params.data
        const membro = req.params.membro

        //verificando informações
        if(nome == undefined || meta == undefined || descricao == undefined || data_encontros == undefined || membro == undefined || nome === "" || meta === "" || descricao === "" || data_encontros === "" || membro === ""){
            res.json({mensagem: 'Erro: Há campos sem preenchimento'})

        }else{
            //verificadno se já existe um grupo de estudo com esse nome
            if(await grupo.findOne({nome}) != null){
                res.json({mensagem: "Erro: grupo já cadastrado"})

            }else{
                await grupo.create({
                    nome,
                    meta,
                    descricao,
                    data_encontros
                });

                await grupo.findOneAndUpdate({"nome": nome}, {$push:{membros:membro}}, {new:true})

                res.json({mensagem: "Grupo criado com sucesso :D"})
            }
        }

    }catch(erro){
        res.json({mensagem: "Erro na criação do grupo :( "})
    }
});

//rota PUT para inserir novos membros no grupo
grupoRoute.put('/grupo/update/id=:id/membro=:membro', async(req, res) => {
    try{
        //recupera o nome do aluno e do grupo
        const id = req.params.id
        const membro = req.params.membro

        //verifica as informações
        if(id == undefined || id === '' || membro == undefined || membro === ""){
            res.json({mensagem: "Erro: o campo não foi preenchido"})

        }else{
            //verifica se o aluno já foi inserido no grupo
            if(await grupo.findOne({ $and: [{"_id": {$ne: id}}, {"membros": { $in: [ membro ] }}] })){ 
                res.json({mensagem: "Erro: O aluno já faz parte do grupo "})

            }else{
                await grupo.findOneAndUpdate({"_id": id}, {$push:{membros:membro}}, {new:true})
                res.json("Aluno inserido no grupo :D")
            }
        }
        

    }catch(erro){
        res.json({mensagem: "Erro no cadastro no aluno no grupo"})
    }
});

///rota GET que retorna todos os grupos
grupoRoute.get('/grupos-de-estudos', async(req, res) => {
    try{
        const resultado = await grupo.find({})
        res.json(resultado)

    }catch(erro){
        res.json({mensagem: "Erro na consulta dos grupos de estudos :'( "})
        console.log(erro)
    }
});

//GET - pesquisar por informações de um grupo ()
grupoRoute.get('/grupo/id=:id', async (req, res) => {
    try{
        id = req.params.id

        //verificando id
        if(id == undefined || id === ""){
            res.json({mensagem: "Eroo: O ID do grupo não foi inserido!"})

        }else{
            const resultado = await grupo.find({"_id": id})
            res.json(resultado)
        }

    }catch(erro){
        res.json({mensagem: "Erro na consulta :("})
    }
});

//GET - consultar grupos de um aluno
grupoRoute.get('/grupo/id_aluno=:id_aluno', async(req, res) => {
    try{

        const id_aluno = req.params.id_aluno

        //verificando informações
        if(id_aluno == undefined || id_aluno === ""){
            res.json({mensagem: "Erro: alguns parêmetros não foram preenchidos :| "})

        }else{
            //const resultado = await grupo.find({"_id": id_grupo}, {"membros": id_aluno})
            const resultado = await grupo.find({ "membros": { $in: [ id_aluno ] } })
            
            res.json(resultado)
        }
    }catch(erro){
        res.json({mensagem: "Erro na consulta :'( "})
    }
});

//rota PUT - inserir material de estudo
grupoRoute.put('/grupo/update/id=:id/material=:material', async(req, res) => {
    try{
        //recupera informações
        const id = req.params.id
        const material_estudo = req.params.material

        //verifica informações
        if(id == undefined || id === "" || material_estudo == undefined || material_estudo === ""){
            res.json({mensagem: "Os campos não foram preenchidos"})
        }else{
            await grupo.findOneAndUpdate({"_id": id}, { $set: { material: material_estudo }}, {new:true})
            res.json({mensagem: "Material de estudo inserido com sucesso!"})
        }
    }catch(erro){
        res.json({mensagem: "Erro na atualização"})
    }
});

module.exports = grupoRoute;