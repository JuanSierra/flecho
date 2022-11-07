
const fastify = require('fastify');
const  fastifyPassport = require('passport');
const fastifyCookie = require('@fastify/cookie');
const fastifySession = require('@fastify/session');
const env = require('dotenv');
const EasyNoPassword = require("easy-no-password");
const fastifyCors = require('@fastify/cors');
const Email = require('email-templates');
env.config();

const Port = process.env.PORT;
const uri = process.env.SERVER_URI;
const _secret = process.env.SECRET;
const mailtrap_user = process.env.MAILTRAP_USER;
const mailtrap_pass = process.env.MAILTRAP_PASS;

const app = fastify({ logger: true });

app.register(fastifyCors, { origin: '*' });
//const fastifyPassport = new Authenticator();

// Passport configuration
//app.register(fastifyCookie);
/*
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
    var url = uri+":"+Port+"/auth/tok?email=" + safeEmail + "&token=" + token;
    
    const emailSrv = new Email({
        message: {
          from: 'hi@example.com'
        },
        send: true,
        transport: {
          host: 'smtp.mailtrap.io',
          port: 2525,
          ssl: false,
          tls: true,
          auth: {
            user: mailtrap_user,
            pass: mailtrap_pass
          }
        }
       });

       let data = {email: email, link: url, application: "Web app" };

       emailSrv
       .send({
         template: 'token',
         message: {
           to: 'test@example.com'
         },
         locals: data
       })
       .then(console.log)
       .then(() => done())
       .catch(console.error);
    // Send the link to user via email.  Call done() when finished.
},
function (email, done) {
    console.log("here")
    // User is authenticated!  Call findOrCreateUser function here.
}));

app.after(() => {
    app.route({
      method: 'POST',
      url: '/auth/tok',
      preValidation: fastifyPassport.authenticate("easy",  { authInfo: false }),
      handler: async (request, reply, err) => {
        if (err !== null) {
          console.warn(err)
        } else {
          reply
          .code(200)
          .send();
        }
      }
    })

    app.route({
        method: 'GET',
        url: '/auth/tok',
        preValidation: fastifyPassport.authenticate("easy", {
            failureRedirect: "/oops.html"
        }),
        handler: async (request, reply, err, user, info, status) => {
          if (err !== null) {
            console.warn(err)
          } else if (user) {
            console.log(`Hello ${user.name}!`)
          }

          reply
          .code(200)
          .header('Content-Type', 'application/json; charset=utf-8')
          .send(user);
        }
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