var User = Spine.Model.sub();
User.configure("User", "enrollment");
User.extend(Spine.Model.Local);

var Main = Spine.Controller.sub({
  events: {
    "click #submit_btn": "submitForm",
    "change #HTMLUsuCve": "setAccountType",
    "click #account_indicator": "wtfIsEAndM"
  },

  elements: {
    "#HTMLUsuCve": "enrollment",
    "#HTMLPassword": "password",
    "#account_type": "account_type",
    "#account_indicator": "account_indicator",
    "#DatosUANL": "login_form",
    "#error_msg": "error_msg"
  },

  init: function() {
    this.log("2014 - Omar Eduardo Garza @ramomarr");
    this.log(this.getRandomMsg());
    User.fetch();
    var first_use;
    var user;
    this.user = this.getUser();
    if (this.first_use == false) {
      this.fillForm();
      this.setAccountType();
    }
  },

  getRandomMsg: function() {
    var random_number = Math.floor(Math.random()*random_messages.length);
    return random_messages[random_number].toUpperCase()
  },

  wtfIsEAndM: function() {
    alert("E = Cuenta de estudiante.\nM = Cuenta de maestro.\n");
  },

  setAccountType: function() {
    if (this.enrollment.val().length > 6) {
      this.log("Account type set to student.");
      this.account_type.attr("value", "01");
      this.account_indicator.html("E"); // Estudiante
    }

    else if (this.enrollment.val().length == 0)
    {
      this.log("There's no data in the form.");
      this.account_indicator.html("N"); // Ningun dato
    }

    else {
      this.log("Account type set to teacher.");
      this.account_type.val("value", "02");
      this.account_indicator.html("M"); // Maestro
    }
  },

  getUser: function() {
    var user = User.first();
    if (user === undefined) {
      this.log("First use, new user created.");
      this.first_use = true;
      return User.create({"enrollment": ""});
    }
    else {
      this.log("User loaded.");
      this.first_use = false;
      return user
    }
  },

  saveEnrollment: function() {
    this.log("Saved enrollment.");
    this.user.enrollment = this.enrollment.val();
    this.user.save();
  },

  saveData: function() {
    this.saveEnrollment();
  },

  fillForm: function() {
    this.log("Form data loaded.");
    this.enrollment.val(this.user.enrollment);
  },

  validateForm: function() {
    if((typeof(this.enrollment.val()) != 'string') || (this.enrollment.val().length < 7) ||
      (this.password.val().length <= 0))
    {
      this.log("Bad enrollment/password.");
      return 'error';
    }
  },

  submitForm: function() {
    if(this.validateForm() == 'error')
      this.error_msg.css("visibility", "visible");
    else
    {
      _gaq.push(['_trackEvent', "submit_btn", 'clicked']);
      this.saveData();
      this.login_form.submit();
      this.error_msg.css("visibility", "hidden");
    }
  }
});

// ALWAYS SET el ELEMENT !!1!!1!
jQuery(function ($) {
  return new Main ({
    el: $("#main_container")
  });
});

var random_messages = ["@ramomarr", "<3", "Hey baby, when I write, I'm the hero of my own shit", 
                       "Sigueme en Twitter", "OLA K ASE", "Estaba aburrido :C",
                       "gorillaz", "muse", "daft punk", "(:", "@ramomarr con doble r por favor",
                       "Password no es un password", "no era penal",
                       "wat", "yolo",
                       "race, life's race, and i'm gonna win yes i'm gonna win",
                       "1234", "Math.floor(Math.random()*random_messages.length);",
                       "Javascript me caga", "Ruby ftw", "Se me acaban las ideas",
                       "I like the sound of the broken pieces", "Hecho en México cabrones",
                       "Tacos", "Adoro los tacos", "Tengo hambre", "Mensaje subliminal",
                       "dogeeeeeeeeeee", "en desarrollo", "Tengo hambre",
                       "Hola, hola", "1, 2, 3, probando", "direcciones de memoria",
                       "Congratulations! You are 10,000th visitor,\
                       click to get your prize", "swag", "uniswag", "se me olvido algo...", "#uniswag",
                       "fuck the system"
                       ];