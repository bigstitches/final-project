// every operator has a profile
// profiles can be viewed by anyone
// only admin can create a profile
// an operator can change their own address
const request = require("supertest");

const server = require("../server");
const testUtils = require('../test-utils');

const User = require('../models/user');
const Profile = require('../models/profile');
const Club = require('../models/club');

describe("/profile", () => {

  beforeAll(testUtils.connectDB);
  afterAll(testUtils.stopDB);
  afterEach(testUtils.clearDB);

  const address1 = { 
    address: '1983 44th ave SW', 
    city: 'Mukilteo',
    state: 'WA',
    zip: 98166
  };
  const club1 = { 
    name: 'Highline',
    address: address1,
  };

  const address2 = { 
    address: '900 44th ave N', 
    city: 'Renton',
    state: 'WA',
    zip: 98166
  };
  const club2 = { 
    name: 'Renton',
    address: address2,
  };

  const address3 = { 
    address: '12 West Lane', 
    city: 'Mercer Island',
    state: 'WA',
    zip: 98899
  };
  const club3 = { 
    name: 'Mercer Island',
    address: address3,
  };

  const profile0 = { 
    name: 'Operator One', 
    address: '76 Lucy Drive, Seattle, WA, 98166',
    callSign: 'KJUUHP',
    licenseClass: 'general'
  };
  // user1 will be associated with profile1 and be ADMIN
  const profile1 = { 
    name: 'Operator Two', 
    address: '76 Pearcy Ave, Kirkland, WA, 98199',
    callSign: 'KJOOIN',
    licenseClass: 'amateur'
  };

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
    /*
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
    */
  
  });

  describe('after login', () => {
    const user0 = {
      email: 'user4@mail.com',
      password: '123password'
    };
    const user1 = {
      email: 'user5@mail.com',
      password: '456password'
    }
    let token0;
    let adminToken;
    let testClub1;

    beforeEach(async () => {
      await request(server).post("/login/signup").send(user0);
      const res0 = await request(server).post("/login").send(user0);
      token0 = res0.body.token;
      await request(server).post("/login/signup").send(user1);
      await User.updateOne({ email: user1.email }, { $push: { roles: 'admin'} });
      const res1 = await request(server).post("/login").send(user1);
      adminToken = res1.body.token;

      // associate profile0 with user0 and profile1 with user1
      const userId1 = (await User.findOne({ email: user1.email }))._id.toString();
      const userId2 = (await User.findOne({ email: user0.email }))._id.toString();
      club1.userId = userId1;
      club2.userId = [userId1, userId2];
      club3.userId = userId1;
    
      // console.log("profile1, ", profile1);
      testClub1 = await Club.create(club1);
      //profiles = (await Profile.insertMany([profile0, profile1])).map(i => i.toJSON());
      // console.log('IIIIN TEST', testProfile1);
    });
    /*
    describe("POST /:id", () => {
      let order0Id, order1Id;
      
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
          console.log('IN TEST NAME: ', res.body.name);
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
    */
    describe("POST /", () => {
      it('should send 200 to an admin and create a profile', async () => {
        const res = await request(server)
          .post("/club")
          .set('Authorization', 'Bearer ' + adminToken)
          .send(club1);
        expect(res.statusCode).toEqual(200);
        // const storedProfile = await Profile.findOne().lean();
        // const storedProfile = await Profile.findById(profile1.userId).lean();
        // console.log('IN TEsT res.body, ', res.body);
        // console.log('testProfile, ', testProfile1);
        expect(res.body.userId).toEqual([testClub1.userId.toString()]);
        expect(res.body.name).toEqual(testClub1.name);
        // console.log('IN TEST ', res.body.address)
        expect(res.body.address).toMatchObject({ 
          address: '1983 44th ave SW', 
          city: 'Mukilteo',
          state: 'WA',
          zip: 98166,
          // is this cheating?
          _id: res.body.address._id
        });
      });
      it('should send 401 to non-admin user', async () => {
        const res = await request(server)
          .post("/profile")
          .set('Authorization', 'Bearer ' + token0)
          .send(club1);
        expect(res.statusCode).toEqual(401);
      });
    });

    describe("GET /:id", () => {
      beforeEach(async () => {
        // console.log("TEST ID", testClub1);
        // console.log("STRING ID", testClub1._id.toString());
      });
      it('should send 200 for a valid club', async () => {
        const res = await request(server)
        // .post("/profile/" + testProf0._id.toString())
          .get("/club/" + testClub1._id.toString())
          .send();
        // console.log("200 TEST RES BODY", res.body)
        expect(res.statusCode).toEqual(200);
        expect(res.body.name).toEqual('Highline');
      });
      it('should send 500 for an invalid club', async () => {
        const res = await request(server)
        // .post("/profile/" + testProf0._id.toString())
          .get("/club/" + 'gobbledeegook')
          .send();
        expect(res.statusCode).toEqual(500);
      });
    });
  
    describe("GET /", () => {
      beforeEach(async () => {
        // clean up from previous test
        await Club.deleteMany({});
        // create three clubs
        const testHere = await request(server)
          .post("/club")
          .set('Authorization', 'Bearer ' + adminToken)
          .send(club1);
        await request(server)
          .post("/club")
          .set('Authorization', 'Bearer ' + adminToken)
          .send(club2);
        await request(server)
          .post("/club")
          .set('Authorization', 'Bearer ' + adminToken)
          .send(club3);
      });
      it('should send 200 to any user and return all clubs', async () => {
        const clubsList = [club1, club2, club3];
        const res = await request(server)
          .get("/club")
          .send();
        // console.log("IN TEST RES BODY", res.body)
        expect(res.statusCode).toEqual(200);
        expect(res.body[1]).toMatchObject(clubsList[1]);
        expect(res.body.length).toEqual(3);
      });
    });
  });
});