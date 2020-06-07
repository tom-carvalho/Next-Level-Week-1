const express = require("express")
const server = express()

// pegar banco de dados
const db = require("./database/db")

// configaração pasta public
server.use(express.static("public"))

// habilitar o uso do req.body na aplicação
server.use(express.urlencoded({ extended: true }))

// utilizando o template engine
const nunjucks = require("nunjucks")
nunjucks.configure("src/views", {
    express: server,
    noCache: true
})


// caminhos da aplicação
// página home
server.get("/", (req, res) => {
   return res.render("index.html")
})

// página de cadastro do ponto de coleta
server.get("/create-point", (req, res) => {
    
    return res.render("create-point.html")
})

server.post("/savepoint", (req, res) => {
    // re.query: Query strings da nossa url
    // console.log(req.body)

    // inserir dados no banco
    const query = `
    INSERT INTO places (
        image,
        name,
        address,
        address2,
        state,
        city,
        items
    ) VALUES (?, ?, ?, ?, ?, ?, ?);
`
    const values = [
        req.body.image,
        req.body.name,
        req.body.address,
        req.body.address2,
        req.body.state,
        req.body.city,
        req.body.items
    ]

    function afterInsertData(err) {
        if(err) {
            console.log(err)
            return res.send("Erro no cadastro!")
        }
        console.log("Cadastrado com sucesso")
        console.log(this)

        return res.render("create-point.html", {saved: true})
    }

    // essa linha insere os dados na tabela
    db.run(query, values, afterInsertData)  

})

// página de resultado
server.get("/search-results", (req, res) => {

    const search = req.query.search
    if(search == "") {
        // pesquisa vazia
        return res.render("search-results.html", { total: 0 })

    }

    // pegar dados do banco
db.all(`SELECT * FROM places WHERE city LIKE '%${search}%'`, function(err, rows) {
    if(err) {
        return console.log(err)
    }

    const total = rows.length

    //mostrar os dados do banco dentro da pagina html
    return res.render("search-results.html", { places: rows, total})
})

    
})

// rodar o servidor
server.listen(3000)

