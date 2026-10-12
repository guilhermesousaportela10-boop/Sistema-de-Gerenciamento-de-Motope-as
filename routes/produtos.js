const express = require('express')
const router = express.Router()
const conexao = require('../db')
const fs = require('fs')

// Rota principal 
router.get ('/', (req, res) => {
    // SQL 
    let sql = 'SELECT * FROM produtos'

    // Executar comando SQL
    conexao.query (sql, (erro, retorno) => {
        res.render('formulario', {produtos:retorno})
    })
})

router.get('/okCadastro', (req, res) => {
    res.redirect('/')
})

router.get('/falhaCadastro', (req, res) => {
    res.redirect('/')
})

// Rotas para cadastro 
router.post('/cadastrar', (req, res) => {
    try {
        let nome = req.body.nome
        let valor = req.body.valor
        let estoque = req.body.estoque
        let imagem = req.files.imagem.name

        if (nome == '' || valor == '' || estoque == '' || isNaN(valor)) {
            return res.redirect('/falhaCadastro')
        }

        let sql = `INSERT INTO produtos (nome, valor, estoque, imagem) VALUES ('${nome}', ${valor}, ${estoque}, '${imagem}')`

        conexao.query(sql, (erro, retorno) => {
            if (erro) {
                console.log('Erro no SQL:', erro)   
                return res.redirect('/falhaCadastro')
            }
            req.files.imagem.mv(__dirname + '/imagens/' + req.files.imagem.name)
            res.redirect('/okCadastro')
        })

    } catch (erro) {
        console.log(erro)
        res.redirect('/falhaCadastro')
    }
})

// Rota para remover produtos
router.get('/remover/:codigo&:imagem', (req, res) => {
    // SQL
    let sql = `DELETE FROM produtos WHERE codigo = ${req.params.codigo}`

    // Executar o comando SQL
    conexao.query(sql, (erro, retorno) => {
        // Caso falhe o comando SQL
        if (erro) throw erro

        // Caso o comando SQL funcione, remove a imagem também
        fs.unlink(__dirname + "/imagens/" + req.params.imagem, (erro_imagem) => {
            if (erro_imagem) console.log('Falha ao remover a imagem')
        })

        // Redirecionamento de volta pra página principal
        res.redirect('/')
    })
})

router.get('/okEdicao', (req, res) => {
    res.redirect('/?status=ok&msg=Produto cadastrado com sucesso')
})

router.get('/falhaEdicao', (req, res) => {
    res.redirect('/?status=erro&msg=Falha ao cadastrar produto')
})

// Rota para editar produto 
router.post('/editar', (req, res) => {
    try {
        let codigo = req.body.codigo
        let nome = req.body.nome
        let valor = req.body.valor
        let estoque = req.body.estoque
        let nomeImagemAntiga = req.body.nomeImagem

        if (nome == '' || valor == '' || estoque == '' || isNaN(valor)) {
            return res.redirect('/falhaEdicao')
        }

        // Se o usuário mandou uma imagem nova, troca; senão mantém a antiga
        let nomeImagemNova = req.files && req.files.imagem
            ? req.files.imagem.name
            : nomeImagemAntiga

        let sql = 'UPDATE produtos SET nome = ?, valor = ?, estoque = ?, imagem = ? WHERE codigo = ?'

        conexao.query(sql, [nome, valor, estoque, nomeImagemNova, codigo], (erro, retorno) => {
            if (erro) {
                console.log('Erro no SQL:', erro)
                return res.redirect('/falhaEdicao')
            }

            // Se trocou a imagem, salva a nova e remove a antiga
            if (req.files && req.files.imagem) {
                req.files.imagem.mv(__dirname + '/imagens/' + req.files.imagem.name)

                fs.unlink(__dirname + '/imagens/' + nomeImagemAntiga, (erro_imagem) => {
                    if (erro_imagem) console.log('Falha ao remover a imagem antiga')
                })
            }

            res.redirect('/okEdicao')
        })

    } catch (erro) {
        console.log(erro)
        res.redirect('/falhaEdicao')
    }
})

router.get('/produto/:codigo', (req, res) => {
    let sql = 'SELECT * FROM produtos WHERE codigo = ?'

    conexao.query(sql, [req.params.codigo], (erro, retorno) => {
        if (erro || retorno.length == 0) {
            return res.status(404).json({ erro: 'Produto não encontrado' })
        }
        res.json(retorno[0])
    })
})

module.exports = router