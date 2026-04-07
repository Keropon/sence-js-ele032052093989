const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'KanbanPro API',
    version: '1.0.0',
    description: 'API REST para gestión de tableros Kanban. Permite gestionar usuarios, tableros, listas y tarjetas con autenticación JWT.',
    contact: {
      name: 'Pablo Olivares'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor de desarrollo'
    }
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token',
        description: 'JWT enviado como cookie httpOnly tras el login'
      }
    },
    schemas: {
      Usuario: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nombre: { type: 'string', example: 'Juan Pérez' },
          email: { type: 'string', format: 'email', example: 'juan@ejemplo.com' },
          rol: { type: 'string', example: 'usuario' }
        }
      },
      Tablero: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nombre: { type: 'string', example: 'Mi Tablero' },
          descripcion: { type: 'string', example: 'Descripción del tablero' },
          usuarioId: { type: 'integer', example: 1 }
        }
      },
      Lista: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nombre: { type: 'string', example: 'Por Hacer' },
          tableroId: { type: 'integer', example: 1 }
        }
      },
      Tarjeta: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          titulo: { type: 'string', example: 'Implementar login' },
          descripcion: { type: 'string', example: 'Crear el formulario de login' },
          prioridad: { type: 'string', example: 'alta', enum: ['baja', 'media', 'alta'] },
          tag: { type: 'string', example: 'frontend' },
          fecha_inicio: { type: 'string', example: '2024-01-01' },
          fecha_fin: { type: 'string', example: '2024-01-15' },
          autor: { type: 'string', example: 'Juan' },
          responsable: { type: 'string', example: 'María' },
          estado: { type: 'string', example: 'pendiente' },
          listaId: { type: 'integer', example: 1 }
        }
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Mensaje de error' }
        }
      }
    }
  },
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Autenticación'],
        summary: 'Registrar nuevo usuario',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombre', 'email', 'password'],
                properties: {
                  nombre: { type: 'string', example: 'Juan Pérez' },
                  email: { type: 'string', format: 'email', example: 'juan@ejemplo.com' },
                  password: { type: 'string', format: 'password', example: 'miPassword123' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Usuario registrado exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    mensaje: { type: 'string', example: 'Usuario registrado' },
                    usuario: { $ref: '#/components/schemas/Usuario' }
                  }
                }
              }
            }
          },
          400: { description: 'Datos inválidos o email ya registrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Autenticación'],
        summary: 'Iniciar sesión',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'juan@ejemplo.com' },
                  password: { type: 'string', format: 'password', example: 'miPassword123' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Login exitoso. Retorna JWT en cookie.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    mensaje: { type: 'string', example: 'Login exitoso' },
                    usuario: { $ref: '#/components/schemas/Usuario' }
                  }
                }
              }
            }
          },
          401: { description: 'Credenciales inválidas', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/api/auth/logout': {
      post: {
        tags: ['Autenticación'],
        summary: 'Cerrar sesión',
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: 'Sesión cerrada', content: { 'application/json': { schema: { type: 'object', properties: { mensaje: { type: 'string', example: 'Logout exitoso' } } } } } }
        }
      }
    },
    '/api/tableros': {
      get: {
        tags: ['Tableros'],
        summary: 'Obtener tableros del usuario autenticado',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Lista de tableros',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Tablero' } }
              }
            }
          },
          401: { description: 'No autenticado' }
        }
      },
      post: {
        tags: ['Tableros'],
        summary: 'Crear nuevo tablero',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombre'],
                properties: {
                  nombre: { type: 'string', example: 'Proyecto Alpha' },
                  descripcion: { type: 'string', example: 'Tablero para el proyecto Alpha' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Tablero creado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Tablero' } } } },
          401: { description: 'No autenticado' }
        }
      }
    },
    '/api/tableros/{id}': {
      put: {
        tags: ['Tableros'],
        summary: 'Actualizar tablero',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID del tablero' }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nombre: { type: 'string', example: 'Nombre actualizado' },
                  descripcion: { type: 'string', example: 'Descripción actualizada' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Tablero actualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Tablero' } } } },
          401: { description: 'No autenticado' },
          404: { description: 'Tablero no encontrado' }
        }
      },
      delete: {
        tags: ['Tableros'],
        summary: 'Eliminar tablero',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID del tablero' }
        ],
        responses: {
          200: { description: 'Tablero eliminado' },
          401: { description: 'No autenticado' },
          404: { description: 'Tablero no encontrado' }
        }
      }
    },
    '/api/tableros/{tableroId}/listas': {
      post: {
        tags: ['Listas'],
        summary: 'Crear lista en un tablero',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'tableroId', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID del tablero' }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombre'],
                properties: {
                  nombre: { type: 'string', example: 'En Progreso' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Lista creada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Lista' } } } },
          401: { description: 'No autenticado' }
        }
      }
    },
    '/api/tableros/{tableroId}/listas/{listaId}': {
      put: {
        tags: ['Listas'],
        summary: 'Actualizar lista',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'tableroId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'listaId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nombre: { type: 'string', example: 'Hecho' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Lista actualizada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Lista' } } } },
          401: { description: 'No autenticado' },
          404: { description: 'Lista no encontrada' }
        }
      },
      delete: {
        tags: ['Listas'],
        summary: 'Eliminar lista',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'tableroId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'listaId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Lista eliminada' },
          401: { description: 'No autenticado' },
          404: { description: 'Lista no encontrada' }
        }
      }
    },
    '/api/listas/{listaId}/tarjetas': {
      post: {
        tags: ['Tarjetas'],
        summary: 'Crear tarjeta en una lista',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'listaId', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID de la lista' }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['titulo'],
                properties: {
                  titulo: { type: 'string', example: 'Diseñar wireframes' },
                  descripcion: { type: 'string', example: 'Crear wireframes para la pantalla principal' },
                  prioridad: { type: 'string', example: 'alta', enum: ['baja', 'media', 'alta'] },
                  tag: { type: 'string', example: 'diseño' },
                  fecha_inicio: { type: 'string', example: '2024-01-01' },
                  fecha_fin: { type: 'string', example: '2024-01-10' },
                  autor: { type: 'string', example: 'Juan' },
                  responsable: { type: 'string', example: 'María' },
                  estado: { type: 'string', example: 'pendiente' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Tarjeta creada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Tarjeta' } } } },
          401: { description: 'No autenticado' }
        }
      }
    },
    '/api/listas/{listaId}/tarjetas/{tarjetaId}': {
      put: {
        tags: ['Tarjetas'],
        summary: 'Actualizar tarjeta',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'listaId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'tarjetaId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  titulo: { type: 'string' },
                  descripcion: { type: 'string' },
                  prioridad: { type: 'string', enum: ['baja', 'media', 'alta'] },
                  tag: { type: 'string' },
                  fecha_inicio: { type: 'string' },
                  fecha_fin: { type: 'string' },
                  autor: { type: 'string' },
                  responsable: { type: 'string' },
                  estado: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Tarjeta actualizada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Tarjeta' } } } },
          401: { description: 'No autenticado' },
          404: { description: 'Tarjeta no encontrada' }
        }
      },
      delete: {
        tags: ['Tarjetas'],
        summary: 'Eliminar tarjeta',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'listaId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'tarjetaId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Tarjeta eliminada' },
          401: { description: 'No autenticado' },
          404: { description: 'Tarjeta no encontrada' }
        }
      }
    },
    '/api/listas/{listaId}/tarjetas/{tarjetaId}/move': {
      put: {
        tags: ['Tarjetas'],
        summary: 'Mover tarjeta a otra lista (drag & drop)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'listaId', in: 'path', required: true, schema: { type: 'integer' }, description: 'Lista de origen' },
          { name: 'tarjetaId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nuevaListaId'],
                properties: {
                  nuevaListaId: { type: 'integer', example: 2, description: 'ID de la lista destino' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Tarjeta movida exitosamente', content: { 'application/json': { schema: { $ref: '#/components/schemas/Tarjeta' } } } },
          401: { description: 'No autenticado' },
          404: { description: 'Tarjeta o lista no encontrada' }
        }
      }
    }
  }
};

export default swaggerDefinition;
