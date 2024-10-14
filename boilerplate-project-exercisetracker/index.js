const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const { Schema } = mongoose;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const UserSchema = new Schema({
  username: String,
});
const User = mongoose.model("User", UserSchema);

const ExerciseSchema = new Schema({
  user_id: { type: String, required: true },
  description: String,
  duration: Number,
  date: Date,
});
const Exercise = mongoose.model("Exercise", ExerciseSchema);

app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Crear un nuevo usuario
app.post("/api/users", async (req, res) => {
  const userObj = new User({
    username: req.body.username
  });

  try {
    const user = await userObj.save();
    res.json({ username: user.username, _id: user._id });
  } catch (err) {
    console.log(err);
    res.status(500).send("Error al crear usuario");
  }
});

// Obtener todos los usuarios
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error al obtener usuarios");
  }
});

// Agregar un ejercicio a un usuario
app.post("/api/users/:_id/exercises", async (req, res) => {
  const id = req.params._id;
  const { description, duration, date } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send("Could not find user");
    } else {
      const exerciseObj = new Exercise({
        user_id: user._id,
        description,
        duration: parseInt(duration),
        date: date ? new Date(date) : new Date()
      });
      const exercise = await exerciseObj.save();
      res.json({
        _id: user._id,
        username: user.username,
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date.toDateString()
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("There was an error saving the exercise");
  }
});

// Obtener el log de ejercicios de un usuario
app.get("/api/users/:_id/logs", async (req, res) => {
  const id = req.params._id;
  const { from, to, limit } = req.query;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send("Could not find user");
    }

    const filter = { user_id: user._id };
    if (from) filter.date = { $gte: new Date(from) };
    if (to) filter.date = { $lte: new Date(to) };

    const exercises = await Exercise.find(filter).limit(parseInt(limit)).exec();
    res.json({
      _id: user._id,
      username: user.username,
      count: exercises.length,
      log: exercises.map(ex => ({
        description: ex.description,
        duration: ex.duration,
        date: ex.date.toDateString()
      }))
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("There was an error retrieving the log");
  }
});

// Iniciar el servidor
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
