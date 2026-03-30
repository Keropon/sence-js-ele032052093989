const API_URL = 'http://localhost:3000'

const registerForm = document.getElementById('registerForm')

if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const username = document.getElementById('username').value
    const password = document.getElementById('password').value

    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })

    const data = await res.json()
    document.getElementById('mensaje').innerText = data.message || data.error
  })
}

const loginForm = document.getElementById('loginForm')

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const username = document.getElementById('username').value
    const password = document.getElementById('password').value

    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })

    const data = await res.json()

    if (data.token) {
      localStorage.setItem('token', data.token)
      document.getElementById('mensaje').innerText = 'Login exitoso'
    } else {
      document.getElementById('mensaje').innerText = data.error
    }
  })
}

const perfilBtn = document.getElementById('perfilBtn')

if (perfilBtn) {
  perfilBtn.addEventListener('click', async () => {
    const token = localStorage.getItem('token')

    const res = await fetch(`${API_URL}/perfil`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    const data = await res.json()

    if (data.user) {
      document.getElementById('mensaje').innerText = `
${data.message}
Usuario: ${data.user.username}
Rol: ${data.user.role}
`
    } else {
      document.getElementById('mensaje').innerText = data.message || data.error
    }
  })
}
