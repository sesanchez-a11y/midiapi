const express = require('express');
const { Pool } = require('pg');
const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_F0pdXOqaeGh2@ep-wandering-butterfly-auy3196v-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require"
});

app.post('/registrar_puntaje', async (req, res) => {
  const { 
    nombreUsuario, etnia, curso, institucion, idNivel, 
    fechaInicio, fechaFin, tiempoJuego, estado, correctas, incorrectas, intentos 
  } = req.body;
  
  try {
    // 1. Insertar o buscar Escuela (Usamos el nombre como código único para la prueba)
    const escuelaRes = await pool.query(
      'INSERT INTO public.escuela (nombre, codigo) VALUES ($1, $1) ON CONFLICT (codigo) DO UPDATE SET nombre = EXCLUDED.nombre RETURNING id',
      [institucion]
    );
    const idEscuela = escuelaRes.rows[0].id;

    // 2. Insertar o buscar el Curso (Room)
    const roomRes = await pool.query(
      'INSERT INTO public.room (nombre, id_escuela) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING id',
      [curso, idEscuela]
    );
    // Si el room ya existía, lo buscamos
    let idRoom = roomRes.rows[0]?.id;
    if (!idRoom) {
        const existingRoom = await pool.query('SELECT id FROM public.room WHERE nombre = $1 AND id_escuela = $2', [curso, idEscuela]);
        idRoom = existingRoom.rows[0].id;
    }

    // 3. Insertar al Jugador (Creamos uno nuevo siempre para que veas tus pruebas)
    const jugadorRes = await pool.query(
      'INSERT INTO public.jugador (nombre, avatar, id_room, id_escuela) VALUES ($1, $2, $3, $4) RETURNING id',
      [nombreUsuario, etnia, idRoom, idEscuela]
    );
    const idUsuario = jugadorRes.rows[0].id;

    // 4. Asegurar que el nivel exista (Evita el error de llave foránea)
    await pool.query(
      'INSERT INTO public.nivel (id, nombre, id_chapter, id_learning) VALUES ($1, $2, 1, 1) ON CONFLICT (id) DO NOTHING',
      [idNivel, `Juego ${idNivel}`]
    );

    // 5. INSERTAR EN NIVEL_USUARIO (Aquí es donde se guarda el progreso)
    const queryFinal = `
      INSERT INTO public.nivel_usuario 
      (id_usuario, id_nivel, fecha_inicio, fecha_fin, tiempo_juego, estado, correctas, incorrectas, intentos) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;
    const valoresFinales = [idUsuario, idNivel, fechaInicio, fechaFin, tiempoJuego, estado, correctas, incorrectas, intentos];
    
    await pool.query(queryFinal, valoresFinales);

    res.status(200).json({ message: "¡Datos guardados en nivel_usuario!", id_generado: idUsuario });
  } catch (err) {
    console.error("ERROR EN SQL:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor listo en puerto ${PORT}`));
