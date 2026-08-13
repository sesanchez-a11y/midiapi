const express = require('express'); // <--- ESTO ES VITAL
const { Pool } = require('pg');
const app = express(); // <--- ESTO DEFINE "app"

app.use(express.json());

// Conexión a Neon
const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_F0pdXOqaeGh2@ep-wandering-butterfly-auy3196v-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require"
});

app.post('/registrar_puntaje', async (req, res) => {
  const { 
    nombreUsuario, etnia, curso, institucion, idNivel, 
    fechaInicio, fechaFin, tiempoJuego, estado, correctas, incorrectas, intentos 
  } = req.body;
  
  try {
    // 1. Insertar Escuela
    const escuelaRes = await pool.query(
      'INSERT INTO public.escuela (nombre, codigo) VALUES ($1, $1) ON CONFLICT (codigo) DO UPDATE SET nombre = EXCLUDED.nombre RETURNING id',
      [institucion]
    );
    const idEscuela = escuelaRes.rows[0].id;

    // 2. Insertar Room
    const roomRes = await pool.query(
      'INSERT INTO public.room (nombre, id_escuela) VALUES ($1, $2) RETURNING id',
      [curso, idEscuela]
    );
    const idRoom = roomRes.rows[0].id;

    // 3. Insertar Jugador
    const jugadorRes = await pool.query(
      'INSERT INTO public.jugador (nombre, avatar, id_room, id_escuela) VALUES ($1, $2, $3, $4) RETURNING id',
      [nombreUsuario, etnia, idRoom, idEscuela]
    );
    const idUsuario = jugadorRes.rows[0].id;

    // 4. Insertar Puntaje
    await pool.query(
      `INSERT INTO public.nivel_usuario 
      (id_usuario, id_nivel, fecha_inicio, fecha_fin, tiempo_juego, estado, correctas, incorrectas, intentos) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [idUsuario, idNivel, fechaInicio, fechaFin, tiempoJuego, estado, correctas, incorrectas, intentos]
    );

    res.status(200).json({ message: "Guardado con éxito" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message }); // Esto nos dirá el error real en la App
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
