var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var bodyParser = require('body-parser'); //parsing post request data using JSON
var multer = require('multer'); //for file  uploading system
var session = require('express-session'); //for cookies and session
var nodemailer = require('nodemailer');
var xoauth2= require('xoauth2');

var config = {
    user: 'postgres',
    database: 'VC_DataCenter',
    host: 'localhost',
    port: '5432',
    password: 'abhilash'
};
var date= new Date();
var strdate = date.toLocaleDateString();
console.log(strdate);
var app = express();
var pool = new Pool(config);
//var pid;
//var photoid;
//var controlwrite=0;
app.use(session({
    secret: 'VCBYFireShots',
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 }
}));
//following url encoded for form element post data parsing
/** bodyParser.urlencoded(options)
 * Parses the text as URL encoded data (which is how browsers tend to send form data from regular forms set to POST)
 * and exposes the resulting object (containing the keys and values) on req.body
 */
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(morgan('short'));
//for photo upload 5
var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, './uploads'); //do create a uploads  folder otherwise it will show  error  uploading the file.
    },
    filename: function(req, file, callback) {
        var str = file.originalname;

          console.log(str +' at time of uploading');
        callback(null, str);
    }
});
var upload = multer({ storage: storage }).single('userPhoto');
//end photo upload

app.post('/send_email', function (req, res) {
    var email_pid = req.body.email_pid;
    var content = req.body.content;
   // var email='';
    var pic_1=  req.body.pic_1;
    console.log(pic_1);
    var pid = req.body.pid;
    var profileid=req.body.profileid;
    if(pic_1==='blank'||pic_1===''||pic_1==='NULL')
        pic_1='blank.jpg';
    var querys= `update user_status set service_details = concat('${pid},',service_details) where profile_id='${profileid}'`;
    console.log(profileid);
    console.log(pid);
    console.log(querys);
    console.log(pic_1);
    
   // var email_addrs = req.body.email_addrs;
    //var para  = req.body.para;
    
    

    let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            type: 'OAuth2',
            clientId: '213919874528-gjprntcmi6ec84v1tjvuej93g5f4jg6s.apps.googleusercontent.com',
            clientSecret: 'miE133Gy4PRGk4ePq1tC2kVS'
        }
    });

    transporter.sendMail({
        from: 'Greetings from Vivaah Centre <vivaahcentre@gmail.com>',
        to: email_pid,
        subject: 'Sending Profile',
        html: content+`<br><img src="cid:${pic_1}@emailer.com"/>`,
        attachments: [{
            filename: pic_1,
            //path: 'C:/Users/Anwesh/desktop/web/public/B215015.jpg',
            path: path.join(__dirname,'uploads', pic_1),
            cid: pic_1+'@emailer.com' //same cid value as in the html img src
        }],

       
        auth: {
            user: 'vivaahcentre@gmail.com',
            refreshToken: '1/6wwQF0B-iWEkCMIL5q1N-4SNRmJKpDE--mSJEB9zq5A',
            accessToken: 'ya29.GltYBMTPTZKRtpNZ1vLp7B8pTu576hfD3xrBUfbznLBG4dyZ-tumOTq29zgKO9O0BHFt2LlYkWm21mdtk-ABwRF1qGxzbbGab2HgdE1tqq4vXpI_wK17kTL7HjNg',
            expires: 1484314697598
        }
    } , (error, info) => {
        if(error){
            res.status(500).send(error.toString());
            return console.log(error);
        }
        pool.query(querys,function(err,result){
           
            if(err)
                {
                    res.status(500).send(err.toString());
                }
            else
                {
                     res.send('Email sent successfully !');
        console.log("the message was sent! and service details updated !");
        console.log(info);
                }
        });
       
        
    });

    });


app.get('/',function(req,res){
   res.sendFile(path.join(__dirname,'html','Login.html')); 
});
app.get('/html/:filename',function(req,res){
   res.sendFile(path.join(__dirname,'html',req.params.filename));
    
});
app.get('/css/:filename',function(req,res){
   res.sendFile(path.join(__dirname,'css',req.params.filename));
    
});
app.get('/script/:filename',function(req,res){
   res.sendFile(path.join(__dirname,'script',req.params.filename));
    
});

app.post('/check-phone',function(req,res){
   var mob_no= req.body.user_in;
    console.log('mobile no'+mob_no);
    pool.query('select * from user_status where mobile_no = $1',[mob_no],function(err,result){
       if(err)
           {
               res.status(500).send(err.toString());
           }
        else
            { //console.log(result.rows.length);
                res.send(JSON.stringify(result.rows.length));
            }
    });
});
app.post('/updatestage',function(req,res){
   var mob_no = req.body.phone_no;
    var stagetemp= req.body.member_pack;
        var stage= parseInt(stagetemp);
    pool.query('update user_status set stage=$1 where mobile_no = $2',[stage,mob_no],function(err,result){
       if(err)
           {
               res.status(500).send(err.toString());
           }
        else
            {
                res.send('Query successful !');
            }
    });
});
app.get('/search-query/:mob',function(req,res){
   var mob= req.params.mob;
    pool.query('select * from user_details where mobile_no= $1',[mob],function(err,result){
       
        if(err)
            {
                res.status(500).send(err.toString());
            }
        else
            {
                res.send(JSON.stringify(result.rows));
            }
    });
});
app.get('/filter-query/:gender/:criteria/:value',function(req,res){
   
    var gender= req.params.gender;
    var criteria = req.params.criteria;
    var value= req.params.value;
   console.log(gender.toUpperCase());
    console.log(criteria.toUpperCase());
    console.log(value.toUpperCase());
    if(criteria.toUpperCase()==='CASTE')
        {
    pool.query('select * from user_details where upper(gender)=upper($1) and upper(caste)=upper($2)',[gender,value],function(err,result){
    
        if(err)
            {
                res.status(500).send(err.toString());
            }
        else
            {
                res.send(JSON.stringify(result.rows));
            }
    });
        }
    if(criteria.toUpperCase()==='RELIGION')
        {
    pool.query('select * from user_details where upper(gender)=upper($1) and upper(religion)=upper($2)',[gender,value],function(err,result){
    
        if(err)
            {
                res.status(500).send(err.toString());
            }
        else
            {
                res.send(JSON.stringify(result.rows));
            }
    });
        }
    if(criteria.toUpperCase()==='MARITAL-STATUS')
        {
    pool.query('select * from user_details where upper(gender)=upper($1) and upper(marital_status)=upper($2)',[gender,value],function(err,result){
    
        if(err)
            {
                res.status(500).send(err.toString());
            }
        else
            {
                res.send(JSON.stringify(result.rows));
            }
    });
        }
    if(criteria.toUpperCase()==='MOTHER-TONGUE')
        {
    pool.query('select * from user_details where upper(gender)=upper($1) and upper(mother_tongue)=upper($2)',[gender,value],function(err,result){
    
        if(err)
            {
                res.status(500).send(err.toString());
            }
        else
            {
                res.send(JSON.stringify(result.rows));
            }
    });
        }
    if(criteria.toUpperCase()==='AGE')
        {
    pool.query('select * from user_details where upper(gender)=upper($1) and age<=($2)',[gender,value],function(err,result){
    
        if(err)
            {
                res.status(500).send(err.toString());
            }
        else
            {
                res.send(JSON.stringify(result.rows));
            }
    });
        }
    if(criteria.toUpperCase()==='LOCATION')
        {
    pool.query('select * from user_details where upper(gender)=upper($1) and upper(city)=upper($2)',[gender,value],function(err,result){
    
        if(err)
            {
                res.status(500).send(err.toString());
            }
        else
            {
                res.send(JSON.stringify(result.rows));
            }
    });
        }
    if(criteria.toUpperCase()==='EDUCATION')
        {
    pool.query('select * from user_details where upper(gender)=upper($1) and upper(education)=upper($2)',[gender,value],function(err,result){
    
        if(err)
            {
                res.status(500).send(err.toString());
            }
        else
            {
                console.log('here');
                res.send(JSON.stringify(result.rows));
            }
    });
        }






});
app.get('/viewallprospects',function(req,res){
   pool.query('select * from user_status where stage >=1',function(err,result){
       if(err)
           {
               res.status(500).send(err.toString());
           }
       else
           {
               res.send(JSON.stringify(result.rows));
           }
   }) ;
});
//login_logout_section
app.post('/create-user', function(req, res) {

    var username = req.body.username;
    var password = req.body.password;
    pool.query('INSERT INTO emp_details (username, password) VALUES ($1, $2)', [username, password], function(err, result) {
        if (err) {
            res.status(500).send(err.toString());
        } else {
            res.send('User successfully created: ' + username);
        }
    });
});

app.post('/login', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;

    pool.query('SELECT * FROM emp_details WHERE username = $1', [username], function(err, result) {
        if (err) {
            res.status(500).send(err.toString());
        } else {
            if (result.rows.length === 0) {
                res.status(403).send('username/password is invalid');
            } else {
                // Match the password
                var dbString = result.rows[0].password;
                
                if (password === dbString) {

                    // Set the session
                    req.session.auth = { username: result.rows[0].username}; //set_cookie
                   

                    res.send('Correct credentials');

                } else {
                    res.status(403).send('username/password is invalid');
                }
            }
        }
    });
});
app.get('/entrycheck/:mob',function(req,res){
    var mob= req.params.mob;
    pool.query('select * from user_details where mobile_no=$1',[mob],function(err,result){
       if(err)
           {
               res.status(500).send(err.toString());
           }
        else
            {
                res.send(JSON.stringify(result.rows));
            }
    });
});
app.post('/fulladd',function(req,res){
   
    var profile_id= req.body.profile_id;
    var person_of_contact= req.body.person_of_contact;
    var mobile_no =req.body.mobile_no;
    var email= req.body.email;
    var address = req.body.address;
    var city = req.body.city;
    var relation_with_candidate = req.body.relation_with_candidate;
    var first_name= req.body.first_name;
    var middle_name=req.body.middle_name;
    var surname=req.body.surname;
    var dob=req.body.dob;
    var tob=req.body.tob;
    var body_type=req.body.body_type;
    var complexion =req.body.complexion;
    var blood_g= req.body.blood_g;
    var height= req.body.height;
    var pwd= req.body.pwd;
    var employment_details= req.body.employment_details;
    var age= req.body.age;
    var high_s= req.body.high_s;
    var emp_status= req.body.emp_status;
    var masters= req.body.masters;
    var other_quali= req.body.other_quali;
    var graduation = req.body.graduation;
    var intermediate = req.body.intermediate;
    var caste= req.body.caste;
    var linkedin_id= req.body.linkedin_id;
    var religion=req.body.religion;
    var mother_tongue = req.body.mother_tongue;
    var family_type = req.body.family_type;
    var gotra = req.body.gotra;
    var manglik= req.body.manglik;
    var rashi = req.body.rashi;
    var nakshtra=req.body.nakshtra;
    var marital_status= req.body.marital_status;
    var profile_pic_1= 'blank';
    var profile_pic_2= 'blank';
    var profile_pic_3='blank';
    var facebook_id= req.body.facebook_id;
    var details_of_family= req.body.details_of_family;
    var about_father = req.body.about_father;
    var details_of_father= req.body.details_of_father;
    var about_mother= req.body.about_mother;
    var details_of_mother = req.body.details_of_mother;
    var pp_complexion= req.body.pp_complexion;
    var pp_age= req.body.pp_age;
    var pp_height= req.body.pp_height;
    var sibling_details= req.body.sibling_details;
    var pp_religion= req.body.pp_religion;
    var pp_occupation= req.body.pp_occupation;
    var pp_body_type= req.body.pp_body_type;
    var pp_marital_status= req.body.pp_marital_status;
    var pp_more_details= req.body.pp_more_details;
    var family_values= req.body.family_values;
    var pp_caste= req.body.pp_caste;
    var gender= req.body.gender;
    var education = req.body.education;
    var pob= req.body.pob;
    var weight= req.body.weight;
    var annual_income= req.body.annual_income;
    var more_candidate= req.body.more_candidate;
    var fathers_contact = req.body.fathers_contact;
    var mothers_contact = req.body.mothers_contact;
    var n_name= req.body.n_name;
    var n_mobile_no= req.body.n_mobile_no;
    var n_relation = req.body.n_relation;
    var n_other_details= req.body.n_other_details;
    var ref1_name= req.body.ref1_name;
    var ref1_mob= req.body.ref1_mob;
    var ref2_name= req.body.ref2_name;
    var ref2_mob=req.body.ref2_mob;
    var pp_mother_tongue= req.body.pp_mother_tongue;
    var pp_family_type= req.body.pp_family_type;
    var pp_family_values=req.body.pp_family_values;
    var c_email=  req.body.cemail;
    var c_mobile_no= req.body.cmobile_no;
    var ca_email =  req.body.caemail;
    var ca_mobile_no = req.body.camobile_no;
    var c_address=  req.body.caddress;
    var c_pincode= req.body.cpincode;
    var c_state=  req.body.cstate;
    var c_city = req.body.ccity;
    var c_nationality= req.body.cnationality;
    var graduation_institute = req.body.graduation_institute;
    var masters_institute= req.body.masters_institute;
    var other_institute = req.body.other_institute;
    var employer_details= req.body.employer_details;
    var employment_type= req.body.employment_type;
    var fathers_name= req.body.fathers_name;
    var mothers_name= req.body.mothers_name;
    var no_brothers =req.body.no_brothers;
    var no_sisters = req.body.no_sisters;
    var brother_marital= req.body.brother_marital;
    var sister_marital= req.body.sister_marital;
    var pp_education = req.body.pp_education;
    
    /*console.log(profile_id);
    console.log(person_of_contact);
    console.log(mobile_no);
    console.log(email);
    console.log(address);
    console.log(relation_with_candidate);
    console.log(city);
    console.log(first_name);
    console.log(middle_name);
    console.log(surname);
    console.log(dob);
    console.log(tob);
    console.log(body_type);
    console.log(complexion);
    console.log(blood_g);
    console.log(height);
    console.log(pwd);
    console.log(employment_details);
    console.log(age);
    console.log(high_s);
    console.log(emp_status);
    console.log(masters);
    console.log(other_quali);
    console.log(graduation);
    console.log(intermediate);
    console.log(caste);
    console.log(linkedin_id);
    console.log(religion);
    console.log(mother_tongue);
    console.log(family_type);
    console.log(gotra);
    console.log(manglik);
    console.log(rashi);
    console.log(nakshtra);
    console.log(marital_status);
    console.log(facebook_id);
    console.log(details_of_family);
    console.log(about_father);
    console.log(details_of_father);
    console.log(pp_age);
    console.log(pp_body_type);
    console.log(pp_caste);
    console.log(pp_complexion);
    console.log(pp_family_type);
    console.log(pp_family_values);
    console.log(pp_height);
    console.log(pp_marital_status);
    console.log(pp_more_details);
    console.log(pp_mother_tongue);
    console.log(pp_religion);
    console.log(about_mother);
    console.log(details_of_mother);
    console.log(sibling_details);
    console.log(family_values);
    console.log(gender);
    console.log(education);
    console.log(pob);
    console.log(weight);
    console.log(annual_income);
    console.log(more_candidate);
    console.log(fathers_contact);
    console.log(mothers_contact);
    console.log(n_mobile_no);
    console.log(n_name);
    console.log(n_other_details);
    console.log(n_relation);
    console.log(ref1_name);
    console.log(ref1_mob);
    console.log(ref2_name);*/
    pool.query('update user_details set profile_id=$1,person_of_contact=$2,mobile_no=$3,address=$5,email=$4,relation_with_candidate=$6,city=$7,candidate_first_name=$8,candidate_middle_name=$9,candidate_surname=$10,date_of_birth=$11,time_of_birth=$12,body_type=$13,complexion=$14,blood_group=$15,height=$16,physically_challenged=$17,employment_details=$18,age=$19,high_school=$20,employment_status=$21,masters=$22,other_qualification=$23,graduation=$24,intermediate=$25,caste=$26,linkedin_id=$27,religion=$28,mother_tongue=$29,family_type=$30,gotra=$31,manglik=$32,rashi=$33,nakshtra=$34,marital_status=$35,facebook_id=$36,profile_pic_2=$37,details_of_family=$38,about_father=$39,details_of_father=$40,about_mother=$41,details_of_mother=$42,preferred_partner_complexion=$43,preferred_partner_age=$44,preferred_partner_height=$45,sibling_details=$46,profile_pic_3=$47,preferred_partner_religion=$48,preferred_partner_occupation=$49,preferred_partner_body_type=$50,preferred_partner_marital_status=$51,preferred_partner_more_details=$52,profile_pic_1=$53,family_values=$54,preferred_partner_caste=$55,gender=$56,education=$57,place_of_birth=$58,weight=$59,annual_income=$60,more_about_candidate=$61,fathers_contact=$62,mothers_contact=$63,negotiator_name=$64,negotiator_mobile_no=$65,negotiator_relation=$66,negotiator_other_details=$67,ref1_name=$68,ref1_contact=$69,ref2_name=$70,ref2_contact=$71,preferred_partner_mother_tongue=$72,preferred_partner_family_type=$73,preferred_partner_family_values=$74,c_email=$75,c_mobile_no=$76,ca_email=$77,ca_mobile_no=$78,c_address=$79,c_pincode=$80,c_state=$81,c_city=$82,c_nationality=$83,graduation_institute=$84,masters_institute=$85,other_institute=$86,employer_details=$87,employment_type=$88,fathers_name=$89,mothers_name=$90,no_brothers=$91,brother_marital=$92,no_sisters=$93,sister_marital=$94,preferred_partner_education=$95 where profile_id=$1',[profile_id,person_of_contact,mobile_no,email,address,relation_with_candidate,city,first_name,middle_name,surname,dob,tob,body_type,complexion,blood_g,height,pwd,employment_details,age,high_s,emp_status,masters,other_quali,graduation,intermediate,caste,linkedin_id,religion,mother_tongue,family_type,gotra,manglik,rashi,nakshtra,marital_status,facebook_id,profile_pic_2,details_of_family,about_father,details_of_father,about_mother,details_of_mother,pp_complexion,pp_age,pp_height,sibling_details,profile_pic_3,pp_religion,pp_occupation,pp_body_type,pp_marital_status,pp_more_details,profile_pic_1,family_values,pp_caste,gender,education,pob,weight,annual_income,more_candidate,fathers_contact,mothers_contact,n_name,n_mobile_no,n_relation,n_other_details,ref1_name,ref1_mob,ref2_name,ref2_mob,pp_mother_tongue,pp_family_type,pp_family_values,c_email,c_mobile_no,ca_email,ca_mobile_no,c_address,c_pincode,c_state,c_city,c_nationality,graduation_institute,masters_institute,other_institute,employer_details,employment_type,fathers_name,mothers_name,no_brothers,brother_marital,no_sisters,sister_marital,pp_education],function(err,result){
       
        if(err)
            {
                res.status(500).send(err.toString());
            }
        else
            {   
                
                res.redirect(`/upload_photo_form/${profile_id}/1`);
            
            }
    });
    
});

app.get('/redirect',function(req,res){
   var htmltemplate= `<div style="text-align:center">
                        <h2> Done !</h2><br>
                          <a href='/html/dashboard.html'>Click to return to main menu !</a></div>`;
    res.send(htmltemplate);
});
app.post('/quickadd',function(req,res){
   var pid= req.body.pid;
    var mob_no=req.body.mob_no;
    var email= req.body.email;
    var person_of_c = req.body.person_of_c;
    var relation = req.body.relation;
    var address= req.body.address;
    var city = req.body.city;
    var gender=req.body.gender;
    var username = req.session.auth.username;
    var stage=0;
    var service_details ='';
    
    pool.query('insert into user_details (profile_id,person_of_contact,mobile_no,email,address,relation_with_candidate,city,gender) values($1,$2,$3,$4,$5,$6,$7,$8)',[pid,person_of_c,mob_no,email,address,relation,city,gender],function(err,result){
       if(err)
           {
               res.status(500).send(err.toString()+'<br><h3>Kindly Go Back on your browser and take required measures</h3>');
           }
        else
            {
                
                pool.query('insert into user_status values ($1,$2,$3,$4,$5,$6)',[pid,person_of_c,mob_no,username,stage,service_details],function(err,result){
                   if(err)
                       {
                           res.status(500).send(err.toString()+'<br><h3>Kindly Go Back on your browser and take required measures</h3>')
                       }
                    else
                        {
                            var htmltemplate = ` <h3> Profile Successfully Added </h3><br><a href="/html/dashboard.html">Click to go on Dashboard !</a>`;
                res.send(htmltemplate);
                        }
                });
                
            }
    });
    
});
app.get('/user_details/:id',function(req,res){
   var pid= req.params.id;
    
    pool.query('select * from user_details where profile_id=$1',[pid],function(err,result){
        if(err)
            {
                res.status(500).send(err.toString());
            }
        else
            {
                res.send(JSON.stringify(result.rows));
            }
    });
});
app.get('/callhistory/:id',function(req,res){
   var pid= req.params.id;
    
    pool.query('select * from call_walkin_history where profile_id=$1',[pid],function(err,result){
        if(err)
            {
                res.status(500).send(err.toString());
            }
        else
            {
                res.send(JSON.stringify(result.rows));
            }
    });
});
app.get('/displayapt',function(req,res){
   
   pool.query('select * from call_walkin_history',function(err,result){
      if(err)
          {
              res.status(500).send(err.toString());
              
          }
       else
           {   
               var d= result.rows[0].contact_date.toDateString();
               console.log(d);
               res.send(JSON.stringify(result.rows));
           }
   });
    
});
//testapi
app.get('/checkpopup',function(req,res){
   pool.query('select * from emp_details', function(err,result){
       if(err)
           {
               res.status(500).send(err.toString());
           }
       else
           {
               res.send(JSON.stringify(result.rows));
           }
   }) ;
});
app.post('/checkupdate',function(req,res){
    var profile_id=req.body.profile_id;
   var type =  req.body.type;
    var mob_no=req.body.mob_no;
    var contact_date = req.body.cdate;
    var call_details = req.body.call_details;
    var itype= req.body.itype;
    var call_resp= req.body.response;
    var apt= req.body.apt;
    var next_date= req.body.fdate;
    var stage= req.body.stage;
    var username=req.session.auth.username;
    
  /*  console.log('pid'+profile_id);
    console.log('type'+type);
    console.log(mob_no);
    console.log(contact_date);
    console.log(call_details);
    console.log(itype);
    console.log(call_resp);
    console.log(apt);
    console.log(next_date);
    console.log(stage);
    res.end();*/
    pool.query('insert into call_walkin_history values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',[profile_id,contact_date,mob_no,call_details,itype,call_resp,next_date,apt,type,username],function(err,result){
       if(err)
           {
               res.status(500).send(err.toString());
           }
        else
            {  
                if(stage==='3'||stage==='4')
                {
                   res.redirect('/html/dashboard.html');
                    
                }
             else
                 {
                pool.query('update user_status set stage=$1 where profile_id=$2',[stage,profile_id],function(err,result){
                   if(err)
                       {
                           res.staus(500).send(err.toString());
                       }
                    else
                        {
                            res.redirect('/html/dashboard.html');
                        }
                });
                 }
            }
    });
});
app.get('/cwupdate/:id',function(req,res){
   
    var pid= req.params.id;
    
    var htmltemplate=`<!DOCTYPE html>
<style>

</style>
<html>

<head>
    <title>
        Call/Walkin Update
    </title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
</head>

<body>
    <div class="container">
        <div class="col-sm-12" style="text-align:right">
            <img src="/uploads/logol.jpg" style="float:left;height:60px;width:300px;margin-left:-60px" />

            <div id="logout">
                <br>

            </div>
        </div>
    </div>
    <nav class="navbar navbar-inverse">
        <div class="container-fluid">

            <ul class="nav navbar-nav">
                <li><a href="/html/dashboard.html">Dashboard</a></li>
                <li><a href="/html/leads.html">Leads</a></li>
                <li><a href="/html/enquiry2.html">Create New Enquiry</a></li>
                <li><a href="/html/prospect.html">Prospects</a></li>
                <li><a href="/html/payment.html">Payment</a></li>
                <li><a href="/html/query.html">Payment</a></li>

            </ul>

        </div>

    </nav>
    <div class="container">
        <h4 style="text-decoration:underline;text-align:center"><b>Previous History for Profile ID:<span id="pid">${pid}</span> </b></h4>
        <div class="col-sm-12" id="olddetails">
        </div>
    </div>
    <div class="container" style="background-color:azure">
        <h4 style="text-decoration:underline;text-align:center"><b>Call/Walk-in Update</b></h4>
        <div class="col-sm-12" id="calldetails">

            <form class="form-horizontal" action="/checkupdate" method="POST">
                <div class="form-group">
                    <label class="col-sm-2" for="profile_id">Profile ID:</label>
                    <div class="col-sm-offset -2 col-sm-10">

                        <label><input type="text" name="profile_id" value="${pid}"></label>


                    </div>
                </div>
                <div class="form-group">
                    <label class="col-sm-2" for="type">Type:</label>
                    <div class="col-sm-offset -2 col-sm-10">

                        <label><input type="checkbox" name="type" value="0"> Call</label>
                        <label><input type="checkbox" name="type" value="1"> Walk-in</label>

                    </div>
                </div>
                <div class="form-group">
                    <label class="col-sm-2" for="mobile">Phone:</label>

                    <div class="col-sm-10" id="myphone">
                        <input type="mobile" class="form-control" id="phone" name="mob_no" placeholder="Enter Contact No.">
                    </div>
                </div>
                <div class="form-group">
                    <label class="col-sm-2" for="contacteddate">Contacted On:</label>
                    <div class="col-sm-10" id="contact">
                        <input type="date" class="form-control" name="cdate" </input>
                    </div>
                </div>
                  <div class="form-group">
                    <label class="col-sm-2" for="servicedetail">Call Details:</label>
                    <div class="col-sm-10">
                        <textarea class="form-control" rows="5" name="service_details" id="service_details" placeholder="Enter Call Details"></textarea>
                    </div>
                </div>
                <div class="form-group">
                    <label class="col-sm-2" for="calldetail">Call Details:</label>
                    <div class="col-sm-10">
                        <textarea class="form-control" rows="5" name="call_details" placeholder="Enter Call Details"></textarea>
                    </div>
                </div>

                <div class="form-group">
                    <label class="col-sm-2" for="interaction">Interaction Type:</label>
                    <div class="col-sm-offset -2 col-sm-10">

                        <label><input type="checkbox" name="itype" value="outbound"> Outbound</label>
                        <label><input type="checkbox" name="itype" value="inbound"> Inbound</label>
                        <label><input type="checkbox" name="itype" value="walkin"> Walk-in</label>
                    </div>
                </div>


                <div class="form-group">
                    <label class="col-sm-2" for="callresponse">Call Response:</label>
                    <div class="col-sm-offset -2 col-sm-10">

                        <label><input type="checkbox" name="response" value="ptp" > PTP</label>
                        <label><input type="checkbox" name="response" value="nrpc"> NRPC</label>
                        <label><input type="checkbox" name="response" value="callback"> CallBack</label>
                        <label><input type="checkbox" name="response" value="not interested"> Not Interested</label>

                    </div>
                </div>
                <div class="form-group">
                    <label class="col-sm-2" for="appointment">Appointment :</label>
                    <div class="col-sm-offset -2 col-sm-10">

                        <label><input type="checkbox" name="apt" value="0" > No Appointment</label>

                        <label><input type="checkbox" name="apt" value="1"> Schedule Appointment</label>
                    </div>
                </div>



                <div class="form-group">
                    <label class="col-sm-2" for="stage">Stage:</label>
                    <div class="col-sm-offset -2 col-sm-10">

                        <label><input type="checkbox" name="stage" value="0"> Lead</label>
                        <label><input type="checkbox" name="stage" value="1"> Prospect</label>
                        <label><input type="checkbox" name="stage" value="2"> Opportunity</label>
                        <label><input type="checkbox" name="stage" value="3"> Paid Member</label>
                        <label><input type="checkbox" name="stage" value="4"> Retain Stage </label>

                    </div>
                </div>


                <div class="form-group">
                    <label class="col-sm-2" for="followupdate">Next Follow Up Date:</label>
                    <div class="col-sm-10" id="followup">

                        <input type="date" class="form-control" name="fdate" </input>
                    </div>
                </div>
                <div class="form-group">
                    <div class="col-sm-offset-5 col-sm-12">
                        <button type="submit" class="btn btn-default">Submit</button>
                    </div>

                </div>

            </form>

        </div>
    </div>
<script type='text/javascript' src='/script/update.js'></script>   


</body>

</html>` ;
    res.send(htmltemplate);
});
app.get('/printprofile/:id',function(req,res){
   var id= req.params.id;
    var htmltemplate= `<!DOCTYPE html>
<style>

</style>
<html>

<head>
    <title>
        Print Profile
    </title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
</head>

<body>

        
                    <div id="content" class="container" style="width:inherit">
                        
                            <p id="profileid">${id}</p>
                            <p id="email"></p>
                            <p id="firstname"></p>
                            <p id="address"></p>
                            <p id="tob"></p>
                            <p id="height"></p>
                            <p id="pwd"></p>
                            <p id="highschool"></p>
                            <p id="masters"></p>
                            <p id="mothertongue"></p>
                            <p id="gotra"></p>
                            <p id="manglik"></p>
                            <p id="familytype"></p>
                            <p id="fatherdetail"></p>
                            <p id="siblingdetail"></p>
                            <p id="partnercomplexion"></p>
                            <p id="partneroccupation"></p>
                            <br>
                            <br>
                            <div id="pic1"></div>
                
                        
                            <p id="contactperson"></p>
                            <p id="mobile"></p>
                            <p id="middlename"></p>
                            <p id="city"></p>
                            <p id="dob"></p>
                            <p id="bodytype"></p>
                            <p id="bloodgp"></p>
                            <p id="employmentstatus"></p>
                            <p id="intermediate"></p>
                            <p id="otherqualification"></p>
                            <p id="religion"></p>
                            <p id="nakshatra"></p>
                            <p id="familydetail"></p>
                            <p id="aboutmother"></p>
                            <p id="partnerage"></p>
                            <p id="partnerbodytype"></p>
                            <p id="partnermaritalstatus"></p>
                            <p id="partnermoredetail"></p>
                            <br>
                            <br>
                            <div id="pic2"></div>
                
                        
                            <p id="gender"></p>
                            <p id="linkedid"></p>
                            <p id="lastname"></p>
                            <p id="relation"></p>
                            <p id="complexion"></p>
                            <p id="age"></p>
                            <p id="employmentdetail"></p>
                            <p id="graduation"></p>
                            <p id="fbid"></p>
                            <p id="caste"></p>
                            <p id="rashi"></p>
                            <p id="maritalstatus"></p>
                            <p id="familyvalues"></p>
                            <p id="aboutfather"></p>
                            <p id="motherdetail"></p>
                            <p id="partnerreligion"></p>
                            <p id="partnerheight"></p>
                            <p id="partnercaste"></p>
                            



                            <br>
                            <br>
                            <div id="pic3"></div>
            

                    </div>
                    <br>
                    <br>
                   <a href="/html/dashboard.html">Go to Dashboard</a><br>
                   <button onclick="myFunction()">Print this page</button><br>
<input type="text" id="_pid" placeholder="Enter Profile ID "><br>
                   <input type="text" id="email_pid" placeholder="Enter Email">
                   <button onclick="email()">Email</button>&nbsp&nbsp&nbsp<span id="loading"></span>


                </div>

                

                   

                

            

        
    <script type="text/javascript" src="/script/printprofile.js"></script>
</body>

</html>


`;
    res.send(htmltemplate);
});
app.get('/no_of_walkins',function(req,res){
    var username=req.session.auth.username;
    pool.query('select * from call_walkin_history where type_call_walkin= 1 and emp_username=$1',[username],function(err,result){
       
        if(err)
            {
                res.status(500).send(err.toString());
            }
        else
            {
                res.send(JSON.stringify(result.rows.length));
            }
    });
    
});

app.get('/no_of_callins',function(req,res){
    var username=req.session.auth.username;
    pool.query('select * from call_walkin_history where type_call_walkin= 0 and emp_username=$1',[username],function(err,result){
       
        if(err)
            {
                res.status(500).send(err.toString());
            }
        else
            {
                res.send(JSON.stringify(result.rows.length));
            }
    });
    
});
app.get('/no_of_paidmembers',function(req,res){
    var username=req.session.auth.username;
    pool.query('select * from user_status where stage>=3 and emp_username=$1',[username],function(err,result){
       
        if(err)
            {
                res.status(500).send(err.toString());
            }
        else
            {
                res.send(JSON.stringify(result.rows.length));
            }
    });
    
});


app.get('/allleadscount',function(req,res){
   pool.query('select * from user_status where stage=0',function(err,result){
       if(err)
           {
               res.status(500).send(err.toString());
           }
       else
           {
               res.send(JSON.stringify(result.rows.length));
           }
   }) ;
});
app.get('/allprospectscount',function(req,res){
   pool.query('select * from user_status where stage=1',function(err,result){
       if(err)
           {
               res.status(500).send(err.toString());
           }
       else
           {
               res.send(JSON.stringify(result.rows.length));
           }
   }) ;
});
app.get('/allopportunitycount',function(req,res){
   pool.query('select * from user_status where stage=2',function(err,result){
       if(err)
           {
               res.status(500).send(err.toString());
           }
       else
           {
               res.send(JSON.stringify(result.rows.length));
           }
   }) ;
});
app.get('/allmemberscount',function(req,res){
   pool.query('select * from user_status where stage>=3',function(err,result){
       if(err)
           {
               res.status(500).send(err.toString());
           }
       else
           {
               res.send(JSON.stringify(result.rows.length));
           }
   }) ;
});


app.get('/getlatest',function(req,res){
   pool.query('select * from call_walkin_history ',function(err,result){
       if(err)
           {
               res.send('error');
           }
       else
           {   
               //result.rows[0].contact_date=result.rows[0].contact_date+1;
               console.log(result.rows[0].contact_date);
               res.send(result.rows);
           }
   }) ;
});

app.get('/check-login', function(req, res) {
    if (req.session && req.session.auth && req.session.auth.username) {
        // Load the user object
        pool.query('SELECT * FROM emp_details WHERE username= $1', [req.session.auth.username], function(err, result) {
            if (err) {
                res.status(500).send(err.toString());
            } else {
                res.send(result.rows[0].username);
            }
        });
    } else {
        res.status(400).send('You are not logged in');
    }
});
app.get('/getlatest/:id',function(req,res){
  // var username = req.session.auth.username;
   // var username='testuser';
    console.log('welcome');
    pool.query('select * from call_walkin_history full outer join user_status on call_walkin_history.profile_id=user_status.profile_id where call_walkin_history.profile_id=$1 order by call_walkin_history.contact_date desc;',[req.params.id],function(err,result){
       if(err)
           {
               res.status(500).send(err.toString());
           }
        else
            {
                res.send(JSON.stringify(result.rows));
            }
    });
});
app.get('/viewprospects',function(req,res){
   var username = req.session.auth.username;
    pool.query('select * from user_status where stage >=1 and emp_username= $1',[username],function(err,result){
       
        if(err)
            {
                res.status(500).send(err.toString());
            }
        else
            {
                res.send(JSON.stringify(result.rows));
            }
    });
    
    
});
app.get('/viewleads',function(req,res){
   var username = req.session.auth.username;
    pool.query('select * from user_status where stage =0 and emp_username= $1',[username],function(err,result){
       
        if(err)
            {
                res.status(500).send(err.toString());
            }
        else
            {
                res.send(JSON.stringify(result.rows));
            }
    });
    
    
});
app.get('/viewallleads',function(req,res){
   
    pool.query('select * from user_status where stage =0',function(err,result){
       
        if(err)
            {
                res.status(500).send(err.toString());
            }
        else
            {
                res.send(JSON.stringify(result.rows));
            }
    });
    
    
});
app.get('/leadscount',function(req,res){
   var username = req.session.auth.username;
   // var username = 'testuser';
    pool.query('select * from user_status where emp_username = $1 and stage =0',[username],function(err,result){
        if(err)
            {
                res.status(500).send(err.toString());
            }
        else
            {
                res.send(JSON.stringify(result.rows.length));
            }
    });
});
app.get('/prospectscount',function(req,res){
   var username = req.session.auth.username;
   //var username = 'testuser';
    pool.query('select * from user_status where emp_username = $1 and stage >0',[username],function(err,result){
        if(err)
            {
                res.status(500).send(err.toString());
            }
        else
            {
                res.send(JSON.stringify(result.rows.length));
            }
    });
});


app.get('/logout', function(req, res) {
    delete req.session.auth;
    res.send('<http><head><meta http-equiv="Refresh" content="1; /"><h1>Logged Out</h1></head>');
});

app.get('/testdisplayapt',function(req,res){

    pool.query('select call_walkin_history.profile_id,call_walkin_history.contact_date,call_walkin_history.contact_no,call_walkin_history.type_call_walkin,user_status.stage from call_walkin_history inner join user_status on call_walkin_history.profile_id=user_status.profile_id where call_walkin_history.type_call_walkin=1',function(err,result){
                    if(err)
                    {
                        res.status(500).send(err.toString());
                        
                    }
                    else
                        {  //controlwrite=0;
                            res.send(JSON.stringify(result.rows));
                        }
    });
});

app.get('/displayapt1',function(req,res){
var username=req.session.auth.username;
    console.log(username+' hh');
    pool.query('select call_walkin_history.profile_id,call_walkin_history.contact_date,call_walkin_history.contact_no,call_walkin_history.type_call_walkin,call_walkin_history.next_followup_date,call_walkin_history.appointment,user_status.stage from call_walkin_history inner join user_status on call_walkin_history.profile_id=user_status.profile_id where call_walkin_history.emp_username=$1',[username],function(err,result){
                    if(err)
                    {
                        res.status(500).send(err.toString());
                        
                    }
                    else
                        {  //controlwrite=0;
                            res.send(JSON.stringify(result.rows));
                        }
    });
});

app.post('/api/photo/:id/:no', function(req, res) {
    var no=req.params.no;
    
    if(no==='1')
        {
    upload(req, res, function(err) {
        if (err) {
            return res.end("Error uploading file.");
        }
        else
            {   if(req.file)
                {
               console.log(req.file.originalname);
                console.log(req.file.filename);
                
                pool.query('update user_details set profile_pic_1=$1 where profile_id=$2',[req.file.filename,req.params.id],function(err,result){
                if(err)
                    {
                        res.status(500).send(err.toString());
                        
                    }
                    else
                        {  //controlwrite=0;
                            var htmltemp=` <h3> 1st Photo Successfully uploaded </h3><hr><br> <a href='/upload_photo_form/${req.params.id}/2'>Proceed For Second </a>`;
                            res.send(htmltemp);
                        }
                
                
            });
                }
             else
                 {
                     var htmltemplate = ` <h1> You are uploading a empty file ! </h1><br><a href="/upload_photo_form/${req.params.id}/2">To Skip </a> <br>
                                                <a href='/upload_photo_form/${req.params.id}/1'>Click to upload it again </a>`;
                     res.send(htmltemplate);
                 }
            }
    });
        }
    if(no==='2')
        {
    upload(req, res, function(err) {
        if (err) {
            return res.end("Error uploading file.");
        }
        else
            {   if(req.file)
                {
               console.log(req.file.originalname);
                console.log(req.file.filename);
                
                pool.query('update user_details set profile_pic_2=$1 where profile_id=$2',[req.file.filename,req.params.id],function(err,result){
                if(err)
                    {
                        res.status(500).send(err.toString());
                        
                    }
                    else
                        {  //controlwrite=0;
                            var htmltemp=` <h3> 2nd Photo Successfully uploaded </h3><hr><br> <a href='/upload_photo_form/${req.params.id}/3'>Proceed For Third</a>`;
                            res.send(htmltemp);
                        }
                
                
            });
                }
             else
                 {
                     var htmltemplate = ` <h1> You are uploading a empty file ! </h1><br><a href="/upload_photo_form/${req.params.id}/3">To Skip </a> <br>
                                                <a href='/upload_photo_form/${req.params.id}/2'>Click to upload it again </a>`;
                     res.send(htmltemplate);
                 }
            }
    });
        }
    if(no==='3')
        {
    upload(req, res, function(err) {
        if (err) {
            return res.end("Error uploading file.");
        }
        else
            {   if(req.file)
                {
               console.log(req.file.originalname);
                console.log(req.file.filename);
                
                pool.query('update user_details set profile_pic_3=$1 where profile_id=$2',[req.file.filename,req.params.id],function(err,result){
                if(err)
                    {
                        res.status(500).send(err.toString());
                        
                    }
                    else
                        {  //controlwrite=0;
                            var htmltemp=` <h3> 3rd Photo Successfully uploaded </h3><hr><br> <a href='/upload_photo_form/${req.params.id}/4'>Proceed For ID  Upload</a>`;
                            res.send(htmltemp);
                            
                        }
                
                
            });
                }
             else
                 {
                     var htmltemplate = ` <h1> You are uploading a empty file ! </h1><br><a href="/redirect">To Skip </a> <br>
                                                <a href='/upload_photo_form/${req.params.id}/3'>Click to upload it again </a>`;
                     res.send(htmltemplate);
                 }
            }
    });
        }
    if(no==='4')
        {
            
            
             upload(req, res, function(err) {
        if (err) {
            return res.end("Error uploading file.");
        }
        else
            {   if(req.file)
                {
               console.log(req.file.originalname);
                console.log(req.file.filename);
                    var id_proof_type=req.body.id_proof_type;
            var id_proof_other=req.body.id_proof_other;
            
        if(id_proof_type==='Others')
            id_proof_type=id_proof_other;
            console.log(id_proof_other);
            console.log(id_proof_type);
                
                pool.query('update user_details set id_proof_image=$1 where profile_id=$2',[req.file.filename,req.params.id],function(err,result){
                if(err)
                    {
                        res.status(500).send(err.toString());
                        
                    }
                    else
                        {  
                            pool.query('update user_details set id_proof_type=$1 where profile_id=$2',[id_proof_type,req.params.id],function(err,result){
                if(err)
                    {
                        res.status(500).send(err.toString());
                        
                    }
                    else
                        {  
                            res.redirect('/redirect');
                        }
                
                
            });
                        }
                
                
            });
                }
             else
                 {
                     var htmltemplate = ` <h1> You are uploading a empty file ! </h1><br><a href="/redirect">To Skip </a> <br>
                                                <a href='/upload_photo_form/${req.params.id}/4'>Click to upload it again </a>`;
                     res.send(htmltemplate);
                 }
            }
    });
        }
    
});

app.get('/comparedetails',function(req,res){
   
    pool.query('select * from user_details',function(err,result){
       if(err)
           {
               res.status(500).send(err.toString());
           }
        else
            {
                res.send(JSON.stringify(result.rows));
            }
    });
});
app.get('/uploads/:photoid',function(req,res){
    
    if(req.params.photoid==='blank')
        res.send(' You have not uploaded the photograph');
    else
   res.sendFile(path.join(__dirname,'uploads',req.params.photoid)); 
});
app.get('/upload_photo_form/:id/:no',function(req,res){
    var id=req.params.id;
    var no= req.params.no;
    var skippart='';
    if(no==='1')
        skippart=`/upload_photo_form/${id}/2`;
    else
        if(no==='2')
        skippart=`/upload_photo_form/${id}/3`;
    else
        if(no==='3')
            skippart=`/upload_photo_form/${id}/4`;
    else
        skippart='/redirect';
    var htmltemplate;
    if(no==='4')
        {
             htmltemplate= `<div style="text-align=center">
                <span style="text-align:center"> Upload Valid ID proof</span><br>
          <span id="profileId">${id}</span><hr><br>
          <form id        =  "uploadForm"
     enctype   =  "multipart/form-data"
     action    =  "/api/photo/${id}/${no}"
     method    =  "post"
>
<div class="form-group">
 <label for="idproof">ID Proof Type</label><br>            
                    <select id="idprooftype" name="id_proof_type" required>
                    <option>-Select-</option>
                    <option>ADHAAR Card</option>
                    <option>Driving Liscence</option>
                    <option>Passport</option>
                    <option>Voter Id</option>
                    <option>Others</option>
                    </select>
                    <br>
                    </div>
                  <div class="form-group">
                    <input class="form-control input-lg" type="text" id="idproof" name="id_proof_other" placeholder="Specify If Others" required>
                  </div>
<input type="file" name="userPhoto" />
<input type="submit" value="Upload Image" name="submit">
</form>
<br><span><a href=${skippart}>Skip</a></span></div>`;
        }
    else
        {
    htmltemplate= `<div style="text-align=center">
                <span style="text-align:center"> Upload Profile Pictures - ${no}</span><br>
          <span id="profileId">${id}</span><hr><br>
          <form id        =  "uploadForm"
     enctype   =  "multipart/form-data"
     action    =  "/api/photo/${id}/${no}"
     method    =  "post"
>
<input type="file" name="userPhoto" />
<input type="submit" value="Upload Image" name="submit">
</form>
<br><span><a href=${skippart}>Skip</a></span></div>`;
        }
    
    res.send(htmltemplate);
    
});
app.get('/redirect',function(req,res){
   var htmltemplate= `<div style="text-align:center">
                        <h2> Done !</h2><br>
                          <a href='/'>Click to return to main menu !</a></div>`;
    res.send(htmltemplate);
});
/*app.get('/display',function(req,res){
    pool.query('SELECT * FROM test',function(err,result){
           if (err) {
              res.status(500).send(err.toString());
           } else {
              res.send(JSON.stringify(result.rows));    
           }
       }); 
});
/*app.get('/pid_write/:pid',function(req,res){  //no need of global pid writing
   
    pid= req.params.pid;
    console.log(pid);
    res.end('done!');
});*/ 
app.get('/autoid',function(req,res){
    
   pool.query('select * from auto_id where entry=1',function(err,result){
       if(err)
           {
               res.status(500).send(err.toString());
           }
       else
           {  //controlwrite=1;
                 var profile_id = result.rows[0].id;
               console.log('here you '+profile_id);
               var integer_id=0;
            for(var i=2;i<profile_id.length;i++)
                {
                    var k= parseInt(profile_id[i]);
                    integer_id=integer_id*10+k;
                }
            integer_id+=1;
            profile_id=integer_id.toString();
            if(profile_id.length===5)
                profile_id='0'+profile_id;
            else
                if(profile_id.length===4)
                profile_id='00'+profile_id;
            else
                if(profile_id.length===3)
                profile_id='000'+profile_id;
            else
                if(profile_id.length===2)
                profile_id='0000'+profile_id;
            else
                profile_id='00000'+profile_id;
               console.log('change process');
               console.log('changed id'+profile_id);
               
            pool.query('update auto_id set id=$1 where entry=1',[profile_id],function(err,result){
                if(err)
                    {
                        res.status(500).send(err.toString());
                        
                    }
                    else
                        {
                            console.log('updated id');
                            
                        }
                  //  controlwrite=0;
                
            });
               
               res.send(JSON.stringify(result.rows));
               
           }
   }) ;
});
app.post('/create',function(req,res){
    
   var profile_id= req.body.profile_id;
    console.log(profile_id);
    var name= req.body.name;
    var phone= req.body.phone;
    var photo='blank';
   // while(controlwrite===1);
   // controlwrite=1;
    pool.query('insert into test (profile_id,name,mobile,dp) values ($1,$2,$3,$4)',[profile_id,name,phone,photo],function(err, result) {
        if (err) {
            res.status(500).send(err.toString());
        } else {
            
            console.log('data inserted !');
            
            res.send('done');
        }
    });
    
    
    
});
var port = 8086; // Use 8080 for local development because you might already have apache running on 80
app.listen(8086, function () {
  console.log(`test app listening on port ${port}!`);
});


