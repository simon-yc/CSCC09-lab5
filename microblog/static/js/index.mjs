import {
  getMessages,
  addMessage,
  deleteMessage,
  getUsers,
  upvoteMessage,
  downvoteMessage,
} from "./api.mjs";

function onError(err) {
  console.error("[error]", err);
  let error_box = document.querySelector("#error_box");
  error_box.innerHTML = err;
  error_box.style.visibility = "visible";
}

function updateVotes(message) {
  document.querySelector("#msg" + message._id + " .upvote-icon").innerHTML =
    message.upvote;
  document.querySelector("#msg" + message._id + " .downvote-icon").innerHTML =
    message.downvote;
}

function updateMessages() {
  document.querySelector("#messages").innerHTML = "";
  getMessages(0, function (err, messages) {
    if (err) return onError(err);
    messages.forEach(function (message) {
      const elmt = document.createElement("div");
      elmt.className = "message";
      elmt.id = "msg" + message._id;
      elmt.innerHTML = `
                <div class="message_user">
                    <img class="message_picture" src="media/user.png" alt="${message.username}">
                    <div class="message_username">${message.username}</div>
                </div>
                <div class="message_content">${message.content}</div>
                <div class="upvote-icon icon">${message.upvote}</div>
                <div class="downvote-icon icon">${message.downvote}</div>
                <div class="delete-icon icon"></div>
            `;
      elmt.querySelector(".delete-icon").addEventListener("click", function () {
        deleteMessage(message._id, function (err) {
          if (err) return onError(err);
          return updateMessages();
        });
      });
      elmt.querySelector(".upvote-icon").addEventListener("click", function () {
        upvoteMessage(message._id, function (err, msg) {
          if (err) return onError(err);
          return updateVotes(msg);
        });
      });
      elmt
        .querySelector(".downvote-icon")
        .addEventListener("click", function () {
          downvoteMessage(message._id, function (err, msg) {
            if (err) return onError(err);
            return updateVotes(msg);
          });
        });
      document.querySelector("#messages").append(elmt);
    });
  });
}

updateMessages();

getUsers(function (err, usernames) {
  if (err) return onError(err);
  if (usernames.length === 0)
    document.querySelector("#welcome_message").classList.remove("hidden");
  else {
    usernames.forEach(function (username) {
      const elmt = document.createElement("option");
      elmt.value = username;
      elmt.innerHTML = username;
      document.querySelector("#post_username").append(elmt);
    });
    document.querySelector("#create_message_form").classList.remove("hidden");
  }
});

document
  .querySelector("#create_message_form")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.querySelector("#post_username").value;
    const content = document.querySelector("#post_content").value;
    document.getElementById("create_message_form").reset();
    addMessage(username, content, function (err) {
      if (err) return onError(err);
      return updateMessages();
    });
  });
