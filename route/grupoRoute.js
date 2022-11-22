const grupoRoute = require('express').Router()
const { json } = require('express');
const express = require('express');
const { $where } = require('../model/grupoModel');
const jwt = require('jsonwebtoken');
const grupo = require('../model/grupoModel')

//função que verifica o token pelo body
const verificarJWT = (req, res, next) => {
    const token = req.body.token;
    if (!token) {
        res.json({logado: false, mensagem: 'Token não foi enviado.'});
    }else{
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            res.json({locado: false, mensagem: 'Falha na autenticação'});
        }
        next();
    });
    }
   
}

//função que verifica o token pelo header
function verificarJWTHeader(req, res, next){
    const token = req.headers['x-access-token'];
    if (!token) {
        res.json({ logado: false, mensagem: 'Token não foi enviado.' });
    }else{
    jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
        if (err) {
        res.json({ logado: false, mensagem: 'Falha na autenticação' });
        }
            
        next();
    });

    }
    

  }


//rota POST para cadastro de grupo de estudo no banco
grupoRoute.post('/grupo/cadastro', verificarJWT, async(req, res) => {
    try{
        //recuperando informações

        const{nome, meta, descricao, data_encontros, material, membro, token} = req.body

        //verificando informações
        if(nome == undefined || meta == undefined || descricao == undefined || data_encontros == undefined || 
           material == undefined || membro == undefined || nome === "" || meta === "" || descricao === "" || 
           data_encontros === "" || material==="" || membro === ""){
            res.json({mensagem: 'Erro! Alguns campos não foram definidos!'})

        }else{
            //verificando se já existe um grupo de estudo com esse nome
            if(await grupo.findOne({nome}) != null){
                res.json({mensagem: "Erro! Nome de grupo já cadastrado!"})

            }else{
                await grupo.create({
                    nome,
                    meta,
                    descricao,
                    data_encontros,
                    material,
                    membro
                });

                await grupo.findOneAndUpdate({"nome": nome}, {$push:{membros:membro}}, {new:true})

                res.json({mensagem: "Grupo criado com sucesso :D"})
            }
        }

    }catch(erro){
        res.json({mensagem: "Erro na criação do grupo :( "})
    }
});


///rota GET que retorna todos os grupos
grupoRoute.get('/grupos-de-estudos',verificarJWTHeader, async(req, res) => {
    try{
        const resultado = await grupo.find({})
        res.json(resultado)

    }catch(erro){
        res.json({mensagem: "Erro na consulta dos grupos de estudos :'( "})
        console.log(erro)
    }
});



//rota PUT para inserir novos membros no grupo
grupoRoute.put('/grupo/update-membro/id=:id', verificarJWT, async(req, res) => {

    try {
        //recupera informações
        const {membro, token} = req.body

        //verifica informações
        if(await grupo.findOneAndUpdate({"_id": req.params.id}, {$push:{membros:membro}}, {new:true}))
            res.json({mensagem: 'Aluno inserido no grupo :D', membro: membro })
    } catch (error) {
        res.json({mensagem: 'Erro na inserção do aluno!'});
    }
});

//rota PUT para remover membro do grupo
grupoRoute.put('/grupo/remove-membro/id=:id', verificarJWT, async(req, res) => {

    try {
        //recupera informações
        const {membros, token} = req.body

        //verifica informações
        if(await grupo.findOneAndUpdate({"_id": req.params.id}, req.body, {new:true}))
            res.json({mensagem: 'Aluno saiu do grupo :D', membros:membros})
    } catch (error) {
        res.json({mensagem: 'Erro na inserção do aluno!'});
    }
});


// rota DELETE - remove um grupo
grupoRoute.delete('/delete-grupo/id=:id', verificarJWTHeader, async (req, res) => {
    try {
        if(await grupo.findOne({"_id": req.params.id})!=null){
            await grupo.deleteOne({"_id": req.params.id});
            res.json({mensagem: 'Grupo removido com sucesso!'});
          }else{
            res.json({mensagem: 'Erro ao remover! Grupo não existe!'});
          } 
    } catch (error) {
        res.json({mensagem: 'Erro na exclusão!'});
    }
});



//////////////////////rotas desnecessárias/////////////////////////////////////////////////////////////////////




/* //rota PUT para inserir novos membros no grupo
grupoRoute.put('/grupo/update-membro/id=:id', async(req, res) => {
    try{
        //recupera o nome do aluno e do grupo
        const {membro} = req.body

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
}); */



module.exports = grupoRoute;