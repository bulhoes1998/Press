const express = require("express");
const router = express.Router();
const User = require("./User");
const bcrypt = require("bcryptjs");
const Category = require("../categories/Category");

router.get("/admin/users", (req, res) => {
    User.findAll({attributes: ["id", "email"]}).then(users => {
        res.render("admin/users/index", {users: users});
    })
});

router.get("/admin/users/create", (req, res) => {
    res.render("admin/users/create")
})

router.post("/admin/user/create", (req, res) => {
    var email = req.body.email;
    var pass = req.body.senha;

    User.findOne({where: {email: email}}).then(user =>{
        if(user == undefined){

            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(pass, salt);
        
            User.create({
                email: email,
                password: hash
            }).then(() => {
                res.redirect("/");
            }).catch(error => {
                res.redirect("/");
            });

        }else{res.redirect("/admin/users/create")}
    })
});

router.get("/login", (req, res) => {
    Category.findAll().then(categories => {
        res.render("admin/users/login", {categories:categories});
    })
})

router.post("/authenticate", (req, res) => {
    var email = req.body.email;
    var pass = req.body.senha;

    User.findOne({where: {email: email}}).then(user => {
        if(user != undefined){
            var correct = bcrypt.compareSync(pass, user.password)
            if(correct){
                req.session.user = {
                    id: user.id,
                    email: user.email
                }
                res.redirect("/admin/articles")
            }else{
                res.redirect("/login");
            }
        }else{
            res.redirect("/login")
        }
    }).catch(error => res.redirect("/"))
});

router.get("/logout", (req, res) => {
    req.session.user = undefined;
    res.redirect("/")
})


module.exports = router;