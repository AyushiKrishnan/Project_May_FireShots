var pic_1 = '';
var pid;

function email() {
    var email_pid = document.getElementById('email_pid').value;
    var profileid = document.getElementById('_pid').value;
    document.getElementById('loading').innerHTML = 'sending email . . . .';

    var content = document.getElementById('content').innerHTML;
    // Create a request object
    var request = new XMLHttpRequest();

    // Capture the response and store it in a variable
    request.onreadystatechange = function() {
        if (request.readyState === XMLHttpRequest.DONE) {
            // Take some action
            if (request.status === 200) {
                alert(this.responseText);
                document.getElementById('loading').innerHTML = 'sent';

            } else if (request.status === 403) {

            } else if (request.status === 500) {
                alert('Something went wrong on the server');

            } else {
                alert('Something went wrong on the server');

            }

        }

    };



    request.open('POST', '/send_email', true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify({ email_pid: email_pid, content: content, pic_1: pic_1, pid: pid, profileid: profileid }));


}





function fill() {
    var id = document.getElementById('profileid').innerHTML;
    var request = new XMLHttpRequest();

    request.onreadystatechange = function() {

        if (request.readyState === XMLHttpRequest.DONE) {

            if (request.status === 200) {
                console.log('hi');
                var data = JSON.parse(this.responseText);
                var i = 0;
                document.getElementById("profileid").innerHTML = `<b>Profile Id:</b>${data[i].profile_id}`;
                document.getElementById("email").innerHTML = `<b>Email:</b>${data[i].email}`;
                document.getElementById("firstname").innerHTML = `<b>First Name:</b>${data[i].candidate_first_name}`;
                document.getElementById("address").innerHTML = `<b>Address:</b>${data[i].address}`;
                document.getElementById("tob").innerHTML = `<b>Time of Birth:</b>${data[i].time_of_birth}`;
                document.getElementById("height").innerHTML = `<b>Height:</b>${data[i].height}`;
                document.getElementById("pwd").innerHTML = `<b>Physically Challenged:</b>${data[i].physically_challenged}`;
                document.getElementById("highschool").innerHTML = `<b>High School:</b>${data[i].high_school}`;
                document.getElementById("masters").innerHTML = `<b>Masters:</b>${data[i].masters}`;
                document.getElementById("mothertongue").innerHTML = `<b>Mother Tongue:</b>${data[i].mother_tongue}`;
                document.getElementById("gotra").innerHTML = `<b>Gotra:</b>${data[i].gotra}`;
                document.getElementById("manglik").innerHTML = `<b>Manglik:</b>${data[i].manglik}`;
                document.getElementById("familytype").innerHTML = `<b>Family Type:</b>${data[i].family_type}`;
                document.getElementById("fatherdetail").innerHTML = `<b>Father Details:</b>${data[i].details_of_father}`;
                document.getElementById("siblingdetail").innerHTML = `<b>Sibling Details:</b>${data[i].sibling_details}`;
                document.getElementById("partnercomplexion").innerHTML = `<b>Preferred Partner Complexion:</b>${data[i].preferred_partner_complexion}`;
                document.getElementById("partneroccupation").innerHTML = `<b>Preferred Partner Occupation:</b>${data[i].preferred_partner_occupation}`;
                document.getElementById("contactperson").innerHTML = `<b>Person of Contact:</b>${data[i].person_of_contact}`;
                document.getElementById("mobile").innerHTML = `<b>Mobile:</b>${data[i].mobile_no}`;
                document.getElementById("middlename").innerHTML = `<b>Middle Name:</b>${data[i].candidate_middle_name}`;
                document.getElementById("city").innerHTML = `<b>City:</b>${data[i].city}`;
                document.getElementById("dob").innerHTML = `<b>Date of Birth:</b>${data[i].date_of_birth}`;
                document.getElementById("bodytype").innerHTML = `<b>Body Type:</b>${data[i].body_type}`;
                document.getElementById("bloodgp").innerHTML = `<b>Blood Group:</b>${data[i].blood_group}`;
                document.getElementById("employmentstatus").innerHTML = `<b>Employment Status:</b>${data[i].employment_status}`;
                document.getElementById("intermediate").innerHTML = `<b>Intermediate:</b>${data[i].intermediate}`;
                document.getElementById("otherqualification").innerHTML = `<b>Other Qualification:</b>${data[i].other_qualification}`;
                document.getElementById("religion").innerHTML = `<b>Religion:</b>${data[i].religion}`;
                document.getElementById("nakshatra").innerHTML = `<b>Nakshtra:</b>${data[i].nakshtra}`;
                document.getElementById("familydetail").innerHTML = `<b>Family Details:</b>${data[i].details_of_family}`;
                document.getElementById("aboutmother").innerHTML = `<b>About Mother:</b>${data[i].about_mother}`;
                document.getElementById("partnerage").innerHTML = `<b>Preferred Partner Age:</b>${data[i].preferred_partner_age}`;
                document.getElementById("partnerbodytype").innerHTML = `<b>Preferred Partner Body Type:</b>${data[i].preferred_partner_body_type}`;
                document.getElementById("partnermaritalstatus").innerHTML = `<b>Preferred Partner Marital Status:</b>${data[i].preferred_partner_marital_status}`;
                document.getElementById("partnermoredetail").innerHTML = `<b>Preferred Partner More Details:</b>${data[i].preferred_partner_more_details}`;
                document.getElementById("gender").innerHTML = `<b>Gender:</b>${data[i].gender}`;
                document.getElementById("linkedid").innerHTML = `<b>Linkedin Id:</b>${data[i].linkedin_id}`;
                document.getElementById("lastname").innerHTML = `<b>Last Name:</b>${data[i].candidate_surname}`;
                document.getElementById("relation").innerHTML = `<b>Relation with Candidate:</b>${data[i].relation_with_candidate}`;
                document.getElementById("complexion").innerHTML = `<b>Complexion:</b>${data[i].complexion}`;
                document.getElementById("age").innerHTML = `<b>Age:</b>${data[i].age}`;
                document.getElementById("employmentdetail").innerHTML = `<b>Employment Details:</b>${data[i].employment_details}`;
                document.getElementById("graduation").innerHTML = `<b>Graduation:</b>${data[i].graduation}`;
                document.getElementById("fbid").innerHTML = `<b>Facebook Id:</b>${data[i].facebook_id}`;
                document.getElementById("caste").innerHTML = `<b>Caste:</b>${data[i].caste}`;
                document.getElementById("rashi").innerHTML = `<b>Rashi:</b>${data[i].rashi}`;
                document.getElementById("maritalstatus").innerHTML = `<b>Marital Status:</b>${data[i].marital_status}`;
                document.getElementById("familyvalues").innerHTML = `<b>Family Values:</b>${data[i].family_values}`;
                document.getElementById("aboutfather").innerHTML = `<b>About Father:</b>${data[i].about_father}`;
                document.getElementById("motherdetail").innerHTML = `<b>Mother Details:</b>${data[i].details_of_mother}`;
                document.getElementById("partnerreligion").innerHTML = `<b>Preferred Partner Religion:</b>${data[i].preferred_partner_religion}`;
                document.getElementById("partnerheight").innerHTML = `<b>Preferred Partner Height:</b>${data[i].preferred_partner_height}`;
                document.getElementById("partnercaste").innerHTML = `<b>Preferred Partner Caste:</b>${data[i].preferred_partner_caste}`;
                document.getElementById("pic1").innerHTML = `<img class="img-responsive" src="/uploads/${data[i].profile_pic_1}" />`;
                document.getElementById("pic2").innerHTML = `<img class="img-responsive" src="/uploads/${data[i].profile_pic_2}" />`;
                document.getElementById("pic3").innerHTML = `<img class="img-responsive" src="/uploads/${data[i].profile_pic_3}" />`;

                pic_1 = data[i].profile_pic_1;
                pid = data[i].profile_id;
                document.getElementById("history").innerHTML = hcontent;

            }
        }
    };
    request.open('GET', `/user_details/${id}`, true);
    request.send(null);
}
fill();

function myFunction() {
    window.print();
}