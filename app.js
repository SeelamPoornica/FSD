const express = require('express');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');

const app = express();

let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
    serviceAccount = require('./serviceAccountKey.json');
}

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.use(session({
    secret: 'pathly_super_secret_key',
    resave: false,
    saveUninitialized: false
}));


app.use((req, res, next) => {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate');
    next();
});


const checkAuthRedirect = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
};

const checkAuthApi = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// --- Page Routes ---
app.get('/', (req, res) => res.redirect('/login'));


app.get('/login', (req, res) => {
    if (req.session.userId) return res.redirect('/dashboard');
    res.sendFile(path.join(__dirname, 'public', 'login.html'))
});

app.get('/signup', (req, res) => {
    if (req.session.userId) return res.redirect('/dashboard');
    res.sendFile(path.join(__dirname, 'public', 'signup.html'))
});

app.get('/dashboard', checkAuthRedirect, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/roadmap/:id', checkAuthRedirect, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'roadmap.html'));
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// --- API Endpoints ---
app.post('/api/signup', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const userRef = db.collection('users').doc(email);
        const doc = await userRef.get();
        if (doc.exists) return res.status(400).json({ error: 'Email already exists!' });
        
        const hashedPassword = await bcrypt.hash(password, 10);
        await userRef.set({ username, email, password: hashedPassword });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Signup failed.' }); }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const userRef = db.collection('users').doc(email);
        const doc = await userRef.get();
        if (!doc.exists) return res.status(400).json({ error: 'User not found!' });
        
        const isMatch = await bcrypt.compare(password, doc.data().password);
        if (isMatch) {
            req.session.userId = email;
            req.session.username = doc.data().username;
            res.json({ success: true });
        } else { res.status(400).json({ error: 'Wrong password!' }); }
    } catch (err) { res.status(500).json({ error: 'Login error.' }); }
});


app.get('/api/dashboard', checkAuthApi, async (req, res) => {
    try {
        
        const snapshot = await db.collection('roadmaps').get();
        const roadmapList = {};
        snapshot.docs.forEach(doc => {
            roadmapList[doc.id] = doc.data();
        });

        
        const progDoc = await db.collection('progress').doc(req.session.userId).get();
        const progressData = progDoc.exists ? progDoc.data() : {};

        
        res.json({ 
            user: req.session.username || "Learner",
            roadmaps: roadmapList,
            progress: progressData 
        });
    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({ error: "Error loading dashboard" });
    }
});


app.get('/api/roadmap/:id', checkAuthApi, async (req, res) => {
    const roadmapId = req.params.id;
    try {
        const roadmapDoc = await db.collection('roadmaps').doc(roadmapId).get();
        if (!roadmapDoc.exists) return res.status(404).json({ error: 'Roadmap not found' });

        const roadmapData = roadmapDoc.data();
        
        
        let rawSteps = roadmapData.steps || roadmapData.Steps || [];
        let finalSteps = Array.isArray(rawSteps) ? rawSteps : Object.values(rawSteps);
        
        
        finalSteps.sort((a, b) => parseInt(a.day || 0) - parseInt(b.day || 0));

        
        const progDoc = await db.collection('progress').doc(req.session.userId).get();
        const completedSteps = progDoc.exists ? (progDoc.data()[roadmapId] || []) : [];

        res.json({ 
            roadmap: roadmapData, 
            steps: finalSteps, 
            roadmapId: roadmapId, 
            completedSteps: completedSteps 
        });
    } catch (error) {
        console.error("Roadmap View Error:", error);
        res.status(500).json({ error: "Error loading roadmap" });
    }
});


app.post('/api/complete-step', checkAuthApi, async (req, res) => {
    const { pathId, dayId } = req.body;
    const userId = req.session.userId;
    try {
        const progRef = db.collection('progress').doc(userId);
        await progRef.set({
            [pathId]: FieldValue.arrayUnion(dayId.toString())
        }, { merge: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;