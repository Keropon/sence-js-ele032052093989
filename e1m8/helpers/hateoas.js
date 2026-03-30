export const buildTaskLinks = (id) => ([
  { rel: 'self',           method: 'GET',    href: `/tareas/${id}` },
  { rel: 'update',         method: 'PUT',    href: `/tareas/${id}` },
  { rel: 'partial_update', method: 'PATCH',  href: `/tareas/${id}` },
  { rel: 'delete',         method: 'DELETE', href: `/tareas/${id}` }
])
