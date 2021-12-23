const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require("express-session");
const connection = require('./database/database');

// import Routes
const categories = require("./categories/CategoriesController");
const articles = require("./articles/ArticlesController");
const users = require("./user/UserController");

const Category = require("./categories/Category")
const Article = require("./articles/Article");
const User = require("./user/User")
// body-parser
app.use(bodyParser.urlencoded({ extended:false }))
app.use(bodyParser.json());


// Sessions
app.use(session({
    secret: "qualquercoisa",
    cookie: {maxAge: 30000000}
}))

// view engine
app.set('view engine', 'ejs');

// static
app.use(express.static("public"));

connection.authenticate().then(() => {
    console.log("Database connection ok");
}).catch((error) => {
    console.log(error);
});

// Routes
app.use("/", categories);
app.use("/", articles);
app.use("/", users);

app.get("/session", (req, res) => {
    req.session.email = "contato@lbulhoes.dev";
    res.send("Sessão gerada");
});

app.get("/read", (req, res) => {
    res.json({
        user: req.session.user
    })
})


app.get("/", (req, res) => {
    Article.findAll({
        order: [
            ["id", "DESC"]
        ],
        limit: 5
    }).then(articles => {
        Category.findAll().then(categories =>{
            res.render("index", {articles: articles, categories: categories});
        })
    })
})

app.get("/:slug", (req, res) => {
    var slug = req.params.slug;
    Article.findOne({
        where: {
            slug: slug
        }
    }).then(article => {
        if(article != undefined){
            Category.findAll().then(categories =>{
                res.render("article", {article: article, categories: categories});
            })
        }else{
            res.redirect("/");
        }
    }).catch(error => {
        res.redirect("/")
    })
});

app.get("/category/:slug", (req, res) => {
    var slug = req.params.slug;
    Category.findOne({
        where: {
            slug: slug
        },
        include: [{model: Article}]
    }).then(category => {
        if(category != undefined){
            Category.findAll().then(categories => {
                res.render("index", {articles: category.articles, categories: categories})
            })
        }else{
            res.redirect("/")
        }
    }).catch(error => {
        res.redirect("/")
    })
})




app.listen(4000, () => {
    console.log("Server On");
});
