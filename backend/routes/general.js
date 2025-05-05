const express = require('express');
const router = express.Router();

// Route principale (using Handlebars)
router.get('/', (req, res) => {
    res.render('index', { 
        title: 'صانع تونسي - Accueil',
        user: req.session && req.session.userId ? {
            id: req.session.userId,
            role: req.session.userRole,
            name: req.session.userName
        } : null
    });
});

// Route for "How it works" page
router.get('/comment_utiliser', (req, res) => {
    res.render('comment_utiliser/index', { 
        title: 'كيف يعمل؟ - صانع تونسي',
        user: req.session.userId ? {
            id: req.session.userId,
            role: req.session.userRole,
            name: req.session.userName
        } : null
    });
});

// Route for services page
router.get('/services', (req, res) => {
    res.render('services/index', { 
        title: 'خدماتنا - صانع تونسي',
        user: req.session.userId ? {
            id: req.session.userId,
            role: req.session.userRole,
            name: req.session.userName
        } : null
    });
});

// Route for artisan list
router.get('/listartisan', (req, res) => {
    res.render('artisan-list/index', {
        title: 'قائمة الحرفيين - صانع تونسي',
        user: req.session.userId ? {
            id: req.session.userId,
            role: req.session.userRole,
            name: req.session.userName
        } : null
    });
});

router.get('/lireplus', (req, res) => {
    res.render('lireplus/index', { 
        title: 'مهمتنا - صانع تونسي',
        user: req.session.userId ? {
            id: req.session.userId,
            role: req.session.userRole,
            name: req.session.userName
        } : null
    });
});

router.get('/viewport', (req, res) => {
    res.render('viewport/index', { 
        title: 'تبحث عن حرفي؟ - صانع تونسي',
        user: req.session.userId ? {
            id: req.session.userId,
            role: req.session.userRole,
            name: req.session.userName
        } : null
    });
});
// Add privacy policy route
router.get('/confidentialite', (req, res) => {
    res.render('confidentialite/index', {
        title: 'الشروط والأحكام - صانع تونسي',
        user: req.session.userId ? {
            id: req.session.userId,
            role: req.session.userRole,
            name: req.session.userName
        } : null
    });
});
// Add privacy policy route
router.get('/conditions', (req, res) => {
    res.render('conditions/index', {
        title: 'سياسة الخصوصية - صانع تونسي',
        user: req.session.userId ? {
            id: req.session.userId,
            role: req.session.userRole,
            name: req.session.userName
        } : null
    });
});
module.exports = router;