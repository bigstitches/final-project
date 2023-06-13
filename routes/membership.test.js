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
    
      describe('PUT /:id', () => {
        it('should not create a membership request when not logged in', async () => {
          const res = await request(server)
            .put("/club/"+ clubH._id +"/membership/" + profileR._id)
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
    let profileS;
    let clubH;
    let regularToken;
    let adminToken;
    let membership1;

    const userADMIN = {
      password: "123Password",
      email: 'a@gmail.com',
    }
    const userREGULAR = {
      password: "123Password",
      email: 'rB@gmail.com',
    }
    
    const userREGULARCLUBOWNER = {
      password: "123Password",
      email: 'hc@gmail.com',
    }

    beforeEach(async () => {
      
      await request(server).post("/login/signup").send(userADMIN);
      await User.updateOne({ email: userADMIN.email }, { $push: { roles: 'admin'} });
      await request(server).post("/login/signup").send(userREGULAR);
      const userR = await User.findOne({ email: userREGULAR.email});
      await request(server).post("/login/signup").send(userREGULARCLUBOWNER);
      const userH = await User.findOne({ email: userREGULARCLUBOWNER.email});

      const profileREG = {
        userId: userR._id,
        name: 'Regular Bloke',
        address: '14889 22nd lane, Renton, WA 97223',
        callSign: 'XO99JUL',
        licenseClass: 'general',
      }

      const profileSUPER = {
        userId: userR._id,
        name: 'Tina Turner',
        address: '14889 22nd lane, Renton, WA 97223',
        callSign: 'XOUULFF',
        licenseClass: 'expert',
      }

      profileR = await Profile.create(profileREG);
      profileS = await Profile.create(profileSUPER);
      // create club, Highline, run by userH

      const clubHIGHLINE = { 
        userId: userH._id,
        name: 'Highline',
        address: address1,
      };
      clubH = await Club.create(clubHIGHLINE);
      membership1 = {
        profileId: profileR._id,
        clubId: clubH._id,
        status: 'PENDING',
      }
      membership2 = {
        profileId: profileS._id,
        clubId: clubH._id,
        status: 'ACTIVE',
      }
      const mbrship = await Membership.create(membership2);
      await Club.updateOne({ name: clubHIGHLINE.name }, { $push: { members: profileS._id} });

      const res1 = await request(server).post("/login").send(userREGULAR);
      regularToken = res1.body.token;

      const resC = await request(server).post("/login").send(userREGULARCLUBOWNER);
      clubToken = resC.body.token;

      const res2 = await request(server).post("/login").send(userADMIN);
      adminToken = res2.body.token;
      // console.log('at the end of every');
      // console.log('test tokens: ', regularToken, ' ', clubToken, ' ', adminToken);
    });
    
    // PUT /:id TEST COMPLETE, 12JUN complete
    describe('PUT /:id', () => {
      it('should update a membership request as admin', async () => {
        // create a regular request
        const res1 = await request(server)
          .post("/club/"+ clubH._id +"/membership/")
          .set('Authorization', 'Bearer ' + regularToken)
          .send();
        expect(res1.statusCode).toEqual(200);
        expect(res1.body.status).toEqual('PENDING');
        // udpate the request just made
        const res2 = await request(server)
          .put("/club/"+ clubH._id +"/membership/" + profileR._id)
          .set('Authorization', 'Bearer ' + adminToken)
          .send({status: 'ACTIVE'});
        expect(res2.statusCode).toEqual(200);
        expect(res2.body.status).toEqual('ACTIVE');
      });
      it('should not update a membership request if just a regular user', async () => {
        // create a regular request
        const res1 = await request(server)
          .post("/club/"+ clubH._id +"/membership/")
          .set('Authorization', 'Bearer ' + regularToken)
          .send();
        expect(res1.statusCode).toEqual(200);
        expect(res1.body.status).toEqual('PENDING');
        const res2 = await request(server)
          .put("/club/"+ clubH._id +"/membership/" + profileR._id)
          .set('Authorization', 'Bearer ' + regularToken)
          .send({status: 'ACTIVE'});
          const membershipR = await Membership.findOne({ profileId : profileR._id });
          // console.log('IN TEST MbrshipR ');
          // console.log(membershipR);
        expect(res2.statusCode).toEqual(401);
        expect(membershipR.status).toEqual('PENDING');
      });
      it('should update a membership request if owner of club', async () => {
        // create a regular request
        const res1 = await request(server)
          .post("/club/"+ clubH._id +"/membership/")
          .set('Authorization', 'Bearer ' + regularToken)
          .send();
        expect(res1.statusCode).toEqual(200);
        expect(res1.body.status).toEqual('PENDING');
        const res2 = await request(server)
          .put("/club/"+ clubH._id +"/membership/" + profileR._id)
          .set('Authorization', 'Bearer ' + clubToken)
          .send({status: 'ACTIVE'});
        expect(res2.statusCode).toEqual(200);
        expect(res2.body.status).toEqual('ACTIVE');
      });
    });

    describe('GET /:id', () => {
      it('should return a membership status if same member', async () => {
        // console.log('IN TEST, profileId ', profileR._id);
        const res = await request(server)
          .get("/club/"+ clubH._id +"/membership/" + profileR._id)
          .set('Authorization', 'Bearer ' + regularToken)
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
          .set('Authorization', 'Bearer ' + clubToken)
          .send();
        expect(res.statusCode).toEqual(401);
      });
    });

    describe('GET /', () => {
      it('should get all member requests of a club as admin', async () => {
        // console.log('get test as admin', adminToken);
        const res = await request(server)
          //.get("/club/:clubId/membership")
          .get("/club/"+ clubH._id +"/membership")
          .set('Authorization', 'Bearer ' + adminToken)
          .send();
        expect(res.statusCode).toEqual(200);
      });
      it('should get all members of a club as regular user (only active mbrs)', async () => {
        // console.log('get test as reg user');
        const res = await request(server)
          //.get("/club/:clubId/membership")
          .get("/club/"+ clubH._id +"/membership")
          .set('Authorization', 'Bearer ' + regularToken)
          .send();
        expect(res.statusCode).toEqual(200);
      });
    });

    describe('POST /', () => {
      beforeEach(async () => {
        // clear all the requests for just this test ( POST / )
        await Membership.deleteMany();
      });
      it('should create membership request for regular users', async () => {
        const res = await request(server)
          .post("/club/"+ clubH._id +"/membership/")
          .set('Authorization', 'Bearer ' + regularToken)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toEqual('PENDING');
        //
      });
      it('should not create duplicate requests', async () => {
        const res1 = await request(server)
          .post("/club/"+ clubH._id +"/membership/")
          .set('Authorization', 'Bearer ' + regularToken)
          .send();
        const res2 = await request(server)
          .post("/club/"+ clubH._id +"/membership/")
          .set('Authorization', 'Bearer ' + regularToken)
          .send();
        const memberships = await Membership.find().lean();
        // console.log('IN TEST POST IN LJKLJL ', memberships);
        expect(memberships.length).toEqual(1); // would be two if both requests were created
        expect(res1.statusCode).toEqual(200); // should be successful
        expect(res1.body.status).toEqual('PENDING'); // new PENDING status
        expect(res2.statusCode).toEqual(401); // should NOT be sucessful
        //
      });
      it('should not allow users without a profile to create a request', async () => {
        const res = await request(server)
          .post("/club/"+ clubH._id +"/membership/")
          .set('Authorization', 'Bearer ' + adminToken) // remember the admin user doesn't have a profile
          .send();
        expect(res.statusCode).toEqual(401);
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