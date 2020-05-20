var express = require('express');
var router = express.Router();
const pool = require('../db/dbConfig');


/*Get Contacts List */ 
router.get('/contactList',(request, response) => {

  pool
  .query('SELECT sfid, name, Email FROM salesforce.Contact')
  .then((contactQueryResult) => {
  console.log('contactQueryResult : '+JSON.stringify(contactQueryResult.rows));
  response.send(contactQueryResult.rows);
  })
  .catch((contactQueryError)=>{
  response.send(contactQueryError);
  })
  
  });

  router.post('/',(request, response) => {
    let body = request.body;
    console.log('body '+JSON.stringify(body));
  
  
})
// Join Query

router.get('/JoinQuery',(request, response) => {

  pool
    .query('SELECT acc.name as accname, con.email as conemail FROM salesforce.Contact as con INNER JOIN salesforce.Account as acc ON con.AccountId = acc.sfid')
    .then((contactQueryResult) => {
      console.log('contactQueryResult   : '+JSON.stringify(contactQueryResult.rows));
      //response.send(contactQueryResult.rows);
      response.render('JoinQuery',{lstContact:contactQueryResult.rows});
})
.catch((contactQueryError) => {
      console.log('contactQueryError  : '+contactQueryError);
      response.send(contactQueryError);
})

  });
  router.get('/welcome',(request, response) => {
    response.render('welcome.ejs');
  })  

//Login Page
router.get('/login',(request, response) => {
  response.render('login.ejs');
})


router.post('/loginPost',(request, response) => {
  pool
  .query('SELECT sfid, Email, password__c FROM salesforce.Contact')
  .then((contactQueryResult) => {
  console.log('contactQueryResult : '+JSON.stringify(contactQueryResult.rows));
  response.send(contactQueryResult.rows);
  })
  .catch((contactQueryError)=>{
  response.send(contactQueryError);
  })
  let body = request.body;
  console.log('Your Response body is :    '+JSON.stringify(body));
  

  response.send('Hello  '+body.email);
})

 



//Register Page
router.get('/register', function(req, res) {
  res.render('register.ejs');
});

// Registration
router.post('/register',(request, response) => {
      let body = request.body;
      let {firstName, lastName, email, password, password2} = request.body;
      let errors =[];
      //Check Required Fields

      if(!firstName || !lastName || !email || !password || !password2) {
        errors.push({ msg: 'Please fill all the fields'});
      }

      //Check Password 

      if(password !== password2) {
        errors.push({ msg: 'Passwords do not match'});
      }

      if(password.length <6) {
        errors.push({ msg: 'Passwords should be atleast 6 character'});
      }
     

      if(errors.length > 0)
      {
        response.render('register',{errors});
      }
      else
      {

        pool
        .query('SELECT id, sfid, Name, Email FROM salesforce.Contact WHERE email = $1 ',[email])
        .then((contactQueryResult)=>{
          console.log('contactQueryResult.rows : '+JSON.stringify(contactQueryResult.rows));
          if(contactQueryResult.rowCount > 0)
          {
            errors.push({ msg: 'This email already exists'});
            response.render('register',{errors}); 
          }
          else
          {
                  pool
                  .query('INSERT into salesforce.Contact(firstname, lastname ,email, password__c) values ($1, $2, $3, $4)',[firstName,lastName,email,password])
                  .then((contactInsertQueryResult)=>{
                    console.log('contactQueryResult.rows : '+JSON.stringify(contactInsertQueryResult));
                      /******* Successfully  Inserted*/
                      response.redirect('/users/login');
                  })
                  .catch((contactInsertQueryError)=> {
                    console.log('contactInsertQueryError '+contactInsertQueryError);
                    response.render('register.ejs');
                  })
          }
        })
        .catch((contactQueryError)=> {
          console.log('contactQueryError '+contactQueryError);
          response.render('register.ejs');
        })

       
      }

          

/*      pool
      .query('INSERT into salesforce.Contact(firstname, lastname ,email, password__c) values ($1, $2, $3, $4)',[firstName,lastName,email,password])
      .then((contactQueryResult) => {
      console.log('contactQueryResult : '+JSON.stringify(contactQueryResult));
      response.send(contactQueryResult);
      })
      .catch((contactQueryError)=>{
      console.log('contactQueryError  : '+contactQueryError);  
      response.render(login.ejs);
      });

      */
      
})
  
    
module.exports = router
