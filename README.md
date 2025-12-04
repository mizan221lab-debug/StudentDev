<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>StudentDev Demo</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; background: #fafbfc }
    h2 { color: #1a77bd }
    label { display: block; margin-top: 10px }
    input, select { margin-top: 5px; margin-bottom: 15px; padding: 5px }
    button { padding: 7px 16px }
    .container { max-width: 550px; margin: auto; background: #fff; box-shadow: 0 0 10px #ccc; padding: 30px; border-radius: 8px }
    #logout-btn { float: right }
    .error { color: red }
    .result { margin-bottom: 18px }
  </style>
</head>
<body>
<div class="container">
  <h2>StudentDev - School Academic Tracking Demo</h2>
  <div id="main-content"></div>
</div>
<script>
  const API = "http://localhost:5000/api"; // change for your deployment

  let state = {
    token: null,
    user: null,
    role: null,
    subjects: [],
    users: [],
    scores: [],
    error: null,
  };

  // Utils
  function api(url, method = "GET", body = null) {
    return fetch(API + url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(state.token ? { "Authorization": "Bearer " + state.token } : {}),
      },
      body: body ? JSON.stringify(body) : undefined
    }).then(res => res.json());
  }

  function renderError(msg) {
    return `<div class="error">ERROR: ${msg}</div>`;
  }

  function setError(err) {
    state.error = err;
    render();
  }

  function clearError() { state.error = null; }

  // Views
  function renderLogin() {
    return `
      ${state.error ? renderError(state.error) : ""}
      <h3>Login</h3>
      <form onsubmit="return handleLogin(event)">
        <label>Username:<input id="login-username" required></label>
        <label>Password:<input id="login-password" type="password" required></label>
        <button type="submit">Login</button>
      </form>
      <hr/>
      <h3>Register (student/teacher)</h3>
      <form onsubmit="return handleRegister(event)">
        <label>Username:<input id="reg-username" required></label>
        <label>Password:<input id="reg-password" type="password" required></label>
        <label>Name:<input id="reg-name" required></label>
        <label>Role:
            <select id="reg-role">
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
        </label>
        <button type="submit">Register</button>
      </form>
    `;
  }

  function renderDashboard() {
    // Logout button
    let html = `
      <button id="logout-btn" onclick="handleLogout()">Logout (${state.user.username || ""})</button>
      <h3>Welcome ${state.user.name || ""} (${state.role})</h3>
    `;

    if (state.role === "teacher") {
      html += renderTeacherView();
    } else if (state.role === "student") {
      html += renderStudentView();
    }
    return html;
  }

  function renderTeacherView() {
    let html = `
      <h4>Create Subject</h4>
      <form onsubmit="return handleCreateSubject(event)">
        <label>Subject Name:<input id="subject-name" required></label>
        <label>Student IDs (comma separated):<input id="subject-students" placeholder="student IDs"></label>
        <button type="submit">Create Subject</button>
      </form>
      <hr>

      <h4>Add/Update Score</h4>
      <form onsubmit="return handleAddScore(event)">
        <label>Student ID:<input id="score-student" required></label>
        <label>Subject ID:<input id="score-subject" required></label>
        <label>Term (1 or 2):<input id="score-term" required></label>
        <label>Score:<input id="score-score" required></label>
        <button type="submit">Add/Update Score</button>
      </form>
      <hr>

      <h4>Subjects (by you)</h4>
      <button onclick="loadSubjects()">Reload Subjects</button>
      <div id="subjects-list">
        ${(state.subjects && state.subjects.length)
          ? state.subjects.map(sub => `
            <div>
              <strong>${sub.name}</strong> (ID: ${sub._id})<br>
              Students: ${sub.students && sub.students.length ? sub.students.map(s => s.name).join(', ') : 'N/A'}
              <br>
              <button onclick="exportSubject('${sub._id}')">Export PDF</button>
            </div><hr>
          `).join('')
          : 'No subjects yet.'
        }
      </div>
      <hr>

      <h4>All Users (IDs for linking)</h4>
      <button onclick="loadUsers()">Reload Users</button>
      <div id="users-list">
        ${(state.users && state.users.length)
          ? state.users.map(u => `${u.name} (${u.username}) - ${u.role} [${u._id}]`).join('<br>')
          : 'No users loaded.'}
      </div>
    `;
    return html;
  }

  function renderStudentView() {
    let html = `
      <h4>Your Subjects</h4>
      <button onclick="loadSubjects()">Reload</button>
      <div id="subjects-list">
        ${(state.subjects && state.subjects.length)
          ? state.subjects.map(sub => `
            <div>
              <strong>${sub.name}</strong> (ID: ${sub._id})<br>
              Teacher: ${sub.teacher ? sub.teacher.name : 'N/A'}
              <br>
              <button onclick="exportSubject('${sub._id}')">Export Subject PDF</button>
            </div><hr>
          `).join('')
          : 'No subjects yet.'
        }
      </div>
      <h4>Your Scores</h4>
      <button onclick="loadScores()">Reload Scores</button>
      <div id="scores-list">
        ${(state.scores && state.scores.length)
          ? state.scores.map(sc => `
              <div>
                Subject: ${sc.subject.name}<br>
                Term: ${sc.term}<br>
                Score: ${sc.score}
              </div>
            `).join('<hr>')
          : 'No scores found.'}
      </div>
      <hr>
      <button onclick="exportStudent()">Export Your Score PDF</button>
      <div id="export-result"></div>
    `;
    return html;
  }

  // Actions/Handlers

  window.handleLogin = function (e) {
    e.preventDefault();
    clearError();
    let username = document.getElementById('login-username').value;
    let password = document.getElementById('login-password').value;
    api('/auth/login', "POST", { username, password })
      .then(resp => {
        if(resp.token){
          state.token = resp.token;
          state.user = resp.user;
          state.role = resp.user.role;
          loadDashboard();
        } else setError(resp.error || "Login failed");
      });
    return false;
  }

  window.handleRegister = function(e){
    e.preventDefault();
    clearError();
    let username = document.getElementById('reg-username').value;
    let password = document.getElementById('reg-password').value;
    let name = document.getElementById('reg-name').value;
    let role = document.getElementById('reg-role').value;
    api('/auth/register', 'POST', { username, password, name, role })
      .then(resp => {
        if(resp.message) alert('Register success. You can login now.');
        else setError(resp.error || "Register failed");
      });
    return false;
  }

  window.handleLogout = function() {
    state = { token:null, user:null, role:null, subjects:[], users:[], scores:[], error:null };
    render();
  }

  window.handleCreateSubject = function(e){
    e.preventDefault();
    let name = document.getElementById('subject-name').value;
    let teacherId = state.user.id || state.user._id;
    let studentIdsRaw = document.getElementById('subject-students').value;
    let studentIds = studentIdsRaw.split(',').map(v=>v.trim()).filter(Boolean);
    api('/subjects', 'POST', { name, teacherId, studentIds })
      .then(resp => {
        if(resp._id) {
          alert("Subject Created");
          loadSubjects();
        } else setError(resp.error || "Add subject failed");
      });
    return false;
  }

  window.handleAddScore = function(e){
    e.preventDefault();
    let studentId = document.getElementById('score-student').value;
    let subjectId = document.getElementById('score-subject').value;
    let term = parseInt(document.getElementById('score-term').value);
    let score = parseFloat(document.getElementById('score-score').value);
    api('/scores', 'POST', { studentId, subjectId, term, score })
      .then(resp => {
        if(resp._id || resp.id){
          alert("Score added/updated!");
        } else setError(resp.error || "Add score failed");
      });
    return false;
  }

  window.loadDashboard = async function(){
    if(state.role === "teacher"){
      await loadSubjects(true);
      await loadUsers();
    }
    if(state.role === "student"){
      await loadSubjects(true);
      await loadScores();
    }
    render();
  }

  window.loadSubjects = function(isDash){
    let url = '';
    if(state.role==="student") url = `/subjects/by-student/${state.user.id || state.user._id}`;
    else if(state.role==="teacher") url = `/subjects/by-teacher/${state.user.id || state.user._id}`;
    else url = '/subjects';
    return api(url).then(subs => { state.subjects = subs; if(!isDash) render(); });
  }

  window.loadUsers = function(){
    return api('/users').then(users => { state.users = users; render(); });
  }

  window.loadScores = function(){
    let url = `/scores?studentId=${state.user.id||state.user._id}`;
    return api(url).then(scores => { state.scores = scores; render(); });
  }

  window.exportStudent = function(){
    api(`/export/student/${state.user.id||state.user._id}`).then(resp => {
      if(resp.url){
        document.getElementById("export-result").innerHTML =
          `<a href="http://localhost:5000${resp.url}" target="_blank">Download PDF</a>`;
      } else setError(resp.error||"PDF failed");
    });
  }

  window.exportSubject = function(subid){
    api(`/export/subject/${subid}`).then(resp => {
      if(resp.url){
        alert('PDF ready! Click OK to download.');
        window.open("http://localhost:5000"+resp.url,"_blank")
      } else setError(resp.error||"PDF failed");
    });
  }

  // Main Render
  function render() {
    let content = "";
    if (!state.token || !state.user) content = renderLogin();
    else content = renderDashboard();
    document.getElementById("main-content").innerHTML = content;
  }

  render();
</script>
</body>
</html>
