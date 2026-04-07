'use strict';

function showFormError(form, message) {
  // Look for [data-form-error] as a sibling preceding the form, or inside it
  const container = form.closest('.border-3') || form.parentElement;
  const errorEl   = container ? container.querySelector('[data-form-error]') : null;

  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(container,
        { x: -10 },
        { x: 0, duration: 0.5, ease: 'elastic.out(1.5, 0.3)' }
      );
    }
  } else {
    alert('Error: ' + message);
  }
}

document.addEventListener('submit', async (e) => {
  const form = e.target.closest('form[data-ajax-form]');
  if (!form) return;
  e.preventDefault();

  const container = form.closest('.border-3') || form.parentElement;
  const errorEl   = container ? container.querySelector('[data-form-error]') : null;
  if (errorEl) errorEl.classList.add('hidden');

  const data = Object.fromEntries(new FormData(form).entries());

  try {
    const response = await fetch(form.action, {
      method:  form.getAttribute('method') || 'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok && result.ok !== false) {
      if (form.action.includes('/auth/login'))         window.location.href = '/dashboard';
      else if (form.action.includes('/auth/register')) window.location.href = '/login';
      else window.location.reload();
    } else {
      showFormError(form, result.error || 'Operación fallida');
    }
  } catch (err) {
    console.error(err);
    showFormError(form, 'Error de red. Comprueba tu conexión e intenta de nuevo.');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('nav-toggle');
  const nav    = document.getElementById('main-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('hidden');
    toggle.textContent = open ? '☰' : '✕';
    toggle.setAttribute('aria-expanded', String(!open));
  });
});
