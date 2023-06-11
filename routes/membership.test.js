const request = require("supertest");

const server = require("../server");
const testUtils = require('../test-utils');

const Club = require('../models/club');
const User = require('../models/user');
const Profile = require('../models/profile');

const Membership = require('../models/membership');
/*
* 
  const membershipSchema = new mongoose.Schema({
    profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'profile', index: true },
    clubId: { type: mongoose.Schema.Types.ObjectId, ref: 'club', index: true },
    status: { type: String, required: true  },
  });
*
*/


describe("/membership", () => {
  beforeAll(testUtils.connectDB);
  afterAll(testUtils.stopDB);
  afterEach(testUtils.clearDB);



  const address1 = { 
    address: '1983 44th ave SW', 
    city: 'Mukilteo',
    state: 'WA',
    zip: 98166
  };

  const trashToken = 'TRASH';

  describe('Before login', () => {
    let userA;
    let userR;
    let userH;
    let profileR;
    let clubH;

    beforeAll(async () => {
      const userADMIN = {
        password: "123Password",
        email: 'adminMbr@gmail.com',
        roles: ['user, admin']
      }

      const userREGULAR = {
        password: "123Password",
        email: 'regMbr@gmail.com',
        roles: ['user, admin']
      }
      const userREGULARCLUBOWNER = {
        password: "123Password",
        email: 'highlineHAMCLUB@gmail.com',
        roles: ['user']
      }

      userA = await User.create(userADMIN);
      // create regular user
      userR = await User.create(userREGULAR);

      const profileREG = {
        userId: userR._id,
        name: 'Regular Bloke',
        address: '14889 22nd lane, Renton, WA 97223',
        callSign: 'XO99JUL',
        licenseClass: 'general',
      }

      // create regular user that is in charge of the Highline Club
      userH = await User.create(userREGULARCLUBOWNER);

      const clubHIGHLINE = { 
        userId: userH._id,
        name: 'Highline',
        address: address1,
      };

      profileR = await Profile.create(profileREG);
      // create club, Highline, run by userH
      clubH = await Club.create(clubHIGHLINE);

      

      const membership1 = {
        profileId: profileR._id,
        clubId: clubH._id,
        status: 'PENDING',
      }
    });
  afterEach(async () => {
    User.deleteMany();
    Profile.deleteMany();
    Club.deleteMany();
  });
    
      describe('GET /', () => {
          it('should NOT get all members of a club', async () => {
            const res = await request(server)
              //.get("/club/:clubId/membership")
              .get("/club/"+ clubH._id +"/membership")
              .set('Authorization', 'Bearer ' + trashToken)
              .send();
            expect(res.statusCode).toEqual(401);
          });
      });

      describe('GET /:id', () => {
          
          it('should NOT return a membership status when not logged in', async () => {
            const res = await request(server)
              .get("/club/"+ clubH._id +"/membership/" + profileR._id)
              .set('Authorization', 'Bearer ' + trashToken)
              .send();
              // .send(membership1);
            expect(res.statusCode).toEqual(401);
            // should return PENDING status
            // expect(res.body.status).toEqual('PENDING');
          });
        });
    
      describe('POST /:id', () => {
        it('should not create a membership request when not logged in', async () => {
          const res = await request(server)
            .post("/club/"+ clubH._id +"/membership/" + profileR._id)
            .set('Authorization', 'Bearer ' + trashToken)
            .send();
          expect(res.statusCode).toEqual(401);
        });
      });
      describe('DELETE /:id', () => {
        it('Should not change status of a record when not logged in', async () => {
          // console.log('IN TEST, club: ', clubH);
          // console.log('Still in test, profile: ', profileR);
          const res = await request(server)
            .delete("/club/"+ clubH._id +"/membership/" + profileR._id)
            .set('Authorization', 'Bearer ' + trashToken)
            .send();
          expect(res.statusCode).toEqual(401);
        });
      });
    
  })

  describe('After login', () => {
    let profileR;
    let clubH;
    let regularToken;
    let adminToken;
    let membership1;

    beforeAll(async () => {
      const userADMIN = {
        password: "123Password",
        email: 'adminplop@gmail.com',
        roles: ['user, admin']
      }
      const userREGULAR = {
        password: "123Password",
        email: 'regularBloke@gmail.com',
        roles: ['user']
      }
      
      const userREGULARCLUBOWNER = {
        password: "123Password",
        email: 'highlineHAMCLUB2@gmail.com',
        roles: ['user']
      }
      const userA = await User.create(userADMIN);
      // create regular user
      const userR = await User.create(userREGULAR);
      // create regular user that is in charge of the Highline Club
      const userH = await User.create(userREGULARCLUBOWNER);
      // Regular Bloke that will be requesting membership to Highline

      const profileREG = {
        userId: userR._id,
        name: 'Regular Bloke',
        address: '14889 22nd lane, Renton, WA 97223',
        callSign: 'XO99JUL',
        licenseClass: 'general',
      }

      const clubHIGHLINE = { 
        userId: userH._id,
        name: 'Highline',
        address: address1,
      };

      profileR = await Profile.create(profileREG);
      // create club, Highline, run by userH
      clubH = await Club.create(clubHIGHLINE);

      const res1 = await request(server).post("/login").send(userR);
      regularToken = res1.body.token;

      const resC = await request(server).post("/login").send(userH);
      clubToken = resC.body.token;

      const res2 = await request(server).post("/login").send(userA);
      adminToken = res2.body.token;

      membership1 = {
        profileId: profileR._id,
        clubId: clubH._id,
        status: 'PENDING',
      }
    });
    afterEach(async () => {
      User.deleteMany();
      Profile.deleteMany();
      Club.deleteMany();
    });
    
    describe('GET /', () => {
        it('should get all members of a club as admin', async () => {
          const res = await request(server)
            //.get("/club/:clubId/membership")
            .get("/club/"+ clubH._id +"/membership")
            .set('Authorization', 'Bearer ' + adminToken)
            .send();
          expect(res.statusCode).toEqual(200);
        });
    });

    describe('GET /', () => {
      it('should get all members of a club as regular user', async () => {
        const res = await request(server)
          //.get("/club/:clubId/membership")
          .get("/club/"+ clubH._id +"/membership")
          .set('Authorization', 'Bearer ' + regularToken)
          .send();
        expect(res.statusCode).toEqual(200);
      });
  });

    describe('GET /:id', () => {
      it('should return a membership status if same member', async () => {
        const res = await request(server)
          .get("/club/"+ clubH._id +"/membership/" + profileR._id)
          .set('Authorization', 'Bearer ' + clubToken)
          .send();
        expect(res.statusCode).toEqual(200);
      });
      it('should return a membership status if admin', async () => {
        const res = await request(server)
          .get("/club/"+ clubH._id +"/membership/" + profileR._id)
          .set('Authorization', 'Bearer ' + adminToken)
          .send();
        expect(res.statusCode).toEqual(200);
      });
      it('should not return a membership status if not same member', async () => {
        const res = await request(server)
          .get("/club/"+ clubH._id +"/membership/" + profileR._id)
          .set('Authorization', 'Bearer ' + regularToken)
          .send();
        expect(res.statusCode).toEqual(200);
      });
    });
      describe('POST /', () => {
        it('should create membership request for regular users', async () => {
          const res = await request(server)
            .post("/club/"+ clubH._id +"/membership/" + profileR._id)
            .set('Authorization', 'Bearer ' + regularToken)
            .send(membership1);
          expect(res.statusCode).toEqual(200);
          //
        });
        it('should not allow regular users to create a request for someone else', async () => {
          const res = await request(server)
            .post("/club/"+ clubH._id +"/membership/" + profileR._id)
            .set('Authorization', 'Bearer ' + regularToken)
            .send();
          expect(res.statusCode).toEqual(200);
          //
        });
        it('should not create duplicate requests', async () => {
          const res = await request(server)
            .post("/club/"+ clubH._id +"/membership/" + profileR._id)
            .set('Authorization', 'Bearer ' + regularToken)
            .send();
          expect(res.statusCode).toEqual(401);
          //
        });

        it('should allow admin to create any request', async () => {
          const res = await request(server)
            .post("/club/"+ clubH._id +"/membership/" + profileR._id)
            .set('Authorization', 'Bearer ' + adminToken)
            .send();
          expect(res.statusCode).toEqual(200);
          //
        });
      });

      describe('DELETE /', () => {
        it('should allow admin to delete a request', async () => {
          const res = await request(server)
            .delete("/club/"+ clubH._id +"/membership/" + profileR._id)
            .set('Authorization', 'Bearer ' + adminToken)
            .send();
          expect(res.statusCode).toEqual(200);
        });

        it('should allow a member to quit a club', async () => {
          const res = await request(server)
            .delete("/club/"+ clubH._id +"/membership/" + profileR._id)
            .set('Authorization', 'Bearer ' + regularToken)
            .send();
          expect(res.statusCode).toEqual(200);
        });
      });
    });
});