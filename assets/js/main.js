'use strict';

var userlist = [];
var now = 0;

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

var default_session = function default_session() {
  var last = cache.get('session');
  if (!last) return 0;
  for (var i = 0; i < lightdm.sessions.length; ++ i) {
    if (lightdm.sessions[i].name === last) {
      return i;
    }
  }
  return 0;
}
var default_language = function default_language() {
  var last = cache.get('language');
  if (!last) return 0;
  for (var i = 0; i < lightdm.languages.length; ++ i) {
    if (lightdm.languages[i].name === last) {
      return i;
    }
  }
  return 0;
}

var switch_user = function switch_user(index) {
  var choosing = userlist[index];

  $('.user').text(choosing.dispname);

  clear_message();
  lightdm.cancel_timed_login();
  if (lightdm._username) {
    lightdm.cancel_authentication();
  }
  lightdm.start_authentication(choosing.username);
};

var authentication_complete = function authentication_complete() {
  if (lightdm.is_authenticated) {

    const session = lightdm.sessions[$('.session')[0].selectedIndex];
    cache.set('session', session.name);

    const language = lightdm.languages[$('.language')[0].selectedIndex];
    cache.set('language', language.name);

    show_message('お帰りなさい！ご主人様！');

    // wait for cache
    setTimeout(function () {
      lightdm.login(lightdm.authentication_user, session.key);
    }, 1000);

  } else {
    $('.password').val('');
    switch_user(now);
    show_message('違います！');
  }
};

var submit = function submit() {
  var password = $('.password').val();
  if (password) {
    lightdm.provide_secret(password);
  } else {
    show_message('あれっ？パスワードは？');
  }
  return false;
};

var init = function init() {
  lightdm.users.forEach(function (user) {
    userlist.push({
      username: user.name,
      dispname: user.display_name
    });
  });

  var len = userlist.length;
  switch_user(now);

  $('.container').submit(submit);

  $('.last').click(function () {
    now = ((now - 1) % len + len) % len;
    switch_user(now);
  });
  $('.next').click(function () {
    now = (now + 1) % len;
    switch_user(now);
  });

  lightdm.sessions.forEach(function (session) {
    $('.session').append($('<option/>', { text: session.name }));
  });
  $('.session')[0].selectedIndex = default_session();

  lightdm.languages.forEach(function (language) {
    $('.language').append($('<option/>', { text: language.name }));
  });
  $('.language')[0].selectedIndex = default_language();

  $('.password').focus();
};

if (typeof lightdm !== 'undefined') {
  init();
}