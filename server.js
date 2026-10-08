const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();

app.use(express.urlencoded({ extended: true }));

// Prevent browser caching during development and deployment
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// In-memory data stores
const users = [];
const signInCodes = [];

// =====================================================
// NODEMAILER TRANSPORTER SETUP
// =====================================================
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "lakshmishenbagam33@gmail.com",
        pass: "ltnwolynuigrsviq"
    },
    tls: {
        rejectUnauthorized: false
    },
    connectionTimeout: 4000,
    greetingTimeout: 3000,
    socketTimeout: 4000
});

// Shared CSS styles (StreamFlix Rebranded UI)
const streamStyles = `
    * {
        box-sizing: border-box;
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }

    body {
        margin: 0;
        min-height: 100vh;
        background-color: #141414;
        color: #fff;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .auth-body {
        background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.5) 50%, rgba(0, 0, 0, 0.85) 100%), 
                    url('https://res.cloudinary.com/djzntongf/image/upload/v1791019129/photo.png');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        background-attachment: fixed;
    }

    .header {
        width: 100%;
        padding: 20px 50px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%);
    }

    .logo {
        color: #E50914;
        font-size: 32px;
        font-weight: bold;
        text-decoration: none;
        letter-spacing: 2px;
    }

    .box {
        width: 450px;
        max-width: 90%;
        background: rgba(0, 0, 0, 0.85);
        padding: 50px 68px 40px;
        border-radius: 6px;
        margin-top: 20px;
        margin-bottom: 50px;
        color: #fff;
        border: 1px solid #222;
    }

    h1 {
        font-size: 32px;
        font-weight: 700;
        margin-top: 0;
        margin-bottom: 24px;
    }

    .input-group {
        margin-bottom: 16px;
    }

    input {
        width: 100%;
        padding: 16px 20px;
        border: none;
        border-radius: 4px;
        background: #333;
        color: #fff;
        font-size: 16px;
    }

    input:focus {
        outline: none;
        background: #454545;
    }

    button, .btn-primary {
        width: 100%;
        padding: 16px;
        border: none;
        border-radius: 4px;
        background: #E50914;
        color: white;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        margin-top: 20px;
        margin-bottom: 12px;
        transition: background 0.2s ease;
        text-align: center;
        text-decoration: none;
        display: block;
    }

    button:hover, .btn-primary:hover {
        background: #f40612;
    }

    .or-divider {
        text-align: center;
        color: #b3b3b3;
        margin: 12px 0;
        font-size: 13px;
        font-weight: 500;
    }

    .btn-secondary {
        width: 100%;
        padding: 14px;
        border: none;
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.2);
        color: white;
        font-size: 15px;
        font-weight: bold;
        cursor: pointer;
        text-align: center;
        text-decoration: none;
        display: block;
        margin-bottom: 16px;
    }

    .btn-secondary:hover {
        background: rgba(255, 255, 255, 0.3);
    }

    .help-link {
        text-align: center;
        margin-bottom: 20px;
    }

    .help-link a {
        color: #b3b3b3;
        text-decoration: none;
        font-size: 14px;
    }

    .help-link a:hover {
        text-decoration: underline;
    }

    .switch-page {
        margin-top: 16px;
        color: #737373;
        font-size: 16px;
    }

    .switch-page a {
        color: #fff;
        text-decoration: none;
        margin-left: 5px;
    }

    .switch-page a:hover {
        text-decoration: underline;
    }

    .status-icon {
        font-size: 50px;
        text-align: center;
        margin-bottom: 15px;
    }

    .error-title {
        color: #E50914;
    }

    .success-title {
        color: #2e7d32;
    }

    .dashboard-container {
        width: 100%;
        max-width: 1100px;
        padding: 20px;
    }

    .video-wrapper {
        width: 100%;
        background: #000;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.8);
        border: 1px solid #333;
    }

    video {
        width: 100%;
        height: auto;
        max-height: 580px;
        display: block;
    }

    .movie-selection {
        margin-top: 30px;
    }

    .movie-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 20px;
        margin-top: 15px;
    }

    .movie-card {
        background: #222;
        border-radius: 6px;
        padding: 15px;
        cursor: pointer;
        transition: transform 0.2s ease, background 0.2s ease;
        border: 1px solid #333;
    }

    .movie-card:hover {
        transform: scale(1.03);
        background: #333;
        border-color: #E50914;
    }

    .movie-card h3 {
        margin: 0 0 8px 0;
        font-size: 18px;
        color: #fff;
    }

    .movie-card p {
        margin: 0;
        font-size: 13px;
        color: #aaa;
    }

    .tag-hls {
        display: inline-block;
        background: #E50914;
        color: #fff;
        font-size: 10px;
        font-weight: bold;
        padding: 2px 6px;
        border-radius: 3px;
        margin-bottom: 6px;
    }
`;

function renderVideoDashboard(username) {
    const videoVijay = "https://res.cloudinary.com/djzntongf/video/upload/v1791009834/Thalapathy_Vijay__Most_Iconic_Dialogues___Leo_Ghilli_Thuppakki_Mersal_and_More___IMDb.mp4";
    const videoAjith = "https://res.cloudinary.com/djzntongf/video/upload/v1791009914/Full_Video__OG_SAMBAVAM___Good_Bad_Ugly___Ajith___Trisha___G_V_Prakash___Adhik_Ravichandran.mp4";
    const videoPradeep = "https://res.cloudinary.com/djzntongf/video/upload/v1791009936/Pradeep_Ranganathan_s_BEST_Moments___Dude_Love_Today_Dragon___Netflix_India.mp4";
    const videoSciFi = "https://res.cloudinary.com/djzntongf/video/upload/v1791009983/gemini_generated_video_d41ed393.mp4";
    
    // Sample Full-Length HLS Stream (.m3u8)
    const videoHlsDemo = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

    return `
<!DOCTYPE html>
<html>
<head>
    <title>StreamFlix Player</title>
    <style>${streamStyles}</style>
    <!-- HLS.js Library for multi-hour adaptive bitrate video streaming -->
    <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
</head>
<body>

<div class="header">
    <a href="#" class="logo">STREAMFLIX</a>
    <div>
        <span style="margin-right: 15px; color: #b3b3b3;">Welcome, <strong style="color: #fff;">${username}</strong></span>
        <a href="/" class="btn-primary" style="display: inline-block; width: auto; padding: 8px 16px; margin: 0;">Sign Out</a>
    </div>
</div>

<div class="dashboard-container">
    <h2 style="font-size: 28px; margin-bottom: 10px;" id="currentTitle">Now Playing: 🤖 THALAPATHY VIJAY MOVIE</h2>
    
    <div class="video-wrapper">
        <video id="mainPlayer" controls autoplay muted playsinline src="${videoVijay}">
            Your browser does not support HTML5 video.
        </video>
    </div>

    <div class="movie-selection">
        <h3 style="font-size: 22px; margin-bottom: 15px; color: #e5e5e5;">Featured Scenes & Movies</h3>
        
        <div class="movie-grid">
            <div class="movie-card" onclick="playMovie('${videoVijay}', '🤖 THALAPATHY VIJAY MOVIE')">
                <h3>🤖 THALAPATHY VIJAY MOVIE</h3>
                <p>DIALOGUE SCENE (MP4)</p>
            </div>

            <div class="movie-card" onclick="playMovie('${videoHlsDemo}', '🍿 Full Feature Movie (HLS Stream)')">
                <span class="tag-hls">3-HOUR READY (HLS)</span>
                <h3>🍿 Full Feature Stream</h3>
                <p>Adaptive Bitrate Stream (.m3u8)</p>
            </div>

            <div class="movie-card" onclick="playMovie('${videoAjith}', '🎬 THALA AJITH')">
                <h3>🎬 THALA AJITH</h3>
                <p>ACTION SCENE (MP4)</p>
            </div>

            <div class="movie-card" onclick="playMovie('${videoPradeep}', '🐘 PRADEEP RANGANATHAN')">
                <h3>🐘 PRADEEP RANGANATHAN</h3>
                <p>COMEDY SCENE (MP4)</p>
            </div>

            <div class="movie-card" onclick="playMovie('${videoSciFi}', '🚀 Sci-Fi Asteroid Escape')">
                <h3>🚀 Sci-Fi Asteroid Escape</h3>
                <p>Spaceship Flight Sequence (MP4)</p>
            </div>
        </div>
    </div>
</div>

<script>
    let hlsInstance = null;

    function playMovie(videoUrl, title) {
        const player = document.getElementById('mainPlayer');
        const titleHeader = document.getElementById('currentTitle');
        
        titleHeader.innerText = 'Now Playing: ' + title;

        // Clean up previous HLS instance if switching streams
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }

        // Check if the video is an HLS playlist (.m3u8)
        if (videoUrl.includes('.m3u8')) {
            if (Hls.isSupported()) {
                hlsInstance = new Hls();
                hlsInstance.loadSource(videoUrl);
                hlsInstance.attachMedia(player);
                hlsInstance.on(Hls.Events.MANIFEST_PARSED, function() {
                    player.play().catch(e => console.log('Autoplay deferred:', e));
                });
            } else if (player.canPlayType('application/vnd.apple.mpegurl')) {
                // Native HLS support for Safari / iOS
                player.src = videoUrl;
                player.play();
            }
        } else {
            // Standard MP4 video playback
            player.src = videoUrl;
            player.load();
            player.play().catch(e => console.log('Autoplay deferred:', e));
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
</script>

</body>
</html>
    `;
}

// 1. LOGIN PAGE
app.get("/", (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Sign In - StreamFlix</title>
    <style>${streamStyles}</style>
</head>
<body class="auth-body">

<div class="header">
    <a href="/" class="logo">STREAMFLIX</a>
</div>

<div class="box">
    <h1>Sign In</h1>

    <form action="/login" method="POST">
        <div class="input-group">
            <input type="text" name="username" placeholder="Email or username" required>
        </div>

        <div class="input-group">
            <input type="password" name="password" placeholder="Password (6-digit PIN)" maxlength="6" pattern="[0-9]{6}" required>
        </div>

        <button type="submit">Sign In</button>

        <div class="or-divider">OR</div>

        <a href="/request-code" class="btn-secondary">Use a Sign-In Code</a>

        <div class="help-link">
            <a href="/forgot-password">Forgot password?</a>
        </div>
    </form>

    <div class="switch-page">
        New here? <a href="/register">Sign up now.</a>
    </div>
</div>

</body>
</html>
    `);
});

// Redirect direct GET requests to /login back to home page
app.get("/login", (req, res) => {
    res.redirect("/");
});

// 2. REGISTER PAGE & LOGIC
app.get("/register", (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Sign Up - StreamFlix</title>
    <style>${streamStyles}</style>
</head>
<body class="auth-body">

<div class="header">
    <a href="/" class="logo">STREAMFLIX</a>
</div>

<div class="box">
    <h1>Sign Up</h1>

    <form action="/register" method="POST">
        <div class="input-group">
            <input type="text" name="username" placeholder="Username or email" required>
        </div>

        <div class="input-group">
            <input type="password" name="password" placeholder="Create 6-digit password" minlength="6" maxlength="6" pattern="[0-9]{6}" required>
        </div>

        <p style="font-size: 13px; color: #8c8c8c; margin-top: -8px; margin-bottom: 16px;">Password must contain exactly 6 digits.</p>

        <button type="submit">Register Account</button>
    </form>

    <div class="switch-page">
        Already have an account? <a href="/">Sign in now.</a>
    </div>
</div>

</body>
</html>
    `);
});

app.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!/^\d{6}$/.test(password)) {
        return res.send(`
<!DOCTYPE html>
<html><head><style>${streamStyles}</style></head>
<body class="auth-body">
<div class="box" style="text-align: center;">
    <div class="status-icon">❌</div>
    <h1 class="error-title">Invalid Password</h1>
    <p style="color: #b3b3b3;">Password must be exactly 6 digits.</p>
    <a href="/register" class="btn-primary">Try Again</a>
</div>
</body></html>
        `);
    }

    if (users.find(u => u.username === username)) {
        return res.send(`
<!DOCTYPE html>
<html><head><style>${streamStyles}</style></head>
<body class="auth-body">
<div class="box" style="text-align: center;">
    <div class="status-icon">⚠</div>
    <h1 class="error-title">Account Exists</h1>
    <p style="color: #b3b3b3;">Please use another username.</p>
    <a href="/register" class="btn-primary">Try Again</a>
</div>
</body></html>
        `);
    }

    users.push({ username, password });
    res.redirect("/");
});

// 3. REQUEST & SEND SIGN-IN CODE
app.get("/request-code", (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Request Code - StreamFlix</title>
    <style>${streamStyles}</style>
</head>
<body class="auth-body">

<div class="header">
    <a href="/" class="logo">STREAMFLIX</a>
</div>

<div class="box">
    <h1>Sign-In Code</h1>
    <p style="color: #b3b3b3; margin-bottom: 20px;">Enter your email address to receive a 6-digit sign-in code.</p>

    <form action="/send-code" method="POST">
        <div class="input-group">
            <input type="email" name="username" placeholder="Enter your email" required>
        </div>
        <button type="submit">Send Code</button>
    </form>

    <div class="switch-page">
        <a href="/">Back to Sign In</a>
    </div>
</div>

</body>
</html>
    `);
});

function renderCodeForm(res, username, generatedCode, cloudNotice = "") {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Enter Code - StreamFlix</title>
    <style>${streamStyles}</style>
</head>
<body class="auth-body">

<div class="header">
    <a href="/" class="logo">STREAMFLIX</a>
</div>

<div class="box">
    <h1>Enter Sign-In Code</h1>
    <p style="color: #b3b3b3; line-height: 1.5;">
        We generated a 6-digit code for <strong style="color:#fff;">${username}</strong>.
    </p>
    ${cloudNotice}

    <form action="/verify-code" method="POST" style="margin-top: 20px;">
        <input type="hidden" name="username" value="${username}">
        <div class="input-group">
            <input type="text" name="code" value="${generatedCode}" placeholder="Enter 6-digit code" maxlength="6" pattern="[0-9]{6}" required>
        </div>
        <button type="submit">Verify & Sign In</button>
    </form>

    <div class="switch-page">
        <a href="/request-code">Resend Code</a>
    </div>
</div>

</body>
</html>
    `);
}

app.post("/send-code", async (req, res) => {
    const { username } = req.body;

    let user = users.find(u => u.username === username);
    if (!user) {
        user = { username, password: "000000" };
        users.push(user);
    }

    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Refresh temporary sign-in code entry
    const existingIndex = signInCodes.findIndex(c => c.username === username);
    if (existingIndex !== -1) {
        signInCodes.splice(existingIndex, 1);
    }
    signInCodes.push({ username, code: generatedCode });

    try {
        await transporter.sendMail({
            from: '"StreamFlix Verification" <lakshmishenbagam33@gmail.com>',
            to: username,
            subject: `${generatedCode} is your verification code`,
            headers: {
                "X-Priority": "1",
                "Importance": "high"
            },
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #141414; padding: 30px; color: #ffffff; text-align: center; border-radius: 8px;">
                    <h1 style="color: #E50914; font-size: 26px; margin-bottom: 10px;">Verification Code</h1>
                    <p style="font-size: 15px; color: #b3b3b3;">Use the code below to complete your sign-in:</p>
                    <div style="font-size: 38px; font-weight: bold; color: #ffffff; letter-spacing: 8px; padding: 20px; margin: 20px 0; background: #E50914; border-radius: 6px; display: inline-block;">
                        ${generatedCode}
                    </div>
                </div>
            `
        });

        renderCodeForm(res, username, "");
    } catch (err) {
        const cloudNotice = `
            <div style="background: rgba(229, 9, 20, 0.2); border: 1px solid #E50914; padding: 12px; border-radius: 4px; margin-bottom: 15px; text-align: center;">
                <p style="margin: 0; font-size: 13px; color: #fff;"><strong>Cloud Demo Notice:</strong> SMTP port blocked by cloud server. Your code is filled below:</p>
            </div>
        `;
        renderCodeForm(res, username, generatedCode, cloudNotice);
    }
});

// 4. VERIFY CODE
app.post("/verify-code", (req, res) => {
    const { username, code } = req.body;

    const validCodeIdx = signInCodes.findIndex(
        c => c.username === username && c.code === code
    );

    if (validCodeIdx !== -1) {
        signInCodes.splice(validCodeIdx, 1);
        res.send(renderVideoDashboard(username));
    } else {
        res.send(`
<!DOCTYPE html>
<html><head><style>${streamStyles}</style></head>
<body class="auth-body">
<div class="box" style="text-align: center;">
    <div class="status-icon">❌</div>
    <h1 class="error-title">Invalid Code</h1>
    <p style="color: #b3b3b3;">The sign-in code is incorrect.</p>
    <a href="/request-code" class="btn-primary">Try Again</a>
</div>
</body></html>
        `);
    }
});

// 5. STANDARD LOGIN
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    const user = users.find(
        u => u.username === username && u.password === password
    );

    if (user) {
        res.send(renderVideoDashboard(user.username));
    } else {
        res.send(`
<!DOCTYPE html>
<html><head><style>${streamStyles}</style></head>
<body class="auth-body">
<div class="box" style="text-align: center;">
    <div class="status-icon">❌</div>
    <h1 class="error-title">Sign In Failed</h1>
    <p style="color: #b3b3b3;">Incorrect username or password.</p>
    <a href="/" class="btn-primary">Try Again</a>
</div>
</body></html>
        `);
    }
});

// 6. FORGOT PASSWORD
app.get("/forgot-password", (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Reset Password - StreamFlix</title>
    <style>${streamStyles}</style>
</head>
<body class="auth-body">

<div class="header">
    <a href="/" class="logo">STREAMFLIX</a>
</div>

<div class="box">
    <h1>Reset Password</h1>
    <p style="color: #b3b3b3; margin-bottom: 20px;">Enter your username and your new 6-digit password PIN.</p>

    <form action="/reset-password" method="POST">
        <div class="input-group">
            <input type="text" name="username" placeholder="Username or email" required>
        </div>

        <div class="input-group">
            <input type="password" name="newPassword" placeholder="Enter new 6-digit password" minlength="6" maxlength="6" pattern="[0-9]{6}" required>
        </div>

        <button type="submit">Update Password</button>
    </form>

    <div class="switch-page">
        <a href="/">Back to Sign In</a>
    </div>
</div>

</body>
</html>
    `);
});

app.post("/reset-password", (req, res) => {
    const { username, newPassword } = req.body;

    if (!/^\d{6}$/.test(newPassword)) {
        return res.send(`
<!DOCTYPE html>
<html><head><style>${streamStyles}</style></head>
<body class="auth-body">
<div class="box" style="text-align: center;">
    <div class="status-icon">❌</div>
    <h1 class="error-title">Invalid Password</h1>
    <p style="color: #b3b3b3;">Password must be exactly 6 digits.</p>
    <a href="/forgot-password" class="btn-primary">Try Again</a>
</div>
</body></html>
        `);
    }

    const user = users.find(u => u.username === username);

    if (user) {
        user.password = newPassword;
        res.send(`
<!DOCTYPE html>
<html><head><style>${streamStyles}</style></head>
<body class="auth-body">
<div class="box" style="text-align: center;">
    <div class="status-icon">✅</div>
    <h1 class="success-title">Password Updated</h1>
    <p style="color: #b3b3b3;">Your password has been successfully updated.</p>
    <a href="/" class="btn-primary">Sign In Now</a>
</div>
</body></html>
        `);
    } else {
        res.send(`
<!DOCTYPE html>
<html><head><style>${streamStyles}</style></head>
<body class="auth-body">
<div class="box" style="text-align: center;">
    <div class="status-icon">❌</div>
    <h1 class="error-title">Account Not Found</h1>
    <p style="color: #b3b3b3;">No account exists with that username.</p>
    <a href="/forgot-password" class="btn-primary">Try Again</a>
</div>
</body></html>
        `);
    }
});

// START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
});