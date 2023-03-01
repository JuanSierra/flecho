const fastify = require('fastify');
const env = require('dotenv');

const { Authenticator } = require( '@fastify/passport')
const fastifyCookie = require('@fastify/cookie');
const fastifySession = require('@fastify/session');
const fastifyCors = require('@fastify/cors');
const EasyNoPassword = require("easy-no-password");

const {sendMail} = require('./lib/email');
const db = require('./lib/db');
const DB = new db();

env.config();

const Port = process.env.PORT;
const app_uri = process.env.SERVER_URI;
const _secret = process.env.SECRET;

const app = fastify({ logger: true });

app.register(fastifyCors, { origin: 'http://localhost:8080', credentials: 'credentials' });
const fastifyPassport = new Authenticator();

app.register(fastifyCookie, {
  secret: "the-secret", // for cookies signature
});

app.register(fastifySession, { secret: 'secret with minimum length of 32 characters' })
app.register(fastifyPassport.initialize())
app.register(fastifyPassport.secureSession())

fastifyPassport.use('easy', new EasyNoPassword.Strategy({
    secret: _secret
},
function (req) {
    console.log(req.cookies)

    // Check if we are in "stage 1" (requesting a token) or "stage 2" (verifying a token)
    if (req.body && req.body.email) {
        return { stage: 1, username: req.body.email };
    } else if (req.query && req.query.email && req.query.token) {
        return { stage: 2, username: req.query.email, token: req.query.token };
    } else if (req.cookies && req.cookies.token) {
        const bCookie = req.unsignCookie(req.cookies.token);
        let val = JSON.parse(bCookie.value);
        return { stage: 2, username: val.email, token: val.token };
    } else {
        return null;
    }
},

function (email, token, done) {
  var safeEmail = encodeURIComponent(email);
  var url = `${app_uri}:8080/login.html?email=${safeEmail}&token=${token}`; 

  sendMail("Web app", email, url, done);
},

function (email, verified) {
  console.log("User is authenticated")
  verified(null, email, {user:"thing"});
}));

// Send to email
app.post(
 '/auth/tok',
 { preValidation: fastifyPassport.authenticate("easy",  { authInfo: false }) },
 async (request, reply, err) => {
	if (err !== null) {
	  console.warn(err)
	} else {
	  reply
	  .code(200)
	  .send();
	}}
)

// 
app.get(
 '/auth/tok',
 { preValidation: fastifyPassport.authenticate("easy", {
      failureRedirect: "/oops.html",
			session: false
 })},
 async (request, reply, err, user, info, status) => {
		if (err !== null) {
			console.warn(err)
		} else if (user) {
			console.log(user)
		}

    console.log("Create Token")
    let t = {email: request.query.email, token: request.query.token};
    
    console.log({email: request.query.email})

    DB.add({id: null, logout: false, renewal:'20120506'});

    reply
    .setCookie('token', JSON.stringify(t), {
      signed: true,
      path: "/",
      sameSite: "none",
      secure: true
    })
    .code(200)
    .header('Content-Type', 'application/json; charset=utf-8')
    .send({email: request.query.email})
    }
)

const start = async () => {
    try {
        // remove current sessions
        DB.init();

        await app.listen(Port);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();