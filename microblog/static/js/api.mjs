function send(method, url, data, callback) {
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (xhr.status !== 200)
      callback("[" + xhr.status + "]" + xhr.responseText, null);
    else callback(null, JSON.parse(xhr.responseText));
  };
  xhr.open(method, url, true);
  if (!data) xhr.send();
  else {
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(data));
  }
}

export function addMessage(username, content, callback) {
  send(
    "POST",
    "/api/messages/",
    { username: username, content: content },
    function (err, res) {
      if (err) return callback(err);
      else return callback(null);
    },
  );
}

export function deleteMessage(messageId, callback) {
  send("DELETE", "/api/messages/" + messageId + "/", null, function (err, res) {
    if (err) return callback(err);
    else return callback(null);
  });
}

export function upvoteMessage(messageId, callback) {
  send(
    "PATCH",
    "/api/messages/" + messageId + "/",
    { action: "upvote" },
    function (err, msg) {
      if (err) return callback(err, null);
      else return callback(null, msg);
    },
  );
}

export function downvoteMessage(messageId, callback) {
  send(
    "PATCH",
    "/api/messages/" + messageId + "/",
    { action: "downvote" },
    function (err, msg) {
      if (err) return callback(err, null);
      else return callback(null, msg);
    },
  );
}

export function getMessages(page, callback) {
  send("GET", "/api/messages/?page=" + page, null, callback);
}

export function getUsers(callback) {
  send("GET", "/api/users/", null, callback);
}
