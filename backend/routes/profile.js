const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const db = require('../config/database');
const upload = require('../config/upload');
const { checkAuth, checkArtisanAuth } = require('../middleware/auth');

// Route pour la page profile
router.get('/', checkArtisanAuth,checkAuth, (req, res) => {
    res.render('profile/index', {
        title: 'الملف الشخصي- TN M3allim',
        user: req.session.userId ? {
            id: req.session.userId,
            role: req.session.userRole,
            name: req.session.userName
        } : null
    });
});

// Get user profile data
router.get('/data', checkAuth, (req, res) => {
    const userId = req.session.userId;
    const userRole = req.session.userRole;
    
    // Get user profile data
    const userQuery = `
        SELECT u.id, u.nom as name, u.email, u.telephone as phone, u.adresse as address,
               u.gouvernorat as governorate, u.ville as city, u.code_postal as postal_code,
               u.photo_profile
        FROM utilisateurs u
        WHERE u.id = ?
    `;
    
    db.query(userQuery, [userId], (err, userResults) => {
        if (err) {
            console.error('Error fetching user data:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (userResults.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const userProfile = userResults[0];
        
        // If user is an artisan, get artisan-specific data
        if (userRole === 'artisan') {
            const artisanQuery = `
                SELECT a.id, a.spécialité as profession, a.expérience as experience, 
                       a.tarif_horaire as hourly_rate, a.description
                FROM artisans a
                WHERE a.utilisateur_id = ?
            `;
            
            db.query(artisanQuery, [userId], (err, artisanResults) => {
                if (err) {
                    console.error('Error fetching artisan data:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                
                // Combine user and artisan data
                const profileData = {
                    ...userProfile,
                    artisan: artisanResults.length > 0 ? artisanResults[0] : null
                };
                
                res.json(profileData);
            });
        } else {
            // Return just user data for non-artisans
            res.json(userProfile);
        }
    });
});

// Profile update route - handle form submission
router.post('/update-profile', checkAuth, upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'galleryImages', maxCount: 10 }
]), async (req, res) => {
    const userId = req.session.userId;
    const userRole = req.session.userRole;
    
    try {
        // Get form data
        const { 
            fullname, phone, address, governorate, city, postalCode,
            currentPassword, newPassword,
            profession, experience, hourlyRate, description
        } = req.body;
        
        // Update basic user information without using transactions
        const updateUserQuery = `
            UPDATE utilisateurs 
            SET nom = ?, telephone = ?, adresse = ?, gouvernorat = ?, ville = ?, code_postal = ?
            WHERE id = ?
        `;
        
        db.query(
            updateUserQuery,
            [fullname, phone, address, governorate, city, postalCode, userId],
            async (err, result) => {
                if (err) {
                    console.error('Error updating user data:', err);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Error updating user data: ' + err.message
                    });
                }
                
                // Handle password change if requested
                if (currentPassword && newPassword) {
                    try {
                        // Verify current password
                        const userQuery = 'SELECT mot_de_passe FROM utilisateurs WHERE id = ?';
                        db.query(userQuery, [userId], async (err, userResults) => {
                            if (err) {
                                console.error('Error fetching user password:', err);
                                return res.status(500).json({ 
                                    success: false, 
                                    message: 'Error verifying password'
                                });
                            }
                            
                            if (userResults.length === 0) {
                                return res.status(404).json({
                                    success: false,
                                    message: 'User not found'
                                });
                            }
                            
                            const isPasswordValid = await bcrypt.compare(currentPassword, userResults[0].mot_de_passe);
                            
                            if (!isPasswordValid) {
                                return res.status(400).json({
                                    success: false,
                                    message: 'Current password is incorrect'
                                });
                            }
                            
                            // Hash new password
                            const hashedPassword = await bcrypt.hash(newPassword, 10);
                            
                            // Update password
                            const updatePasswordQuery = 'UPDATE utilisateurs SET mot_de_passe = ? WHERE id = ?';
                            db.query(updatePasswordQuery, [hashedPassword, userId], (err, result) => {
                                if (err) {
                                    console.error('Error updating password:', err);
                                }
                            });
                        });
                    } catch (error) {
                        console.error('Password update error:', error);
                    }
                }
                
                // Handle profile photo
                if (req.files && req.files.profilePhoto) {
                    const profilePhoto = req.files.profilePhoto[0];
                    
                    // Update user photo in database
                    const updatePhotoQuery = 'UPDATE utilisateurs SET photo_profile = ? WHERE id = ?';
                    db.query(updatePhotoQuery, [profilePhoto.buffer, userId], (err, result) => {
                        if (err) {
                            console.error('Error updating profile photo:', err);
                        }
                    });
                }
                
                // Update artisan-specific information if user is an artisan
                if (userRole === 'artisan') {
                    const checkArtisanQuery = 'SELECT id FROM artisans WHERE utilisateur_id = ?';
                    db.query(checkArtisanQuery, [userId], (err, artisanResults) => {
                        if (err) {
                            console.error('Error checking artisan profile:', err);
                            return;
                        }
                        
                        if (artisanResults && artisanResults.length > 0) {
                            // Update existing artisan profile
                            const updateArtisanQuery = `
                                UPDATE artisans 
                                SET spécialité = ?, expérience = ?, localisation = ?
                                WHERE utilisateur_id = ?
                            `;
                            
                            db.query(
                                updateArtisanQuery,
                                [profession, experience, address, userId],
                                (err, result) => {
                                    if (err) {
                                        console.error('Error updating artisan profile:', err);
                                    }
                                }
                            );
                        } else {
                            // Create new artisan profile
                            const createArtisanQuery = `
                                INSERT INTO artisans (utilisateur_id, spécialité, expérience, localisation)
                                VALUES (?, ?, ?, ?)
                            `;
                            
                            db.query(
                                createArtisanQuery,
                                [userId, profession, experience, address],
                                (err, result) => {
                                    if (err) {
                                        console.error('Error creating artisan profile:', err);
                                    }
                                }
                            );
                        }
                    });
                }
                
                // Update session name if it changed
                if (fullname && fullname !== req.session.userName) {
                    req.session.userName = fullname;
                }
                
                res.json({ success: true, message: 'تم تحديث الملف الشخصي بنجاح' });
            }
        );
        
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'حدث خطأ أثناء تحديث الملف الشخصي'
        });
    }
});


module.exports = router;