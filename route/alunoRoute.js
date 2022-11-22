const alunoRoute = require('express').Router();
const express = require('express');
const aluno = require('../model/alunoModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs')

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


//rota POST para cadastrar o aluno
alunoRoute.post('/aluno/cadastro/', async(req, res) => {
    try{
        //recuperando informações do body
        const {nome,email,senha,foto} = req.body
        const senhac = await bcrypt.hash(senha, 10)

        //verificando campos
        if(nome === undefined || email === undefined|| senha == undefined|| nome === "" || email === ""|| senha == ""){
            res.json({mensagem: 'Erro! Alguns campos não foram definidos!'});  
        }else{

            if(await aluno.findOne({email})!=null){ //verifica se o email já existe no banco
                res.json({mensagem: 'Erro! Email já cadastrado!'}); 
            }else{
                //se o email não existir no banco, o cadastro é feito
                await aluno.create({
                    nome,
                    email,
                    senha: senhac,
                    foto
                });

                res.json({mensagem: 'Aluno cadastrado com sucesso :)'})
            }
        }

    }catch(erro){
        res.json({mensagem: 'Erro no cadastro do aluno :('})
        console.log(erro)
    }
});



//rota POST para validar o login do aluno
alunoRoute.post("/aluno/login", async (req, res) => {
    const {email, senha} = req.body;
  
    const user = await aluno.findOne({ email });

    if (!user) { //verifica usuário
      return res.json({ error: "Usuário não encontrado!" });
    }
    if (await bcrypt.compare(senha, user.senha)) { //compara as senhas 
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {expiresIn: 864000});
  
      if (res.status(201)) {
        const body = {
            id: user._id,
            nome:user.nome, 
            email: user.email, 
            foto: user.foto
        }

        return res.json({ status: "ok", data: token, body: body});
    
      } else {
        return res.json({ error: "error" });
      }
    }
    res.json({ status: "error", error: "Senha inválida!" });
  });


//rota PUT - atualizar ou deletar foto
alunoRoute.put('/aluno/update-photo/id=:id', verificarJWT, async (req, res) => {
    try {
        //recupera informações
        const {foto, token} = req.body

        //verifica informações
        if (await aluno.findOneAndUpdate({"_id": req.params.id}, req.body, {new:true}))
            res.json({mensagem: 'Foto atualizada com sucesso!', foto: foto});
    } catch (error) {
        res.json({mensagem: 'Erro na atualização!'});
    }
});


//rota PUT - atualizar senha
alunoRoute.put('/aluno/update-password/', async (req, res) => {
    try {
        //recupera informações
        const {email, senha} = req.body
        const senhac = await bcrypt.hash(senha, 10)

        //verifica informações
        if (await aluno.findOneAndUpdate({"email": email}, {"senha": senhac}, {new:true}))
            res.json({mensagem: 'Senha atualizada com sucesso!'})
        else{
            res.json({mensagem: 'Falha ao atualizar senha! Email não encontrado!'})
        }
    } catch (error) {
        res.json({mensagem: 'Erro na atualização!'});
    }
});


/* // rota DELETE - remove o aluno, ou seja a conta
alunoRoute.delete('/aluno/delete/id=:id', verificarJWT, async (req, res) => {
    try {
        const {token} = req.body

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


// rota DELETE - remove o aluno, ou seja a conta (TESTES)
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
}); */



module.exports = alunoRoute;