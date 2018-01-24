function Validate() {
    var pwdBtn=document.getElementById('password');
    var pdwCrm=document.getElementById('passwordConfirm');
    var pdwFrm=document.getElementById('pdwFrm');
    var pdwCrmFrm=document.getElementById('pdwCrmFrm');
    var SubmitBtn=document.getElementById('sign-submit');
    if (pwdBtn.value.length >= 6 && pwdBtn.value === pdwCrm.value && verifyEmail()) {
        if(document.getElementById('termsRead').checked){
            SubmitBtn.disabled = false;
        }else{
           SubmitBtn.disabled = true; 
        }
        
        document.getElementById('nomatch').style.visibility = "hidden";
        pwdFrm.className = "form-group has-success";
        pwdCrmFrm.className = "form-group has-success";
    } else {
        SubmitBtn.disabled = true;
        document.getElementById('nomatch').style.visibility = "visible";
         
        pwdFrm.className = "form-group has-error";
        pwdCrmFrm.className = "form-group has-error";
    }

}


    function verifyEmail(){
    var SubmitBtn=document.getElementById('sign-submit');
       
    var status = false;

    var emailRegEx = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;

         if (document.register.email.value.search(emailRegEx) == -1) {

              document.getElementById('badEmail').style.visibility = "visible";
              SubmitBtn.disabled = true;

         }

         else {

             document.getElementById('badEmail').style.visibility = "hidden";
             status = true;
             return status;
         }

         

   }


function addressForm(){
    
    var addSubBtn = document.getElementById('addressSubmit');
    var addInput = document.getElementById('addressInput');
    var phoneInput = document.getElementById('phoneInput');
    var cityInput = document.getElementById('cityInput');
    var zipInput = document.getElementById('zipInput');
    var nameInput = document.getElementById('nameInput');
    
    if(addInput.value.length === 0 || phoneInput.value.length === 0 || cityInput.value.length === 0 || zipInput.value.length === 0 || nameInput.value.length === 0 ){
       addSubBtn.disabled = true;
       
       }else{
       addSubBtn.disabled = false;
       }
     
}
