const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); // ONLY ONCE
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

const app = express();

// --- 1. MIDDLEWARE CONFIGURATION ---

// Unified CORS: Allows both Localhost and your Live Domain
app.use(cors({
    origin: ['http://localhost:5173', 'https://deeppink-alligator-166788.hostingersite.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Increase Express body limits
app.use(express.json({ limit: '10GB' }));
app.use(express.urlencoded({ limit: '10GB', extended: true }));

// 1. FIRST: Define HOW to store files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// 2. SECOND: Create the upload instance using that storage
const upload = multer({
    storage: storage, // Now 'storage' is initialized and ready!
    limits: { fileSize: 10 * 1024 * 1024 * 1024 } // 10GB limit
});

// --- 2. NODEMAILER SETUP ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'bluestonesoftwaredeveloper@gmail.com',
        pass: 'iprv ewtc sidh msdj'
    },
    tls: { rejectUnauthorized: false }
});


// 2. Verify connection
transporter.verify((error, success) => {
    if (error) {
        console.log("Nodemailer Error:", error);
    } else {
        console.log("Mail Server is ready to notify Admin");
    }
});

// Serve the 'uploads' folder statically so videos can be played in the browser
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads folder exists
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}



// Change 'createConnection' to 'createPool'
const db = mysql.createPool({
    host: 'auth-db1278.hstgr.io',
    user: 'u287260207_upsc_user',
    password: 'becomeIAS@2k26',
    database: 'u287260207_upsc',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
});

// For Pools, we don't use db.connect(). 
// Instead, we just check the connection like this:
db.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed: ' + err.message);
    } else {
        console.log('Connected to MySQL Database via Pool.');

        // Dynamic table auto-creation for Study Materials
        const createMaterialsTableSql = `
            CREATE TABLE IF NOT EXISTS materials (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                course VARCHAR(100) NOT NULL,
                subject VARCHAR(100) NOT NULL,
                file_path VARCHAR(255) NOT NULL,
                description TEXT,
                is_active TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        connection.query(createMaterialsTableSql, (tableErr) => {
            if (tableErr) {
                console.error("Error creating 'materials' table:", tableErr);
            } else {
                console.log("Verified 'materials' table is ready in backend.");
            }
        });

        connection.release(); // Important: release the connection back to the pool
    }
});

app.post('/api/login', (req, res) => {
    const { username, password, role } = req.body;

    // We MUST fetch the 'status' and 'courses' columns now
    const sql = "SELECT id, username, role, status, courses FROM users WHERE username = ? AND password = ? AND role = ?";
    db.query(sql, [username, password, role], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Database Error" });

        if (results.length > 0) {
            const user = results[0];

            // If student is inactive, we send success: true but include the status
            // so the frontend can show the 'Locked' screen.
            res.json({
                success: true,
                user: {
                    username: user.username,
                    role: user.role,
                    status: user.status, // CRITICAL: Frontend needs this to lock the screen
                    courses: user.courses // Approved courses (comma-separated string)
                }
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid Email or Password" });
        }
    });
});


// Route to create a new student account
app.post('/api/users/register', (req, res) => {
    // 1. Extract the new fields from the request body
    const { username, password, role, fullName, phone, courses } = req.body;
    const status = 'inactive';
    const coursesValue = Array.isArray(courses) ? courses.join(',') : (courses || 'UPSC');

    // 2. Update SQL to include fullName, phone, and courses
    const sql = "INSERT INTO users (username, password, role, status, fullName, phone, courses) VALUES (?, ?, ?, ?, ?, ?, ?)";

    db.query(sql, [username, password, role, status, fullName, phone, coursesValue], (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        // --- NODEMAILER LOGIC START ---
        const mailOptions = {
            from: '"Bluestone IAS Portal" <bluestonesoftwaredeveloper@gmail.com>',
            to: 'bluestonesoftwaredeveloper@gmail.com',
            subject: '🚨 New Student Registration Alert',
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px;">
                    <h2 style="color: #1a3a5f; border-bottom: 2px solid #c5a059; padding-bottom: 10px;">New Enrollment Received</h2>
                    <p>A new student has registered and is waiting for approval.</p>
                    
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Name:</strong> ${fullName}</p>
                        <p style="margin: 5px 0;"><strong>Phone:</strong> ${phone}</p>
                        <p style="margin: 5px 0;"><strong>Email/ID:</strong> ${username}</p>
                        <p style="margin: 5px 0;"><strong>Role:</strong> ${role}</p>
                        <p style="margin: 5px 0;"><strong>Courses Requested:</strong> ${coursesValue}</p>
                        <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #e11d48; font-weight: bold;">INACTIVE (LOCKED)</span></p>
                    </div>

                    <p>Please log in to the Admin Portal to review and activate this account.</p>
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="https://bluestoneelitesports.com/admin/students" target="_blank" rel="noopener noreferrer"
                           style="background: #1a3a5f; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                           Open Admin Portal
                        </a>
                    </div>
                </div>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Email failed to send:", error);
            } else {
                console.log("Admin notified via email:", info.response);
            }
        });
        // --- NODEMAILER LOGIC END ---

        res.json({ success: true, message: "Registered! Admin has been notified for activation." });
    });
});

// 1. Fetch all students for Admin
app.get('/api/students', (req, res) => {
    // Include courses column here
    const sql = "SELECT id, username, fullName, phone, status, courses FROM users WHERE role = 'student'";

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results); // Send the full data to React
    });
});

// 2. Toggle Student Status
app.put('/api/students/:id/status', (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    db.query("UPDATE users SET status = ? WHERE id = ?", [status, id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true });
    });
});

app.put('/api/users/:id/status', (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    const sql = "UPDATE users SET status = ? WHERE id = ?";

    db.query(sql, [status, id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Database error" });
        }
        res.json({ success: true, message: "Status updated successfully" });
    });
});

// Delete user endpoint
app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM users WHERE id = ?", [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Database error" });
        }
        res.json({ success: true, message: "Student deleted successfully" });
    });
});

// Edit user details endpoint (with optional password reset)
app.put('/api/users/:id/details', (req, res) => {
    const { fullName, phone, username, password } = req.body;
    const { id } = req.params;

    if (password && password.trim() !== "") {
        db.query("UPDATE users SET fullName = ?, phone = ?, username = ?, password = ? WHERE id = ?", [fullName, phone, username, password, id], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: "Database error" });
            }
            res.json({ success: true, passwordReset: true, message: "Student details and password updated successfully" });
        });
    } else {
        db.query("UPDATE users SET fullName = ?, phone = ?, username = ? WHERE id = ?", [fullName, phone, username, id], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: "Database error" });
            }
            res.json({ success: true, passwordReset: false, message: "Student details updated successfully" });
        });
    }
});

// 3. Update Student Approved Courses for Admin
app.put('/api/users/:id/courses', (req, res) => {
    const { courses } = req.body;
    const { id } = req.params;
    const coursesValue = Array.isArray(courses) ? courses.join(',') : (courses || 'UPSC');

    const sql = "UPDATE users SET courses = ? WHERE id = ?";

    db.query(sql, [coursesValue, id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Database error" });
        }
        res.json({ success: true, message: "Approved courses updated successfully" });
    });
});

// 4. Get All Distinct Courses dynamically for dropdowns & selectors
app.get('/api/courses', (req, res) => {
    db.query("SELECT DISTINCT course FROM videos WHERE course IS NOT NULL AND course != ''", (err, videoResults) => {
        if (err) return res.status(500).json({ success: false, message: "Database Error" });

        db.query("SELECT DISTINCT course FROM materials WHERE course IS NOT NULL AND course != ''", (err2, materialResults) => {
            if (err2) {
                // If materials table doesn't exist yet or errors, gracefully fallback to video courses
                const dbCourses = videoResults.map(r => r.course);
                const defaultCourses = ["UPSC", "TNPSC", "RRB"];
                const combined = [...new Set([...defaultCourses, ...dbCourses])];
                return res.json(combined);
            }

            const dbCourses = [
                ...videoResults.map(r => r.course),
                ...materialResults.map(r => r.course)
            ];
            const defaultCourses = ["UPSC", "TNPSC", "RRB"];
            const combined = [...new Set([...defaultCourses, ...dbCourses])];
            res.json(combined);
        });
    });
});


// --- UPDATED API ROUTES ---

// 1. Get all videos
app.get('/api/videos', (req, res) => {
    db.query('SELECT * FROM videos ORDER BY created_at DESC', (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }

        const updatedResult = result.map(v => {
            let fileSize = null;
            if (v.file_path) {
                const filePath = path.join(__dirname, v.file_path);
                if (fs.existsSync(filePath)) {
                    try {
                        const stats = fs.statSync(filePath);
                        fileSize = stats.size; // in bytes
                    } catch (statErr) {
                        console.error("Error reading file stats:", statErr);
                    }
                }
            }
            return {
                ...v,
                file_size: fileSize
            };
        });

        res.json(updatedResult);
    });
});

// 2. Upload Video + Info (Using upload.single('videoFile'))
app.post('/api/videos', upload.single('videoFile'), (req, res) => {
    const { title, faculty_name, designation, video_status, streaming_date, course, subject } = req.body;
    const file_path = req.file ? `/uploads/${req.file.filename}` : null;

    // Handle empty date to prevent SQL errors
    const finalDate = (streaming_date && streaming_date !== "") ? streaming_date : null;
    const finalCourse = course || 'UPSC';
    const finalSubject = subject || 'General';

    // COUNT YOUR COLUMNS AND ? CAREFULLY
    const sql = `INSERT INTO videos 
                (title, faculty_name, designation, video_status, streaming_date, file_path, course, subject) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [title, faculty_name, designation, video_status, finalDate, file_path, finalCourse, finalSubject], (err, result) => {
        if (err) {
            console.error("DATABASE ERROR:", err); // This shows why it's a 500 error
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Success", id: result.insertId });
    });
});


// 3. Toggle Status
app.put('/api/videos/:id', (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body;
    db.query('UPDATE videos SET is_active = ? WHERE id = ?', [is_active, id], (err, result) => {
        if (err) res.status(500).send(err);
        else res.json({ message: "Status Updated" });
    });
});

// 4. EDIT: Update video metadata and/or replace video file
app.put('/api/videos/edit/:id', upload.single('videoFile'), (req, res) => {
    const { id } = req.params;
    const { title, faculty_name, designation, video_status, streaming_date, course, subject } = req.body;

    const finalCourse = course || 'UPSC';
    const finalSubject = subject || 'General';

    // Check if a new file was uploaded
    if (req.file) {
        const newFilePath = `/uploads/${req.file.filename}`;

        // Fetch old file path to delete it from storage
        db.query('SELECT file_path FROM videos WHERE id = ?', [id], (err, results) => {
            if (results[0]?.file_path) {
                const oldPath = path.join(__dirname, results[0].file_path);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
        });

        const sql = "UPDATE videos SET title=?, faculty_name=?, designation=?, video_status=?, streaming_date=?, file_path=?, course=?, subject=? WHERE id=?";
        db.query(sql, [title, faculty_name, designation, video_status, streaming_date, newFilePath, finalCourse, finalSubject, id], (err) => {
            if (err) return res.status(500).send(err);
            res.send("Video and data updated successfully");
        });
    } else {
        // Update only text data
        const sql = "UPDATE videos SET title=?, faculty_name=?, designation=?, video_status=?, streaming_date=?, course=?, subject=? WHERE id=?";
        db.query(sql, [title, faculty_name, designation, video_status, streaming_date, finalCourse, finalSubject, id], (err) => {
            if (err) return res.status(500).send(err);
            res.send("Metadata updated successfully");
        });
    }
});

// 5. DELETE: Remove record and clean up local file
app.delete('/api/videos/:id', (req, res) => {
    const { id } = req.params;

    // First find the file path to delete from disk
    db.query('SELECT file_path FROM videos WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).send(err);

        if (results.length > 0 && results[0].file_path) {
            const filePath = path.join(__dirname, results[0].file_path);
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath); // Deletes the actual MP4 file
                } catch (unlinkErr) {
                    console.error("Failed to delete physical video file:", unlinkErr);
                }
            }
        }

        // Then delete from MySQL
        db.query('DELETE FROM videos WHERE id = ?', [id], (err) => {
            if (err) return res.status(500).send(err);
            res.json({ success: true, message: "Record and file deleted successfully" });
        });
    });
});


// --- STUDY MATERIALS API ENDPOINTS ---

// 1. Get all materials (Admin)
app.get('/api/materials', (req, res) => {
    db.query('SELECT * FROM materials ORDER BY created_at DESC', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// 2. Upload Material File + Info (Using upload.single('materialFile'))
app.post('/api/materials', upload.single('materialFile'), (req, res) => {
    const { title, course, subject, description } = req.body;
    const file_path = req.file ? `/uploads/${req.file.filename}` : null;

    if (!file_path) {
        return res.status(400).json({ error: "File upload is required for study materials." });
    }

    const finalCourse = course || 'UPSC';
    const finalSubject = subject || 'General';

    const sql = `INSERT INTO materials 
                (title, course, subject, file_path, description) 
                VALUES (?, ?, ?, ?, ?)`;

    db.query(sql, [title, finalCourse, finalSubject, file_path, description || ''], (err, result) => {
        if (err) {
            console.error("DATABASE ERROR ON MATERIAL INSERT:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Success", id: result.insertId, file_path });
    });
});

// 3. Toggle Material Status (is_active)
app.put('/api/materials/:id', (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body;
    db.query('UPDATE materials SET is_active = ? WHERE id = ?', [is_active, id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: "Status Updated" });
    });
});

// 4. EDIT: Update material metadata and/or replace material file
app.put('/api/materials/edit/:id', upload.single('materialFile'), (req, res) => {
    const { id } = req.params;
    const { title, course, subject, description } = req.body;

    const finalCourse = course || 'UPSC';
    const finalSubject = subject || 'General';

    if (req.file) {
        const newFilePath = `/uploads/${req.file.filename}`;

        // Fetch old file path to delete it from storage
        db.query('SELECT file_path FROM materials WHERE id = ?', [id], (err, results) => {
            if (results[0]?.file_path) {
                const oldPath = path.join(__dirname, results[0].file_path);
                if (fs.existsSync(oldPath)) {
                    try {
                        fs.unlinkSync(oldPath);
                    } catch (unlinkErr) {
                        console.error("Failed to delete physical file:", unlinkErr);
                    }
                }
            }
        });

        const sql = "UPDATE materials SET title=?, course=?, subject=?, file_path=?, description=? WHERE id=?";
        db.query(sql, [title, finalCourse, finalSubject, newFilePath, description || '', id], (err) => {
            if (err) return res.status(500).send(err);
            res.send("Material and file updated successfully");
        });
    } else {
        const sql = "UPDATE materials SET title=?, course=?, subject=?, description=? WHERE id=?";
        db.query(sql, [title, finalCourse, finalSubject, description || '', id], (err) => {
            if (err) return res.status(500).send(err);
            res.send("Material updated successfully");
        });
    }
});

// 5. DELETE: Remove material record and clean up local file
app.delete('/api/materials/:id', (req, res) => {
    const { id } = req.params;

    db.query('SELECT file_path FROM materials WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).send(err);

        if (results.length > 0 && results[0].file_path) {
            const filePath = path.join(__dirname, results[0].file_path);
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath); // Delete physical file from disk
                } catch (unlinkErr) {
                    console.error("Failed to delete physical file:", unlinkErr);
                }
            }
        }

        db.query('DELETE FROM materials WHERE id = ?', [id], (err) => {
            if (err) return res.status(500).send(err);
            res.send("Material deleted successfully");
        });
    });
});

const server = app.listen(5004, () => {
    console.log('Server is running on port 5004');
});

// Now that 'server' is created above, these lines will work:
server.timeout = 3600000;
server.keepAliveTimeout = 3600000;
server.headersTimeout = 3601000;

