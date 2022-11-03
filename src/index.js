
const fastify = require('fastify');
const  fastifyPassport = require('passport');
const fastifyCookie = require('@fastify/cookie');
const fastifySession = require('@fastify/session');
const env = require('dotenv');
const EasyNoPassword = require("easy-no-password");
env.config();

const Port = process.env.PORT;
const uri = process.env.MONGODB_URI;
const _secret = process.env.SECRET;

const app = fastify({ logger: true });
//const fastifyPassport = new Authenticator();

// Passport configuration~
/*app.register(fastifyCookie);
app.register(fastifySession, { secret: 'secret with minimum length of 32 characters' })
app.register(fastifyPassport.initialize())
app.register(fastifyPassport.secureSession())
*/


fastifyPassport.use('easy', new EasyNoPassword.Strategy({
    secret: _secret
},
function (req) {
    
    // Check if we are in "stage 1" (requesting a token) or "stage 2" (verifying a token)
    if (req.body && req.body.email) {
        return { stage: 1, username: req.body.email };
    } else if (req.query && req.query.email && req.query.token) {
        return { stage: 2, username: req.query.email, token: req.query.token };
    } else {
        return null;
    }
},
function (email, token, done) {
    var safeEmail = encodeURIComponent(email);
    var url = "http://localhost:5000/auth/tok?email=" + safeEmail + "&token=" + token;
    console.log(url)
    done();
    // Send the link to user via email.  Call done() when finished.
},
function (email, done) {
    console.log("here")
    // User is authenticated!  Call your findOrCreateUser function here.
}));

app.after(() => {
    app.route({
      method: 'POST',
      url: '/auth/tok',
      preValidation: fastifyPassport.authenticate("easy",  { authInfo: false }),
      handler: async (req, reply, err, user, info, status) => {
        return { hello: 'world' }
      }
    })

    app.route({
        method: 'GET',
        url: '/auth/tok',
        preValidation: fastifyPassport.authenticate("easy", {
            successRedirect: "/",
            failureRedirect: "/oops.html"
        }),
        handler: async (req, reply) => () => {}
      })
  })


// create server
const start = async () => {
    try {
        await app.listen(Port);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};
start();