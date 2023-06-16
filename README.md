1. A description of the scenario your project is operating in.

The National Association for Amateur Radio (arrl.org) has every licensed ham operator in the country as well as local associations, volunteer opportunities and advanced training.  This project will connect operators to associations; allow associations to add members and update their calendar with training; allow users to update some of their information and request membership to their local chapter, (data will be limited in scope to the south Seattle neighborhood)

2. A description of what problem your project seeks to solve.

The ARRL site is informational & does not provide a personalized view tailored to region for operators or associations. This will create a view for operators and clubs to tailor their experience to their locale.

- allow chapters to view members in their area that are newly licensed that you can invite to join
- provide users a personalized view with information on membership, training and expiration of license
- view upcoming training close to license location.


3. A description of what the technical components of your project will be, including: the routes, the data models, any external data sources you'll use, etc.
External Sources
- ARRL list of users in South Seattle area, training in area, recert info
- List of Ham Radio clubs in Washington State, (if training is here then add to calendar)
Data Models
- Event (training, expiration, competition etc)
- Operator (Ham Operator, three different types of licenses, allowed frequencies, can request club membership)
- Club (location, event creator, can add operators)
- Equipment (operating frequencies)


4. Clear and direct call-outs of how you will meet the various project requirements.
AUTHENTICATION
- Operator and Club will authenticate; operator can change (some) of their information and request membership; Clubs can add members
- Clubs can create events (CREATE), (UPDATE) and (DELETE)
- Clubs can (UPDATE) their membership list
- "ADMIN" (ARRL) can (CREATE) members and (CREATE) clubs and (POST) 
LOOKUP:
- /profile/requests - uses LOOKUP to get all the matching requests in membership
SEARCH/INDEX:
- /club/search - address city is indexed so it can be searched
AGGREGATE:
- /club/mostmembers - the clubs, by city, will be listed with most members to least

ROUTES (UPDATED):
  CLUB (represents ham operator clubs)
    - POST/ - It should only create a club if user is admin
    - GET/:id - It should return the club information for ANY user
    - GET/ - It should return all clubs
  PROFILE (represents a ham operator, created by ARRL)
    - POST/ - It should only create a user if user is admin
    - POST/:id - It should allow admin to update EVERYTHING, but a regular user must be associated 
                with this account and can only update Address
    - GET/:id - It should return a profile to ANYONE not just logged in users
    - GET/ - It should return all profiles to ANYONE not just logged in users
  MEMBERSHIP (users with a profile (i.e. with a license) can request membership)
    - (router.use("/club/:clubId/membership", require('./membership')))
    - GET/ - It should get all members of the club IF A USER, It should return all requests 
                if you are ADMIN OR the Owner of the Club
    - GET/:id - It should return the status of the user to that club for ADMIN and Owner and that 
                'id'/User
    - POST/ - It should allow users to request access to a club (initial status is PENDING)
    - POST/:id - It should allow ADMIN or OWNER to udpate a user request status from PENDING
            to APPROVED
    - DELETE - It should allow OWNERS/ADMIN to remove member from club and change status to RESCINDED

5. A timeline for what project components you plan to complete, week by week, for the remainder of the class. 
Week 1:
- Create three different types of user authentications types
  - Club, Operator and ARRL/admin will have different permissions; test that authentication
- CRUD Routes & create tests for that
Week 2:
- Create user user interface; test deployment make sure it's useable
- if there's more time connect the data so that operators have recommendations for a personalized experience