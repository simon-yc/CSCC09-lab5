import { createServer } from "http";
import express from "express";
import Datastore from "nedb";
import multer from "multer";
import { rmSync } from "fs";

const PORT = 3000;

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static("static"));

app.use(function (req, res, next) {
  console.log("HTTP request", req.method, req.url, req.body);
  next();
});

let messages = new Datastore({
  filename: "db/messages.db",
  autoload: true,
  timestampData: true,
});
let users = new Datastore({ filename: "db/users.db", autoload: true });

const upload = multer({ dest: "uploads/" });

// Create

app.post("/api/users/", upload.single("picture"), function (req, res, next) {
  users.findOne({ username: req.body.username }, function (err, user) {
    if (err) return res.status(500).end(err);
    if (user)
      return res
        .status(409)
        .end("Username:" + req.body.username + " already exists");

    if (!req.file) return res.status(400).end("No picture uploaded");
    users.insert(
      { username: req.body.username, picture: req.file },
      function (err, user) {
        if (err) return res.status(500).end(err);
        return res.redirect("/");
      }
    );
  });
});

app.post("/api/messages/", function (req, res, next) {
  users.findOne({ username: req.body.username }, function (err, user) {
    if (err) res.status(500).end(err);
    if (!user)
      return res
        .status(404)
        .end("Username:" + req.body.username + " does not exist");
    messages.insert(
      {
        content: req.body.content,
        username: req.body.username,
        upvote: 0,
        downvote: 0,
      },
      function (err, message) {
        if (err) return res.status(500).end(err);
        return res.json(message);
      }
    );
  });
});

// Read

app.get("/api/messages/", function (req, res, next) {
  messages
    .find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .exec(function (err, messages) {
      if (err) return res.status(500).end(err);
      return res.json(messages);
    });
});

app.get("/api/users/", function (req, res, next) {
  users.find({}).exec(function (err, users) {
    if (err) return res.status(500).end(err);
    let usernames = users.map((user) => user.username);
    return res.json(usernames);
  });
});

app.get("/api/users/:username/profile/picture/", function (req, res, next) {
  users.findOne({ username: req.params.username }, function (err, user) {
    if (err) return res.status(500).end(err);
    if (!user)
      return res
        .status(404)
        .end("Username:" + req.params.username + " does not exist");
    res.setHeader("Content-Type", user.picture.mimetype);
    res.sendFile(user.picture.path, { root: "." });
  });
});

// Update

app.patch("/api/messages/:id/", function (req, res, next) {
  messages.findOne({ _id: req.params.id }, function (err, message) {
    if (err) return res.status(500).end(err);
    if (!message)
      return res
        .status(404)
        .end("Message id #" + req.params.id + " does not exist");
    switch (req.body.action) {
      case "upvote":
        message.upvote++;
        break;
      case "downvote":
        message.downvote++;
        break;
    }

    messages.update({ _id: message._id }, message, {}, function (err, num) {
      if (err) return res.status(500).end(err);
      return res.json(message);
    });
  });
});

// Delete

app.delete("/api/messages/:id/", function (req, res, next) {
  messages.findOne({ _id: req.params.id }, function (err, message) {
    if (err) return res.status(500).end(err);
    if (!message)
      return res
        .status(404)
        .end("Message id #" + req.params.id + " does not exists");
    messages.remove(
      { _id: message._id },
      { multi: false },
      function (err, num) {
        if (err) return res.status(500).end(err);
        return res.json(message);
      }
    );
  });
});

// This is for testing purpose only
export function createTestDb(db) {
  users = new Datastore({
    filename: "testdb/users.db",
    autoload: true,
  });
  messages = new Datastore({
    filename: "testdb/messages.db",
    autoload: true,
    timestampData: true,
  });
}

// This is for testing purpose only
export function deleteTestDb(db) {
  rmSync("testdb", { recursive: true, force: true });
}

// This is for testing purpose only
export function getUsers(callback) {
  return users
    .find({})
    .sort({ createdAt: -1 })
    .exec(function (err, users) {
      if (err) return callback(err, null);
      return callback(err, users.reverse());
    });
}

// This is for testing purpose only
export function getMessages(callback) {
  return messages
    .find({})
    .sort({ createdAt: -1 })
    .exec(function (err, messages) {
      if (err) return callback(err, null);
      return callback(err, messages.reverse());
    });
}

export const server = createServer(app).listen(PORT, function (err) {
  if (err) console.log(err);
  else console.log("HTTP server on http://localhost:%s", PORT);
});
