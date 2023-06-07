const request = require("supertest");

const server = require("../server");
const testUtils = require('../test-utils');

// const Membership = require('../models/membership');

describe("/membership", () => {
  beforeAll(testUtils.connectDB);
  afterAll(testUtils.stopDB);
  afterEach(testUtils.clearDB);

  describe('Before login', () => {
    describe('GET /', () => {
      beforeEach(async () => {
      });
      afterEach(async () => {
      });

      it('should get all members of a club, if regular user', async () => {
        const res = await request(server)
          //.get("/club/:clubId/membership")
          .get("/club/"+ +"/membership")
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject([item0, item1]);
      });
      it('should not get all requests of a club, if not signed in as admin', async () => {
        const res = await request(server)
          //.get("/club/:clubId/membership")
          .get("/club/"+ +"/membership")
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject([item0, item1]);
      });
    });

    describe('GET /:id', () => {
      let savedItems;

      beforeEach(async () => {
        savedItems = await Item.insertMany([item0, item1]);
      });

      it('should return item0', async () => {
        const res = await request(server)
          .get("/items/" + savedItems[0]._id)
          .send();
        expect(res.statusCode).toEqual(200);
        const expected = savedItems[0].toJSON();
        expected._id = expected._id.toString();
        expect(res.body).toMatchObject(expected);
      });

      it('should return item1', async () => {
        const res = await request(server)
          .get("/items/" + savedItems[1]._id)
          .send();
        expect(res.statusCode).toEqual(200);
        const expected = savedItems[1].toJSON();
        expected._id = expected._id.toString();
        expect(res.body).toMatchObject(expected);
      });

      it('should return 404 if no match', async () => {
        await Item.deleteOne({ _id: savedItems[1]._id })
        const res = await request(server)
          .get("/items/" + savedItems[1]._id)
          .send();
        expect(res.statusCode).toEqual(404);
      });
    });

    describe('POST /:id', () => {
      it('should create item0', async () => {
        const res = await request(server)
          .post("/items")
          .send(item0);
        expect(res.statusCode).toEqual(200);
        const storedItem = await Item.findOne().lean()
        expect(storedItem).toMatchObject(item0);
      });

      it('should create item1', async () => {
        const res = await request(server)
          .post("/items")
          .send(item1);
        expect(res.statusCode).toEqual(200);
        const storedItem = await Item.findOne().lean()
        expect(storedItem).toMatchObject(item1);
      });
    });

    describe('POST /', () => {
      it('should create item0', async () => {
        const res = await request(server)
          .post("/items")
          .send(item0);
        expect(res.statusCode).toEqual(200);
        const storedItem = await Item.findOne().lean()
        expect(storedItem).toMatchObject(item0);
      });

      it('should create item1', async () => {
        const res = await request(server)
          .post("/items")
          .send(item1);
        expect(res.statusCode).toEqual(200);
        const storedItem = await Item.findOne().lean()
        expect(storedItem).toMatchObject(item1);
      });
    });

    describe('DELETE /', () => {
      it('should create item0', async () => {
        const res = await request(server)
          .post("/items")
          .send(item0);
        expect(res.statusCode).toEqual(200);
        const storedItem = await Item.findOne().lean()
        expect(storedItem).toMatchObject(item0);
      });

      it('should create item1', async () => {
        const res = await request(server)
          .post("/items")
          .send(item1);
        expect(res.statusCode).toEqual(200);
        const storedItem = await Item.findOne().lean()
        expect(storedItem).toMatchObject(item1);
      });
    });
  })
  describe('Before login', () => {
    describe('GET /', () => {
      beforeAll(async () => {
        await Item.insertMany([item0, item1]);
      });

      it('should return all stored items', async () => {
        const res = await request(server)
          .get("/items")
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject([item0, item1]);
      });
    });

    describe('GET /:id', () => {
      let savedItems;

      beforeEach(async () => {
        savedItems = await Item.insertMany([item0, item1]);
      });

      it('should return item0', async () => {
        const res = await request(server)
          .get("/items/" + savedItems[0]._id)
          .send();
        expect(res.statusCode).toEqual(200);
        const expected = savedItems[0].toJSON();
        expected._id = expected._id.toString();
        expect(res.body).toMatchObject(expected);
      });

      it('should return item1', async () => {
        const res = await request(server)
          .get("/items/" + savedItems[1]._id)
          .send();
        expect(res.statusCode).toEqual(200);
        const expected = savedItems[1].toJSON();
        expected._id = expected._id.toString();
        expect(res.body).toMatchObject(expected);
      });

      it('should return 404 if no match', async () => {
        await Item.deleteOne({ _id: savedItems[1]._id })
        const res = await request(server)
          .get("/items/" + savedItems[1]._id)
          .send();
        expect(res.statusCode).toEqual(404);
      });
    });

    describe('POST /:id', () => {
      it('should create item0', async () => {
        const res = await request(server)
          .post("/items")
          .send(item0);
        expect(res.statusCode).toEqual(200);
        const storedItem = await Item.findOne().lean()
        expect(storedItem).toMatchObject(item0);
      });

      it('should create item1', async () => {
        const res = await request(server)
          .post("/items")
          .send(item1);
        expect(res.statusCode).toEqual(200);
        const storedItem = await Item.findOne().lean()
        expect(storedItem).toMatchObject(item1);
      });
    });

    describe('POST /', () => {
      it('should create item0', async () => {
        const res = await request(server)
          .post("/items")
          .send(item0);
        expect(res.statusCode).toEqual(200);
        const storedItem = await Item.findOne().lean()
        expect(storedItem).toMatchObject(item0);
      });

      it('should create item1', async () => {
        const res = await request(server)
          .post("/items")
          .send(item1);
        expect(res.statusCode).toEqual(200);
        const storedItem = await Item.findOne().lean()
        expect(storedItem).toMatchObject(item1);
      });
    });

    describe('DELETE /', () => {
      it('should create item0', async () => {
        const res = await request(server)
          .post("/items")
          .send(item0);
        expect(res.statusCode).toEqual(200);
        const storedItem = await Item.findOne().lean()
        expect(storedItem).toMatchObject(item0);
      });

      it('should create item1', async () => {
        const res = await request(server)
          .post("/items")
          .send(item1);
        expect(res.statusCode).toEqual(200);
        const storedItem = await Item.findOne().lean()
        expect(storedItem).toMatchObject(item1);
      });
    });
  })
});