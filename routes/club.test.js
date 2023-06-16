// every operator has a profile
// profiles can be viewed by anyone
// only admin can create a profile
// an operator can change their own address
const request = require("supertest");
const mongoose = require('mongoose');

const server = require("../server");
const testUtils = require('../test-utils');

const User = require('../models/user');
const Profile = require('../models/profile');
const Club = require('../models/club');
const { ObjectId } = require("mongodb");

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

    // test search (required for project)
    describe("GET /search", () => {
      beforeEach(async () => {
        let idObjectTest = [];
        for (let i = 0; i < 10; i++) {
          idObjectTest[i] = new mongoose.Types.ObjectId();
        }
        const testClubs = [
          { 
            userId: [idObjectTest[0]],
            name: 'Mercer Island',
            address: address1, //Mukilteo
            members: [idObjectTest[0]]
          },
          {
            userId: [idObjectTest[1], idObjectTest[2]],
            name: 'Mercer',
            address: address2, // city Renton
            members: [idObjectTest[2]]
          },
          {
            userId: [idObjectTest[3]],
            name: 'Renton',
            address: address1, //Mukilteo
            members: [idObjectTest[3]]
          },
          {
            userId: [idObjectTest[4]],
            name: 'Highline Island',
            address: address2, // city Renton
            members: [idObjectTest[6], idObjectTest[7], idObjectTest[8]]
          }
        ]
        const clubs = await Club.insertMany(testClubs);
        // console.log(clubs);
      });
      afterEach( async () => {
        await Club.deleteMany();
      });

      it("should return one matching club", async () => {
        const searchTerm = 'Renton'
        const res = await request(server).get("/club/search?query=" + encodeURI(searchTerm));
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toEqual(3);
        expect(res.body[0].address.city).toEqual(searchTerm);
        expect(res.body[1].name).toEqual(searchTerm);
      });
      it("should return two matching clubs sorted by best matching single term", async () => {
        const searchTerm = 'Mercer'
        const res = await request(server).get("/club/search?query=" + encodeURI(searchTerm));
        expect(res.statusCode).toEqual(200);
        expect(res.body[0].name).toEqual('Mercer');
        expect(res.body[1].name).toEqual('Mercer Island');
      });
      it("should return NO clubs", async () => {
        const searchTerm = 'BONKERVILLE'
        const res = await request(server).get("/club/search?query=" + encodeURI(searchTerm));
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toEqual(0);
      });
      it("should return all clubs", async () => {
        const res = await request(server).get("/club/search?query=");
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toEqual(4);
      });
    });

    // test aggregate, required for project
    describe("GET /mostMembers", () => {
      beforeEach(async () => {
        let idObjectTest = [];
        for (let i = 0; i < 10; i++) {
          idObjectTest[i] = new mongoose.Types.ObjectId();
        }
        const testClubs = [
          { 
            userId: [idObjectTest[0]],
            name: 'Cool Club',
            address: address1, //Mukilteo
            members: [idObjectTest[0]]
          },
          {
            userId: [idObjectTest[1], idObjectTest[2]],
            name: 'Members not Added',
            address: address2, //Rengon
            members: [idObjectTest[2], idObjectTest[1]]
          },
          {
            userId: [idObjectTest[3]],
            name: 'Hammy Whammy',
            address: address1, //Mukilteo
            members: [idObjectTest[3]]
          },
          {
            userId: [idObjectTest[4]],
            name: 'BLTs',
            address: address1, //Mukilteo
            members: [idObjectTest[6], idObjectTest[1], idObjectTest[2], idObjectTest[3], idObjectTest[4], idObjectTest[5]]
          }
        ]
        const clubs = await Club.insertMany(testClubs);
      });
      afterEach(async () => {
        // clean up
        await Club.deleteMany({});
      })
      it('should return the club with the most members by city', async () => {
        // const clubsList = await Club.find().lean();
        const searchTerm = 'Mukilteo'
        const res = await request(server)
          .get("/club/mostMembers?query="+ encodeURI(searchTerm))
          .send();
        // console.log('In most members test ', res.body);
        expect(res.statusCode).toEqual(200);
        expect(res.body[0].Name).toEqual('BLTs'); // total clubs
        expect(res.body[0]['Total Members']).toEqual(6); // 3/4 clubs in Mukilteo
        //expect(res.body.length).toEqual(4);
      });
    });
  
    describe("GET /", () => {
      beforeEach(async () => {
        let idObjectTest = [];
        for (let i = 0; i < 10; i++) {
          idObjectTest[i] = new mongoose.Types.ObjectId();
        }
        const testClubs = [
          { 
            userId: [idObjectTest[0]],
            name: 'Mercer Island',
            address: address1,
            members: [idObjectTest[0]]
          },
          {
            userId: [idObjectTest[1], idObjectTest[2]],
            name: 'Mercer',
            address: address2,
            members: [idObjectTest[2]]
          },
          {
            userId: [idObjectTest[3]],
            name: 'Renton',
            address: address1,
            members: [idObjectTest[3]]
          },
          {
            userId: [idObjectTest[4]],
            name: 'Highline Island',
            address: address2,
            members: [idObjectTest[6], idObjectTest[7], idObjectTest[8]]
          }
        ]
        const clubs = await Club.insertMany(testClubs);
      });
      afterEach(async () => {
        // clean up
        await Club.deleteMany({});
      })
      it('should send 200 when not logged in and return clubs', async () => {
        const clubsList = await Club.find().lean();
        const res = await request(server)
          .get("/club")
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body[1].name).toEqual(clubsList[1].name);
        expect(res.body.length).toEqual(4);
      });
    });

    
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
    
    describe("PUT /:id", () => {
      const nameChange = {"name": 'Mercer I-bands'};
      const badData = {'pig': 'pen'};
      
      beforeEach(async () => {
        // associate profile0 with user0 and profile1 with user1
        const userId0 = (await User.findOne({ email: user0.email }))._id.toString();
        const userId1 = (await User.findOne({ email: user1.email }))._id.toString();
        profile0.userId = userId0;
        profile1.userId = userId1;

        testProf0 = await Profile.create(profile0);
        testProf1 = await Profile.create(profile1);
      });
      it('should send 200 to an admin and update a club', async () => {       
        const res = await request(server)
          .put("/club/" + testClub1._id.toString())
          .set('Authorization', 'Bearer ' + adminToken)
          .send(nameChange);
          // console.log('IN TEST NAME: ', res.body);
        expect(res.statusCode).toEqual(200);
        expect(res.body.name).toEqual('Mercer I-bands');
      });
      it('should send 401 to non-admin user trying to update a club', async () => {
        const res = await request(server)
          .put("/club/" + testClub1._id.toString())
          .set('Authorization', 'Bearer ' + token0)
          .send(nameChange);
          // console.log('IN TEST NAME: ', res.body.name);
        expect(res.statusCode).toEqual(401);
      });
      it('should send 401 to admin sending updates to non-existant club', async () => {
        const res = await request(server)
          .put("/club/" + testProf0._id.toString()) // not a club
          .set('Authorization', 'Bearer ' + adminToken)
          .send(nameChange);
        expect(res.statusCode).toEqual(401);
      });
      it('should send 401 to admin sending bad data', async () => {
          const res = await request(server)
            .put("/club/" + testProf0._id.toString()) // not a club
            .set('Authorization', 'Bearer ' + adminToken)
            .send(badData);
        expect(res.statusCode).toEqual(401);
      });
    });
    
    describe("POST /", () => {
      it('should send 200 to an admin and create a profile', async () => {
        const res = await request(server)
          .post("/club")
          .set('Authorization', 'Bearer ' + adminToken)
          .send(club1);
        expect(res.statusCode).toEqual(200);
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
          .post("/club")
          .set('Authorization', 'Bearer ' + token0)
          .send(club1);
        expect(res.statusCode).toEqual(401);
      });
      it('should send 401 to admin with no club info', async () => {
        const res = await request(server)
          .post("/club")
          .set('Authorization', 'Bearer ' + adminToken)
          .send();
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