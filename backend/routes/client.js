const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { checkClientAuth } = require('../middleware/auth');

// Route for client page
router.get('/', checkClientAuth, (req, res) => {
    const query = `
        SELECT a.*, u.nom, u.email 
        FROM artisans a 
        JOIN utilisateurs u ON a.utilisateur_id = u.id
        WHERE u.rôle = 'artisan'
    `;
    
    db.query(query, (err, artisans) => {
        if (err) {
            console.error('Error fetching artisans:', err);
            return res.render('client/index', { 
                title: 'TN M3allim - Client',
                artisans: [] // Provide empty array as fallback
            });
        }

        const formattedArtisans = artisans.map(artisan => ({
            id: artisan.id,
            nom: artisan.nom,
            spécialité: artisan.spécialité,
            localisation: artisan.localisation,
            rating: artisan.rating || 0,
            disponibilité: artisan.disponibilité || false,
            expérience: artisan.expérience
        }));

        res.render('client/index', { 
            title: 'TN M3allim - Client',
            artisans: formattedArtisans // Pass formatted artisans to the template
        });
    });
});

module.exports = router;