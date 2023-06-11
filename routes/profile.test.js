// every operator has a profile
// profiles can be viewed by anyone
// only admin can create a profile
// an operator can change their own address
const request = require("supertest");

const server = require("../server");
const testUtils = require('../test-utils');

const User = require('../models/user');
const Profile = require('../models/profile');

describe("/profile", () => {
  beforeAll(testUtils.connectDB);
  afterAll(testUtils.stopDB);
  afterEach(testUtils.clearDB);

  const profile0 = { 
    name: 'Operator One', 
    address: '76 Lucy Drive, Seattle, WA, 98166',
    callSign: 'KJYNON',
    licenseClass: 'general'
  };
  // user1 will be associated with profile1 and be ADMIN
  const profile1 = { 
    name: 'Operator Two', 
    address: '76 Pearcy Ave, Kirkland, WA, 98199',
    callSign: 'KJJJRR',
    licenseClass: 'amateur'
  };
  const updateAddress0 = {
    address: '100th ave SW, San Diego, CA 91116'
  }
  const updateName0 = {
    name: 'Should N. Work'
  }
  const updateCallSign1 = {
    callSign: 'VANITY'
  }
  describe('Before login', () => {
    describe('POST /', () => {
      it('should send 401 without a token', async () => {
        const res = await request(server).post("/profile").send(profile0);
        expect(res.statusCode).toEqual(401);
      });
      it('should send 401 with a bad token', async () => {
        const res = await request(server)
          .post("/profile")
          .set('Authorization', 'Bearer BAD')
          .send(profile0);
        expect(res.statusCode).toEqual(401);
      });
    });
    describe('POST /:id', () => {
      it('should send 401 without a token', async () => {
        const res = await request(server).post("/profile/123").send(profile0);
        expect(res.statusCode).toEqual(401);
      });
      it('should send 401 with a bad token', async () => {
        const res = await request(server)
          .post("/profile/456")
          .set('Authorization', 'Bearer BAD')
          .send();
        expect(res.statusCode).toEqual(401);
      });
    });
    describe('GET /', () => {
      it('should send 200 without a token', async () => {
        const res = await request(server).get("/profile").send(profile0);
        expect(res.statusCode).toEqual(200);
      });
      it('should send 200 with a bad token', async () => {
        const res = await request(server)
          .get("/profile")
          .set('Authorization', 'Bearer BAD')
          .send();
        expect(res.statusCode).toEqual(200);
      });
    });
  
  });

  describe('after login', () => {
    const user0 = {
      email: 'user2@mail.com',
      password: '123password'
    };
    const user1 = {
      email: 'user3@mail.com',
      password: '456password'
    }
    let token0;
    let adminToken;
    let testProf0;
    let testProf1;
    
    beforeEach(async () => {
      await request(server).post("/login/signup").send(user0);
      const res0 = await request(server).post("/login").send(user0);
      token0 = res0.body.token;
      await request(server).post("/login/signup").send(user1);
      await User.updateOne({ email: user1.email }, { $push: { roles: 'admin'} });
      const res1 = await request(server).post("/login").send(user1);
      adminToken = res1.body.token;

      // associate profile0 with user0 and profile1 with user1
      const userId0 = (await User.findOne({ email: user0.email }))._id.toString();
      const userId1 = (await User.findOne({ email: user1.email }))._id.toString();
      profile0.userId = userId0;
      profile1.userId = userId1;
    
      // console.log("profile1, ", profile1);
      testProfile0 = await Profile.create(profile0);
      testProfile1 = await Profile.create(profile1);
      //profiles = (await Profile.insertMany([profile0, profile1])).map(i => i.toJSON());
      // console.log('IIIIN TEST', testProfile1);
    });
    afterEach(async () => {
      await Profile.deleteMany({});
    });
    describe("POST /:id", () => {
      
      beforeEach(async () => {
        //await request(server).post("/login/signup").send(user0);
        //const res0 = await request(server).post("/login").send(user0);
        //token0 = res0.body.token;
        //await request(server).post("/login/signup").send(user1);
        //await User.updateOne({ email: user1.email }, { $push: { roles: 'admin'} });
        //const res1 = await request(server).post("/login").send(user1);
        //adminToken = res1.body.token;
  
        // associate profile0 with user0 and profile1 with user1
        const userId0 = (await User.findOne({ email: user0.email }))._id.toString();
        const userId1 = (await User.findOne({ email: user1.email }))._id.toString();
        profile0.userId = userId0;
        profile1.userId = userId1;

        // console.log('TEST profile0: ', profile0);
        // console.log('TEST profile1: ', profile1);

        testProf0 = await Profile.create(profile0);
        testProf1 = await Profile.create(profile1);
        
        // console.log('TEST created testProf0: ', testProf0);
        // console.log('TEST created testProf1: ', testProf1);
      });
      afterEach(async () => {
        await Profile.deleteMany({});
      });
      it('should send 200 to an admin and update a profile', async () => {
        // console.log('TESTPROF0._id ', testProf0._id.toString());
        // console.log('TEST admin token ', adminToken);
        const res = await request(server)
          .post("/profile/" + testProf0._id.toString())
          .set('Authorization', 'Bearer ' + adminToken)
          .send(updateCallSign1);
        expect(res.statusCode).toEqual(200);
        expect(res.body.callSign).toEqual('VANITY');
      });
      it('should send 401 to non-admin user trying to update the wrong profile', async () => {
        const res = await request(server)
          .post("/profile/" + testProf1._id.toString())
          .set('Authorization', 'Bearer ' + token0)
          .send(updateCallSign1);
        expect(res.statusCode).toEqual(401);
      });
      it('should send 401 to the correct user trying to update something other than address', async () => {
        const res = await request(server)
          .post("/profile/" + testProf0._id.toString())
          .set('Authorization', 'Bearer ' + token0)
          .send(updateName0);
          //console.log('IN TEST NAME: ', res.body.name);
        expect(res.statusCode).toEqual(401);
      });
      it('should send 200 to the correct user trying to update an address', async () => {
        const res = await request(server)
          .post("/profile/" + testProf0._id.toString())
          .set('Authorization', 'Bearer ' + token0)
          .send(updateAddress0);
        expect(res.statusCode).toEqual(200);
      });
    });

    describe("POST /", () => {
      it('should send 200 to an admin and create a profile', async () => {
        const res = await request(server)
          .post("/profile")
          .set('Authorization', 'Bearer ' + adminToken)
          .send(profile1);
        expect(res.statusCode).toEqual(200);
        // const storedProfile = await Profile.findOne().lean();
        // const storedProfile = await Profile.findById(profile1.userId).lean();
        // console.log('res.body, ', res.body);
        // console.log('testProfile, ', testProfile1);
        expect(res.body.userId).toEqual(testProfile1.userId.toString());
        expect(res.body.name).toEqual(testProfile1.name);
        expect(res.body.address).toEqual(testProfile1.address);
        expect(res.body.callSign).toEqual(testProfile1.callSign);
        expect(res.body.licenseClass).toEqual(testProfile1.licenseClass);
      });
      it('should send 401 to non-admin user', async () => {
        const res = await request(server)
          .post("/profile")
          .set('Authorization', 'Bearer ' + token0)
          .send(profile0);
        expect(res.statusCode).toEqual(401);
      });
    });

    

    /*
    describe("GET /:id", () => {
      let order0Id, order1Id;
      beforeEach(async () => {
        const res0 = await request(server)
          .post("/orders")
          .set('Authorization', 'Bearer ' + token0)
          .send([items[0], items[1], items[1]].map(i => i._id));
        order0Id = res0.body._id;
        const res1 = await request(server)
          .post("/orders")
          .set('Authorization', 'Bearer ' + adminToken)
          .send([items[1]].map(i => i._id));
        order1Id = res1.body._id;
      });
      it('should send 200 to normal user with their order', async () => {
        const res = await request(server)
          .get("/orders/" + order0Id)
          .set('Authorization', 'Bearer ' + token0)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject({
          items: [item0, item1, item1],
          userId: (await User.findOne({ email: user0.email }))._id.toString(),
          total: 34
        });
      });
      it("should send 404 to normal user with someone else's order", async () => {
        const res = await request(server)
          .get("/orders/" + order1Id)
          .set('Authorization', 'Bearer ' + token0)
          .send();
        expect(res.statusCode).toEqual(404);
      });
      it("should send 200 to admin user with their order", async () => {
        const res = await request(server)
          .get("/orders/" + order1Id)
          .set('Authorization', 'Bearer ' + adminToken)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject({
          items: [item1],
          userId: (await User.findOne({ email: user1.email }))._id.toString(),
          total: 12
        });
      });
      it("should send 200 to admin user with someone else's order", async () => {
        const res = await request(server)
          .get("/orders/" + order0Id)
          .set('Authorization', 'Bearer ' + adminToken)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject({
          items: [item0, item1, item1],
          userId: (await User.findOne({ email: user0.email }))._id.toString(),
          total: 34
        });
      });
    });
    describe("GET /", () => {
      let order0Id, order1Id;
      beforeEach(async () => {
        const res0 = await request(server)
          .post("/orders")
          .set('Authorization', 'Bearer ' + token0)
          .send(items.map(i => i._id));
        order0Id = res0.body._id;
        const res1 = await request(server)
          .post("/orders")
          .set('Authorization', 'Bearer ' + adminToken)
          .send([items[1]].map(i => i._id));
        order1Id = res1.body._id;
      });
      it('should send 200 to normal user with their one order', async () => {
        const res = await request(server)
          .get("/orders")
          .set('Authorization', 'Bearer ' + token0)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject([{
          items: [items[0]._id.toString(), items[1]._id.toString()],
          userId: (await User.findOne({ email: user0.email }))._id.toString(),
          total: 22
        }]);
      });
      it("should send 200 to admin user all orders", async () => {
        const res = await request(server)
          .get("/orders")
          .set('Authorization', 'Bearer ' + adminToken)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject([
          {
            items: [items[0]._id.toString(), items[1]._id.toString()],
            userId: (await User.findOne({ email: user0.email }))._id.toString(),
            total: 22
          },
          {
            items: [items[1]._id.toString()],
            userId: (await User.findOne({ email: user1.email }))._id.toString(),
            total: 12
          }
        ]);
      });
    });
    */
  });
});