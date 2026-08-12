const express = require('express');
const { Pool } = require('pg');
const app = express();
app.use(express.json());

// Tu cadena de conexión de Neon DB
const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_F0pdXOqaeGh2@ep-wandering-butterfly-auy3196v-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require"
});

app.post('/registrar_puntaje', async (req, res) => {
  const { idEstudiante, idNivel, puntaje, completado } = req.body;
  try {
    await pool.query(
      'INSERT INTO puntajes (id_estudiante, id_nivel, puntaje, completado) VALUES ($1, $2, $3, $4)',
      [idEstudiante, idNivel, puntaje, completado]
    );
    res.status(200).json({ message: "Guardado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en la base de datos" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));