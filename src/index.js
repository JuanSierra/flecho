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

app.setErrorHandler(function (error, request, reply) {
  console.log('general error handler', error.message)
  console.log(request.cookies.token);
  console.log(request)

  // TODO: consider all cases
  if (request.cookies && request.cookies.token)
  {
    const bCookie = request.unsignCookie(request.cookies.token);
    let val = JSON.parse(bCookie.value);
    info  = { email: val.email, token: val.token };
  
    var client = DB.getById(val.id);
    var enp = EasyNoPassword(_secret);
    enp.createToken(info.email, (err, token) => {
      if (err) return console.error(err);
  
      info.token = token;
      //verified(null, email, info);
  
      reply
      .setCookie('token', JSON.stringify(info), {
        signed: true,
        path: "/",
        sameSite: "none",
        secure: true
      })
      .code(200)
      .header('Content-Type', 'application/json; charset=utf-8')
      .send({email:info.email})
    });
  }
})

app.register(fastifyCors, { origin: 'http://localhost:8080', credentials: 'credentials' });
const fastifyPassport = new Authenticator();

app.register(fastifyCookie, {
  secret: "the-secret", // for cookies signature
});

app.register(fastifySession, { secret: 'secret with minimum length of 32 characters' })
app.register(fastifyPassport.initialize())
app.register(fastifyPassport.secureSession())

fastifyPassport.use('easy', new EasyNoPassword.Strategy({
    secret: _secret,
    maxTokenAge: 10000,
    passReqToCallback: true
},
function (req) {
    console.log('cook')
    console.log(req.cookies)
  
    // Check if we are in "stage 1" (requesting a token) or "stage 2" (verifying a token)
    if (req.body && req.body.email) {
        return { stage: 1, username: req.body.email };
    } else if (req.query && req.query.email && req.query.token) {
        return { stage: 2, username: req.query.email, token: req.query.token };
    } else if (req.cookies && req.cookies.token) {
        const bCookie = req.unsignCookie(req.cookies.token);
        let val = JSON.parse(bCookie.value);
        console.log('val')
        console.log(val)
        return { stage: 2, username: val.email, token: val.token };
    } else {
        // neither query nor cookie
        console.log('null path')
        return null;
    }
},

function (email, token, done) {
  var safeEmail = encodeURIComponent(email);
  var url = `${app_uri}:8080/login.html?email=${safeEmail}&token=${token}`; 

  sendMail("Web app", email, url, done);
},

function (request, email, verified) {
  // User is authenticated!  Call create user function here.

  var info = { code: '', email: '', token: '' };
  if (request.query && request.query.email && request.query.token) {
      info = { email: request.query.email, token: request.query.token };

      // create new user connection
      info.code = DB.add({id: null, logout: false, renewal: Date.now()});

      console.log('from auth')
      console.log(info)

      verified(null, email, info);
  } 
  else if (request.cookies && request.cookies.token) {
      const bCookie = request.unsignCookie(request.cookies.token);
      let val = JSON.parse(bCookie.value);
      info  = { email: val.email, token: val.token, code: val.code };

      console.log('inff')
      console.log(val)
      var client = DB.getById(val.id);

      if(client.logout)
        verified("LOGOUT", email, info);

      var enp = EasyNoPassword(_secret);
      enp.createToken(info.email, (err, token) => {
				if (err) return console.error(err);

        info.token = token;
        verified(null, email, info);
      });
  }else{
    console.log('wrong')
  }
}));

// Send to email
app.post(
 '/auth/tok',
 { preValidation: fastifyPassport.authenticate("easy",  { authInfo: false }) },
 (request, reply, err) => {
	if (err !== null) {
	  console.warn(err)
	} else {
	  reply
	  .code(200)
	  .send();
	}}
)

// get token or refresh
app.get(
 '/auth/tok',
 {
  preValidation: fastifyPassport.authenticate("easy", {
      //failureRedirect: "/oops.html",
			session: false,
      failureMessage: true, 
      failWithError: true
 },
 ),
  onError: function (req, rep, err, done) 
  {
    console.log('new err handler')
    console.log(err)
    console.log(req.cookies.token)

    // When the process doesnt enters in the authentication.  Then a expired token. 
    // Optimistic refreshing guarantee a previous valid token and a safe session  

    if(err)
      done(err);
  }
},
 (request, reply, err) => {
    console.log('callback pass')
    console.log(err)
		if (err !== undefined || request.authInfo === undefined) {
			console.log('err')

			console.warn(err)
      
      reply
      .code(401)
      .send(err);

      return;
		} else {
      console.log("Create Token")
      console.log(request.authInfo)

      reply
      .setCookie('token', JSON.stringify(request.authInfo), {
        signed: true,
        path: "/",
        sameSite: "none",
        secure: true
      })
      .code(200)
      .header('Content-Type', 'application/json; charset=utf-8')
      .send({email:request.authInfo.email})
    }
  }
)

app.get(
  '/auth',
  { preValidation: fastifyPassport.authenticate("easy", {
       failureRedirect: "/oops.html",
       session: false
  })},
  (request, reply, err, user, info, status) => {
     if (err !== undefined || request.authInfo === undefined) {
       console.log('err')
 
       console.warn(err)
       
       reply
       .code(401)
       .send(err);
 
       return;
     } else {
       console.log("Valid Token")
       
       reply
       .code(200)
       .header('Content-Type', 'application/json; charset=utf-8')
       .send({email:request.authInfo.email})
     }
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