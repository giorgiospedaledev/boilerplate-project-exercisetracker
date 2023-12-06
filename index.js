const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const User = require("./models/User");
const Exercise = require("./models/Exercise");

const main = async () => {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });
};

main().catch((e) => console.log(e));

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser());
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

const parseUser = async (req, res, next) => {
  const {_id } = req.params;
  if (!_id) {
    res.json({error: "invalid user id"});
    return;
  }

  const user = await User.findById(_id);
  if (!user) {
    res.json({error: "User not found"});
    return;
  }

  req.user = user;
  next();
}

const validateDescription = (req, res, next) => {
  const description = req.body.description;
  if (!description) {
    res.json({
      error: "A description is required"
    });
    return;
  }
  req.desc = description;
  next();
}

const validateDuration = (req, res, next) => {
  const duration = req.body.duration;

  
  if (!duration) {
    res.json({
      error: "A duration is required"
    });
    return;
  }

  if (isNaN(Number.parseInt(duration))) {
    res.json({
      error: "duration must be a number"
    });
    return;
  }
  req.duration = duration;
  next();
}

app.post("/api/users/:_id/exercises", validateDescription, validateDuration, parseUser, async (req, res) => {
  const desc = req.desc;
  const dur = req.duration;
  const date = req.body.date;
  const user = req.user;
  

  const exercise = new Exercise({
    description: desc,
    duration: dur,
    date: date ? new Date(date) : new Date(),
    user: user._id
  })

  await exercise.save();
  await User.findOneAndUpdate(
    user._id,
    {$push: {exercises: exercise._id}},
    {new : true}
  );

  
  res.json({
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date.toDateString(),
    _id: user._id
  })
});

app.get("/api/users/:_id/logs", parseUser, async (req, res) => {
  const user = req.user;
  const {from,to, limit } = req.query;
  const query = { user: user._id};
  if (from) 
    query.date = {$gte: new Date(from).toDateString()};
  if (to)
    query.date = {...query.date, $lte: new Date(to).toDateString()};


    
  const exercises = await Exercise.find(query).limit(limit || 0).exec();
  
  
  res.json({
    username: user.username,
    _id: user._id,
    count: exercises.length,
    log: exercises.map((ex) => ({
      description: ex.description,
      duration: ex.duration,
      date: ex.date.toDateString()
    }))
  })

});

const parseUsername = (req, res, next) => {
  const { username } = req.body;
  if (!username) {
    res.json({
      error: "You must supply a username",
    });
    return;
  }

  req.username = username;
  next();
};

app.post("/api/users", parseUsername, async (req, res) => {
  const user = new User({
    username: req.username
  });
  await user.save();
  res.json({
    username: user.username,
    _id: user._id
  })
});

app.get("/api/users", async (req, res) => {
    const users = await User.find({});
    res.json(
      users.map(user => ({username: user.username, _id: user._id}))
    )
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

