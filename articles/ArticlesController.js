const express = require("express");
const router = express.Router();
const Article = require("./Article")
const Category = require("../categories/Category")
const slugify = require("slugify");
const User = require("../user/User");
const adminAuth = require("../middlewares/adminAuth");

router.get("/admin/articles/new", adminAuth, (req, res) => {
    Category.findAll().then(categories => {
        res.render("admin/articles/new", {categories: categories});
    });
});

router.get("/admin/articles", adminAuth, (req, res) => {
    Article.findAll({
        include: [{model: Category}]
    }).then(articles => {
            res.render("admin/articles/index", {articles: articles});
    });
});

router.post("/admin/articles/delete", adminAuth, (req, res) => {
    var id = req.body.id;
    if(id != undefined){
        if(!isNaN(id)){
            Article.destroy({
                where: {
                    id: id
                }
            }).then(() => {
                res.redirect("/admin/articles")
            })
        }else{
            res.redirect("/admin/articles")
        }
    }else{
        res.redirect("/admin/articles")
    }
});

router.post("/admin/articles/save", adminAuth, (req, res) => {
    var title = req.body.title;
    var body = req.body.body;
    var category = req.body.category;
    var descricao = req.body.descricao;
    var img = req.body.img;
    if(body != null){
    Article.create({
        title: title,
        slug: slugify(title),
        body: body,
        img: img,
        descricao: descricao,
        categoryId: category
    }).then(() => {
        res.redirect("/admin/articles");
    });
}else{
    res.redirect("admin/articles/new")
}
});

router.get("/admin/articles/edit/:id", adminAuth, (req, res) => {
    var id = req.params.id;
    if(isNaN(id)){
        res.redirect("/admin/articles")
    }
    Article.findByPk(id).then(article => {
        Category.findAll().then(categories => {
            if(article != undefined){
                res.render("admin/articles/edit", {article: article, categories: categories});
            }else{
                res.redirect("/admin/articles")
            }
        }).catch(error => {res.redirect("/admin/articles")})
    }).catch(error => {res.redirect("/admin/articles")});
});

router.post("/admin/articles/update", adminAuth, (req, res) => {
    var id = req.body.id;
    var title = req.body.title;
    var body = req.body.body
    var img = req.body.img;
    var descricao = req.body.descricao;
    var category = req.body.category;
    console.log(id);
    Article.update({title: title, slug: slugify(title), body: body, img: img, descricao: descricao, categoryId: category}, {
        where: {
            id: id
        }
    }).then(() => {
        console.log("ok")
        res.redirect("/admin/articles")
    }).catch(error => res.redirect("/admin/articles"))
})

router.get("/articles/page/:num", (req, res) => {
    var page = req.params.num;
    var offset = 0;
    if(!isNaN(page)){
        offset = (parseInt(page) -1)*(5)
    }
    Article.findAndCountAll({
        limit: 5,
        offset: offset
    }).then(articles => {

        var next;
        if(offset + 5 >= articles.count){
            next = false;
        }else{
            next = true;
        }

        var result = {
            page: parseInt(page),
            next: next,
            articles: articles
        }

        Category.findAll().then(categories => {
            res.render("page", {result: result, categories: categories})
        })

    })
});


module.exports = router;