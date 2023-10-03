import { createServer } from "http";
import express from "express";

const PORT = 3000;

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static("static"));

app.use(function (req, res, next) {
  console.log("HTTP request", req.method, req.url, req.body);
  next();
});

const Message = (function () {
  let id = 0;
  return function item(message) {
    this._id = id++;
    this.content = message.content;
    this.username = message.username;
    this.upvote = 0;
    this.downvote = 0;
  };
})();

const messages = [];
const users = {};

// Create

app.post("/api/users/", function (req, res, next) {
  if (req.body.username in users)
    return res
      .status(409)
      .end("Username:" + req.body.username + " already exists");
  users[req.body.username] = req.picture;
  return res.redirect("/");
});

app.post("/api/messages/", function (req, res, next) {
  const message = new Message(req.body);
  messages.unshift(message);
  return res.json(message);
});

// Read

app.get("/api/messages/", function (req, res, next) {
  return res.json(messages.slice(req.query.page * 5, req.query.page * 5 + 5));
});

app.get("/api/users/", function (req, res, next) {
  return res.json(Object.keys(users));
});

// Update

app.patch("/api/messages/:id/", function (req, res, next) {
  const index = messages.findIndex(function (message) {
    return message._id == req.params.id;
  });
  if (index === -1)
    return res
      .status(404)
      .end("Message id:" + req.params.id + " does not exists");
  const message = messages[index];
  switch (req.body.action) {
    case "upvote":
      message.upvote += 1;
      break;
    case "downvote":
      message.downvote += 1;
      break;
  }
  return res.json(message);
});

// Delete

app.delete("/api/messages/:id/", function (req, res, next) {
  const index = messages.findIndex(function (message) {
    return message._id == req.params.id;
  });
  if (index === -1)
    return res
      .status(404)
      .end("Message id:" + req.params.id + " does not exists");
  const message = messages[index];
  messages.splice(index, 1);
  return res.json(message);
});

export const server = createServer(app).listen(PORT, function (err) {
  if (err) console.log(err);
  else console.log("HTTP server on http://localhost:%s", PORT);
});
