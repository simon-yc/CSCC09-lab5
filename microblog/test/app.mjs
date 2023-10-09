import chai from "chai";
import chaiHttp from "chai-http";
import { server, createTestDb, deleteTestDb } from "../app.mjs";

const expect = chai.expect;
chai.use(chaiHttp);

describe("User and Message API Testing", () => {
  before(function () {
    createTestDb();
  });

  after(function () {
    deleteTestDb();
    server.close();
  });

  // Test cases for User APIs
  describe("User API", () => {
    it("should create a user with a profile picture", function (done) {
      chai
        .request(server)
        .post("/api/users/")
        .field("username", "testuser")
        .attach("picture", "test/picture/test-picture.png")
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res).to.redirect;
          done();
        });
    });

    it("should retrieve a list of users", function (done) {
      chai
        .request(server)
        .get("/api/users/")
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("array");
          done();
        });
    });

    it("should retrieve a user's profile picture", function (done) {
      chai
        .request(server)
        .get("/api/users/testuser/profile/picture/")
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res).to.have.header("content-type");
          done();
        });
    });
  });

  // Test cases for Message APIs
  describe("Message API", () => {
    let messageId;

    it("should create a message", function (done) {
      const newMessage = {
        content: "Test message",
        username: "testuser",
      };
      chai
        .request(server)
        .post("/api/messages/")
        .send(newMessage)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("content", "Test message");
          expect(res.body).to.have.property("username", "testuser");
          messageId = res.body._id;
          done();
        });
    });

    it("should retrieve a list of messages", function (done) {
      chai
        .request(server)
        .get("/api/messages/")
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("array");
          done();
        });
    });

    it("should upvote a message", function (done) {
      chai
        .request(server)
        .patch(`/api/messages/${messageId}/`)
        .send({ action: "upvote" })
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("upvote", 1);
          done();
        });
    });

    it("should downvote a message", function (done) {
      chai
        .request(server)
        .patch(`/api/messages/${messageId}/`)
        .send({ action: "downvote" })
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("downvote", 1);
          done();
        });
    });

    it("should delete a message", function (done) {
      chai
        .request(server)
        .delete(`/api/messages/${messageId}/`)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("content", "Test message");
          expect(res.body).to.have.property("username", "testuser");
          done();
        });
    });
  });
});
