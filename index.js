const express = require('express');
const { Pool } = require('pg');
const app = express();
app.use(express.json());

// Tu cadena de conexión de Neon DB
const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_F0pdXOqaeGh2@ep-wandering-butterfly-auy3196v-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require"
});

app.post('/registrar_puntaje', async (req, res) => {
  // Recibimos los datos desde Android (coinciden con tu GameScoreRequest de Kotlin)
  const { 
    idUsuario, 
    idNivel, 
    fechaInicio, 
    fechaFin, 
    tiempoJuego, 
    estado, 
    correctas, 
    incorrectas, 
    intentos 
  } = req.body;
  
  try {
    const query = `
      INSERT INTO public.nivel_usuario 
      (id_usuario, id_nivel, fecha_inicio, fecha_fin, tiempo_juego, estado, correctas, incorrectas, intentos) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;
    const values = [idUsuario, idNivel, fechaInicio, fechaFin, tiempoJuego, estado, correctas, incorrectas, intentos];
    
    await pool.query(query, values);
    res.status(200).json({ message: "¡Guardado exitoso en nivel_usuario!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en base de datos: " + err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
