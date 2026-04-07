'use strict';

function moveCardToColumn(card, targetCol, afterMove) {
  const doMove = () => { targetCol.appendChild(card); if (afterMove) afterMove(); };
  if ('startViewTransition' in document) {
    document.startViewTransition(doMove);
  } else {
    doMove();
  }
}

function updateCount(listEl) {
  const badge = listEl.querySelector('.kanban-list-count');
  if (badge) badge.textContent = listEl.querySelectorAll('.kanban-card').length;
}

function initGSAPDrag() {
  gsap.registerPlugin(Draggable);

  const dropZones = Array.from(document.querySelectorAll('.kanban-cards'));

  document.querySelectorAll('.kanban-card').forEach(card => {
    const handle = card.querySelector('.kanban-drag-handle');
    if (!handle) return;

    let fromListId, fromBoardId, fromListEl;
    let activeZone = null;
    let wobbleTween = null;

    Draggable.create(card, {
      type: 'x,y',
      trigger: handle,
      zIndex: 1000,

      onDragStart() {
        fromListId = card.dataset.listId;
        fromBoardId = card.dataset.boardId;
        fromListEl = card.closest('.kanban-list');
        card.classList.add('dragging');

        gsap.to(card, { scale: 1.04, duration: 0.15, ease: 'power2.out' });

        wobbleTween = gsap.to(card, {
          rotation: 2.5,
          duration: 0.2,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          transformOrigin: '50% 80%'
        });
      },

      onDrag() {
        let found = null;
        for (const zone of dropZones) {
          if (this.hitTest(zone, '30%')) { found = zone; break; }
        }
        if (found !== activeZone) {
          if (activeZone) activeZone.classList.remove('drag-over');
          if (found) found.classList.add('drag-over');
          activeZone = found;
        }
      },

      onDragEnd() {
        card.classList.remove('dragging');
        if (activeZone) activeZone.classList.remove('drag-over');

        if (wobbleTween) { wobbleTween.kill(); wobbleTween = null; }

        const toZone = activeZone;
        activeZone = null;

        if (!toZone) {
          gsap.to(card, { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.25, ease: 'power3.out' });
          return;
        }

        const toListId = toZone.dataset.listId;
        const toBoardId = toZone.dataset.boardId;

        if (toListId === fromListId && toBoardId === fromBoardId) {
          gsap.to(card, { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.25, ease: 'power3.out' });
          return;
        }

        const cardId = card.dataset.cardId;
        const toListEl = toZone.closest('.kanban-list');

        gsap.set(card, { x: 0, y: 0, zIndex: '' });
        gsap.to(card, { rotation: 0, scale: 1, duration: 0.35, ease: 'elastic.out(1, 0.5)' });

        moveCardToColumn(card, toZone, () => {
          card.dataset.listId = toListId;
          card.dataset.boardId = toBoardId;
          updateCount(fromListEl);
          updateCount(toListEl);
          gsap.fromTo(card,
            { opacity: 0.5, y: -10 },
            { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' }
          );
        });

        fetch(`/api/listas/${toListId}/tarjetas/${cardId}/move`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }
        })
          .then(r => r.json())
          .then(d => { if (d.ok === false) location.reload(); })
          .catch(() => location.reload());
      }
    });
  });
}

function initButtonAnimations() {
  const selector = '.btn-primary, .btn-secondary, .btn-danger, .board-fold-btn, .board-delete-btn, .list-delete-btn, .list-fold-btn';

  document.querySelectorAll(selector).forEach(btn => {
    btn.addEventListener('mousedown', () => {
      gsap.to(btn, { scale: 0.93, duration: 0.08, ease: 'power2.in' });
    });
    btn.addEventListener('mouseup', () => {
      gsap.to(btn, { scale: 1, duration: 0.25, ease: 'elastic.out(1.2, 0.5)' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { scale: 1, duration: 0.15, ease: 'power2.out' });
    });
  });
}

function initPopoverAnimations() {
  document.querySelectorAll('[popover]').forEach(pop => {
    pop.addEventListener('toggle', e => {
      if (e.newState === 'open') {
        gsap.fromTo(pop,
          { opacity: 0, scale: 0.94, y: -10 },
          { opacity: 1, scale: 1, y: 0, duration: 0.22, ease: 'power2.out' }
        );
      }
    });
  });
}

function initPageLoadAnimations() {
  gsap.from('.board-section', {
    opacity: 0,
    y: 24,
    duration: 0.4,
    stagger: 0.1,
    ease: 'power2.out',
    clearProps: 'opacity,y'
  });

  gsap.from('.kanban-card', {
    opacity: 0,
    x: -10,
    duration: 0.3,
    stagger: 0.025,
    ease: 'power1.out',
    delay: 0.1,
    clearProps: 'opacity,x'
  });
}

function initBoardControls() {
  document.querySelectorAll('.board-fold-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.closest('.board-section');
      const folded = section.classList.toggle('folded');
      btn.textContent = folded ? '»»' : '‹‹';
    });
  });

  document.querySelectorAll('.board-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm('¿Eliminar este tablero y todo su contenido? Esta acción no se puede deshacer.')) return;
      fetch(`/api/tableros/${btn.dataset.boardId}`, { method: 'DELETE' })
        .then(() => location.reload())
        .catch(() => location.reload());
    });
  });
}

function initListControls() {
  document.querySelectorAll('.list-fold-btn').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.kanban-list').classList.add('folded'));
  });

  document.querySelectorAll('.list-unfold-btn').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.kanban-list').classList.remove('folded'));
  });

  document.querySelectorAll('.list-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm('¿Eliminar esta lista y todas sus tarjetas? Esta acción no se puede deshacer.')) return;
      const { listaId, tableroId } = btn.dataset;
      fetch(`/api/tableros/${tableroId}/listas/${listaId}`, { method: 'DELETE' })
        .then(() => location.reload())
        .catch(() => location.reload());
    });
  });
}

function initImportExport() {
  const exportBtn = document.getElementById('export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      fetch('/api/export')
        .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(data => {
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = 'kanbanpro-export.json'; a.click();
          URL.revokeObjectURL(url);
        })
        .catch(e => alert('Error al exportar: ' + e.message));
    });
  }

  const fileInput = document.getElementById('import-file-input');
  const confirmBtn = document.getElementById('import-confirm-btn');
  if (!fileInput || !confirmBtn) return;

  confirmBtn.addEventListener('click', () => {
    const file = fileInput.files[0];
    if (!file) { alert('Selecciona un archivo JSON primero.'); return; }

    const reader = new FileReader();
    reader.onload = ev => {
      let data;
      try { data = JSON.parse(ev.target.result); }
      catch (err) { alert('El archivo no contiene JSON válido.'); return; }

      if (!data.boards || !Array.isArray(data.boards)) {
        alert('Formato inválido: se esperaba { boards: [...] }.'); return;
      }

      fetch('/api/import', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(r => r.json())
        .then(d => { if (d.ok) location.reload(); else alert('Error al importar: ' + (d.error || '')); })
        .catch(() => alert('Error al importar los datos.'));
    };
    reader.readAsText(file);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap !== 'undefined' && typeof Draggable !== 'undefined') {
    try { initGSAPDrag(); } catch (e) { console.error('[dashboard] initGSAPDrag:', e); }
    try { initButtonAnimations(); } catch (e) { console.error('[dashboard] initButtonAnimations:', e); }
    try { initPopoverAnimations(); } catch (e) { console.error('[dashboard] initPopoverAnimations:', e); }
    try { initPageLoadAnimations(); } catch (e) { console.error('[dashboard] initPageLoadAnimations:', e); }
  }
  try { initBoardControls(); } catch (e) { console.error('[dashboard] initBoardControls:', e); }
  try { initListControls(); } catch (e) { console.error('[dashboard] initListControls:', e); }
  try { initImportExport(); } catch (e) { console.error('[dashboard] initImportExport:', e); }
});
