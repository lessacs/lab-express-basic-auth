const express = require('express')
const User = require('../models/User.model')
const router = express.Router()
const bcrypt = require('bcrypt')


router.get('/signup', async (req, res, next) => {
    res.render('auth/signup')
})

router.post('/signup', async (req, res, next) => {
    const { username, password } = req.body
    console.log({ username, password })
    try {
        if (!username || !password) {
            return res.render('auth/signup', {
                errorMessage: 'Fill out all the fields'
            })
        }
    


    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    const userToCreate = {
        username,
        password: hashedPassword,
    }
    const userFromDb = await User.create(userToCreate)
    console.log(userFromDb)
    res.redirect('/login'
    )
} catch (error) {
    next(error)
}
})

router.get('/login', async (req, res, next) => {
    res.render('auth/login')
})

router.post('/login', async (req, res, next) => {
    const { username, password } = req.body
    try {
        if (!username || !password) {
            return res.render('auth/login', {
                errorMessage: 'please fill out all fields',
            })
        }
    
    const foundUser = await User.findOne(
        { username },
        { password: 1, username: 1 }
    )
    if (!foundUser) {
        return res.render('auth/login', {
            errorMessage: 'Sign up first'
        })
    }
    const matchingPass = await bcrypt.compare(password, foundUser.password)
    if (!matchingPass) {
        return res.render('auth/login', {
            errorMessage: 'invalid credentials'
        })
    }

    req.session.currentUser = foundUser
    res.redirect('/profiles')
} catch (error) {
    next(error)
}
})

router.get('/logout', (req, res, next) => {
    req.session.destroy((error) => {
        if (error) {
            return next(error)
        }
        res.redirect('/login')
    })
})

module.exports = router

