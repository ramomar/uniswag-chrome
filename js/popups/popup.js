var randomMessages = [
                       '@ramomarr', '<3', 'Hey baby, when I write, I\'m the hero of my own shit',
                       'Sigueme en Twitter', 'muse', '(:', '@ramomarr con doble r por favor',
                       'Password no es un password', 'no era penal',
                       'wat', 'yolo', '1234', 'Math.floor(Math.random()*random_messages.length);',
                       'Hecho en México cabrones', 'Tacos', 'Adoro los tacos', 'Tengo hambre', 'Mensaje subliminal',
                       'dogeeeeeeeeeee', 'en desarrollo', 'Tengo hambre', 'Hola, hola', '1, 2, 3, probando',
                       'direcciones de memoria', 'Congratulations! You are the 10,000th visitor, click to get your prize',
                       'swag', 'uniswag', 'se me olvido algo...', '#uniswag',
                       'lol, sorry, a friend used to say that a lot. we were in high school and it was kind of funny',
                       'we just where introverted 15 year olds who liked internet memes, good old days',
                       'I thought cursing made me cool',
                       'Maestros:',
                       'I tried to infiltrate but now I\'m losing',
                       'Show me mercy please',
                       'Yeah it\'s holding me\n' +
                       'Morphing me\n' +
                       'And forcing me to strive',
                       'Don\'t let the sun of your heart decay',
                       'Don\'t grow up too fast\n' +
                       'And don\'t embrace the past\n' +
                       'This life\'s too good to last\n' +
                       'And i\'m too young to care',
                       'Don\'t kid yourself and don\'t fool yourself',
                       'This life could be the last',
                       'We are too young to see',
                       'You\'ve been bit by a true believer\n' +
                       'You\'ve been bitten by someone\'s false beliefs',
                       'I feel older than I should and Jesus knows',
                       'And I hate time, it passes faster than it should',
                       'You walk in beauty like the night of cloudless climbs and starry skies',
                       'I can see God in your eyes and all that\'s best of dark and bright',
                       'Me prometieron demasiado',
                       'Spread our codes to the stars',
                       'Tell us your final wish',
                       'Now we know you can never return',
                       'Let\'s start over again',
                       'Why can\'t we start it over again?',
                       'Just let us start it over again',
                       'And we\'ll be good',
                       'This time we\'ll get it...',
                       'Get it right',
                       'It\'s our last chance to forgive ourselves',
                       'Reality is catching up with me',
                       'Taking my inner child, I\'m fighting for custody',
                       'Can we get much higher?',
                       'So high',
                       'Oh, oh, oh, oh, oh, oh, oh, oh, oh',
                       'So I told you',
                       'And I’ll light the fuse',
                       'You won’t pull ahead',
                       'I’ll keep up the pace',
                       'And I’ll reveal my strength',
                       'To the whole human race',
                       'Yes I am prepared',
                       'To stay alive',
                       'And I won’t give in',
                       'Because I choose to thrive',
                       'And during the struggle\n' +
                       'They will pull us down' +
                       'Please, please let\'s use this chance to turn things around',
                       'And tonight we can truly say together we\'re invincible',
                       'You will become tired, Siddhartha.',
                       'I will become tired.',
                       'You will fall asleep, Siddhartha.',
                       'I will not fall asleep.',
                       'You will die, Siddhartha.',
                       'I will die.',
                       'Very well and what can you give? What have you learned that you can give?',
                       'I can think, I can wait, I can fast.',
                       'Is that all?',
                       'I think that is all.',
                       'Hope you\'re fine\n' +
                       'Hope you\'re great\n' +
                       'Hope you\'re not alone in this town\n' +
                       'Hope you have good friend to talk\n' +
                       'Hope you will soon find a job\n' +
                       'Now you smile right back at me\n' +
                       'You see that is what I need\n',
                       'Stop watching TV',
                       'I\'ll go outside, I\'ll walk some more\n' +
                       'To see what is next to me\n' +
                       'And I saw you and then I knew\n' +
                       'How your smile can give some peace',
                       'Rhythm \n' +
                       'You have it or you don\'t, that\'s a fallacy',
                       'Come let the revolution take its toll if you could\n' +
                       'Flick a switch and open your third eye, you\'d see that\n' +
                       'We should never be afraid to die\n' +
                       'So come on'
                       ];

var User = Spine.Model.sub();
User.configure('User', 'enrollment');
User.extend(Spine.Model.Local);

var Main = Spine.Controller.sub({
  events: {
    'click #submit_btn': 'submitForm',
    'change #HTMLUsuCve': 'setAccountType',
    'click #account_indicator': 'whatIsEAndM'
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
    this.log('2014 - Eduardo Garza @ramomarr.');
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

  whatIsEAndM: function() {
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
