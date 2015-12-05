var randomMessages = [
                       '@ramomarr', '<3', 'Hey baby, when I write, I\'m the hero of my own shit',
                       'Sigueme en Twitter', 'muse', '(:', '@ramomarr con doble r por favor',
                       'Password no es un password', 'no era penal',
                       'wat', 'yolo', '1234', 'Math.floor(Math.random()*random_messages.length);',
                       'Hecho en México cabrones', 'Tacos', 'Adoro los tacos', 'Tengo hambre', 'Mensaje subliminal',
                       'dogeeeeeeeeeee', 'en desarrollo', 'Tengo hambre', 'Hola, hola', '1, 2, 3, probando',
                       'direcciones de memoria', 'Congratulations! You are the 10,000th visitor, click to get your prize',
                       'swag', 'uniswag', 'se me olvido algo...', '#uniswag', 'fuck da system'
                       ];

var User = Spine.Model.sub();
User.configure('User', 'enrollment');
User.extend(Spine.Model.Local);

var Main = Spine.Controller.sub({
  events: {
    'click #submit_btn': 'submitForm',
    'change #HTMLUsuCve': 'setAccountType',
    'click #account_indicator': 'wtfIsEAndM'
  },

  elements: {
    '#HTMLUsuCve': 'enrollment',
    '#HTMLPassword': 'password',
    '#account_type': 'accountType',
    '#account_indicator': 'accountIndicator',
    '#DatosUANL': 'loginForm',
    '#error_msg': 'errorMsg'
  },

  init: function() {
    this.log('2014 - Omar Eduardo Garza @ramomarr.');
    this.log(this.getRandomMsg());
    User.fetch();
    this.user = this.getUser();
    if (this.firstUse === false) {
      this.fillForm();
      this.setAccountType();
    }
  },

  getRandomMsg: function() {
    var randomNumber = Math.floor(Math.random()*randomMessages.length);
    return randomMessages[randomNumber].toUpperCase();
  },

  wtfIsEAndM: function() {
    window.alert('E = Cuenta de estudiante.\nM = Cuenta de maestro.\n');
  },

  setAccountType: function() {
    if (this.enrollment.val().length > 6) {
      this.log('Account type set to student.');
      this.accountType.attr('value', '01');
      this.accountIndicator.html('E'); // Estudiante
    }

    else if (this.enrollment.val().length === 0)
    {
      this.log('There\'s no data in the form.');
      this.accountIndicator.html('N'); // Ningun dato
    }

    else {
      this.log('Account type set to teacher.');
      this.accountType.val('value', '02');
      this.accountIndicator.html('M'); // Maestro
    }
  },

  getUser: function() {
    var user = User.first();
    if (user === undefined) {
      this.log('First use, new user created.');
      this.firstUse = true;
      return User.create({'enrollment': ''});
    }
    else {
      this.log('User loaded.');
      this.firstUse = false;
      return user;
    }
  },

  saveEnrollment: function() {
    this.log('Saved enrollment.');
    this.user.enrollment = this.enrollment.val();
    this.user.save();
  },

  saveData: function() {
    this.saveEnrollment();
  },

  fillForm: function() {
    this.log('Form data loaded.');
    this.enrollment.val(this.user.enrollment);
  },

  validateForm: function() {
    if((typeof(this.enrollment.val()) !== 'string') || (this.enrollment.val().length < 7) ||
      (this.password.val().length <= 0))
    {
      this.log('Bad enrollment/password.');
      return false;
    }
  },

  submitForm: function() {
    if(this.validateForm() === false) {
      this.errorMsg.css('visibility', 'visible');
    }
    else
    {
      this.saveData();
      this.loginForm.submit();
      this.errorMsg.css('visibility', 'hidden');
    }
  }
});

// ALWAYS SET el ELEMENT !!1!!1!
jQuery(function ($) {
  return new Main ({
    el: $('#main_container')
  });
});
