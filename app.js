// Importar o express
const express = require('express')

// importar o fileupload
const fileUpload = require('express-fileupload')

// importar o handlebars
const { engine } = require("express-handlebars")

// App 
const app = express()

// Produtos
const produtos = require('./routes/produtos')

// Habilitando o upload de arquivos
app.use(fileUpload())

// Adicionar Boostrap
app.use('/bootstrap', express.static('./node_modules/bootstrap/dist'))

// Adicionar CSS
app.use('/css', express.static('./css'))

// referenciar a pasta de imagens
app.use('/imagens', express.static('./imagens'))

// Configuração do express-handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

// Manipulação de dados via rotas
app.use(express.json())
app.use(express.urlencoded({extended:false}))

// Rotas
app.use('/', produtos)

app.listen(8080, () => {
    console.log('Servidor rodando!')
})