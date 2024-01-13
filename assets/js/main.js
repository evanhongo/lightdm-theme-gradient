'use strict';

var show_message = function show_message(msg) {
  $('.message').text(msg);
};
var clear_message = function clear_message() {
  show_message('');
};

var cache = {
  set: function (key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  get: function (key) {
    var res = localStorage.getItem(key);
    if (res) {
      return JSON.parse(res);
    }
  }
}

var default_user = function default_user() {
  var last = cache.get('user');
  if (!last) return 0;
  for (var i = 0; i < lightdm.users.length; ++ i) {
    if (lightdm.users[i].username === last) {
      return i;
    }
  }
  return 0;
};
var default_session = function default_session() {
  var last = cache.get('session');
  if (!last) return 0;
  for (var i = 0; i < lightdm.sessions.length; ++ i) {
    if (lightdm.sessions[i].name === last) {
      return i;
    }
  }
  return 0;
};
var default_language = function default_language() {
  var last = cache.get('language');
  if (!last) return 0;
  for (var i = 0; i < lightdm.languages.length; ++ i) {
    if (lightdm.languages[i].name === last) {
      return i;
    }
  }
  return 0;
};

var now_user = default_user();
var now_session = default_session();
var now_language = default_language();

var change_avatar = function change_avatar(name) {
  $('.avatar-img').css('background-image', 'url(assets/img/stickers/' + name + '.png)');
}

var switch_user = function switch_user(index) {
  now_user = index;
  var choosing = lightdm.users[index];

  $('.user').text(choosing.display_name);

  clear_message();
  lightdm.cancel_autologin();
  if (lightdm.authentication_user) {
    lightdm.cancel_authentication();
  }
  lightdm.authenticate(choosing.username);
  cache.set('user', choosing.username);
  change_avatar('primary-' + (index % 4 + 1));
};
var switch_session = function switch_session(index) {
  now_session = index;
  var choosing = lightdm.sessions[index];
  $('.session .content').text(choosing.name);
  cache.set('session', choosing.name);
};
var switch_language = function switch_language(index) {
  now_language = index;
  var choosing = lightdm.languages[index];
  $('.language .content').text(choosing.name);
  cache.set('language', choosing.name);
};

var password_failed_times = 0;
var authentication_complete = function authentication_complete() {
  if (lightdm.is_authenticated) {
    lightdm.start_session(lightdm.sessions[now_session].key);
  } else {
    switch_user(now_user);
    change_avatar('password-' + ((password_failed_times ++) % 3 + 1));
    show_message('Password wrong (๑´ㅂ`๑)');
    $('.form').addClass('shake-anime');
    setTimeout(function () {
      $('.form').removeClass('shake-anime');
    }, 500);
  }
};

var submit = function submit() {
  var password = $('.password').val();
  if (password) {
    change_avatar('loading');
    show_message('Confirming... (,,・ω・,,)');
    lightdm.respond(password);
  } else {
    show_message('Please enter your password (๑•́ ₃ •̀๑)');
  }
  return false;
};

var last = function last(i, n) {
  return i ? i - 1 : n - 1;
}
var next = function next(i, n) {
  return (i + 1) % n;
}

var init = function init() {
  lightdm.authentication_complete.connect(authentication_complete); 
  switch_user(now_user);
  switch_session(now_session);
  switch_language(now_language);

  $('.form').submit(submit);

  // hide '<' and '>' button if no other options avaliable
  if (lightdm.users.length === 1) {
    $('.user-panel .last').hide();
    $('.user-panel .next').hide();
  } else {
    $('.user-panel .last').click(function () { switch_user(last(now_user, lightdm.users.length)); });
    $('.user-panel .next').click(function () { switch_user(next(now_user, lightdm.users.length)); });
  }
  if (lightdm.sessions.length === 1) {
    $('.session .last').hide();
    $('.session .next').hide();
  } else {
    $('.session .last').click(function () { switch_session(last(now_session, lightdm.sessions.length)); });
    $('.session .next').click(function () { switch_session(next(now_session, lightdm.sessions.length)); });
  }
  if (lightdm.languages.length === 1) {
    $('.language .last').hide();
    $('.language .next').hide();
  } else {
    $('.language .last').click(function () { switch_language(last(now_language, lightdm.languages.length)); });
    $('.language .next').click(function () { switch_language(next(now_language, lightdm.languages.length)); });
  }

  $('.password').focus();

  var buttons = [
    "shutdown",
    "restart",
    "suspend",
    "hibernate",
  ];

  buttons.forEach(function (type) {
    if (!lightdm['can_' + type]) {
      $('.' + type).hide();
    } else {
      $('.' + type).click(function () {
        lightdm[type]();
      });
    }
  });

};

if (typeof lightdm !== 'undefined') {
  init();
}
