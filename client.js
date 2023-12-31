const config = {
  clientId: "foodanalytics",
  clientSecret: "food123",
  authorizeUrl: "http://auth.algafood.local:8081/oauth/authorize",
  tokenUrl: "http://auth.algafood.local:8081/oauth/token",
  callbackUrl: "http://www.foodanalytics.local:8082",
  cozinhasUrl: "http://api.algafood.local:8080/v1/kitchens",
  basicUsername: "algafood-web",
  basicPassword: "web123",
  bodyUsername: "thiago",
  bodyPassword: "123"
};

let accessToken = "";

function generateCodeVerifier() {
  let codeVerifier = generateRandomString(128);
  localStorage.setItem("codeVerifier", codeVerifier);

  return codeVerifier;
}

function generateRandomString(length) {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

function generateCodeChallenge(codeVerifier) {
  return base64URL(CryptoJS.SHA256(codeVerifier));
}

function getCodeVerifier() {
  return localStorage.getItem("codeVerifier");
}

function base64URL(string) {
  return string.toString(CryptoJS.enc.Base64).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function consultar() {
  alert("Consultando recurso com access token " + accessToken);

  $.ajax({
    url: config.cozinhasUrl,
    type: "get",

    beforeSend: function(request) {
      request.setRequestHeader("Authorization", "Bearer " + accessToken);
    },

    success: function(response) {
      var json = JSON.stringify(response);
      $("#resultado").text(json);
    },

    error: function(error) {
      alert("Erro ao consultar recurso");
    }
  });
}

function gerarAccessToken(code) {
  alert("Gerando access token com public key");

  let clientAuth = btoa(config.basicUsername + ":" + config.basicPassword);
  alert("ClientAuth " + clientAuth);

  alert("Username:password " + config.bodyUsername + ":" + config.bodyPassword);

  let params = new URLSearchParams();
  params.append("grant_type", "password");
  params.append("username", config.bodyUsername);
  params.append("password", config.bodyPassword);

  $.ajax({
    url: config.tokenUrl,
    type: "post",
    data: params.toString(),
    contentType: "application/x-www-form-urlencoded",

    beforeSend: function(request) {
      request.setRequestHeader("Authorization", "Basic " + clientAuth);
    },

    success: function(response) {
      accessToken = response.access_token;

      alert("Access token gerado com public key: " + accessToken);
    },

    error: function(error) {
      alert("Erro ao gerar access key com public key");
    }
  });
}

function gerarAccessTokenOld2(code) {
  alert("Gerando access token com code com pkce " + code);

  let clientAuth = btoa(config.clientId + ":" + config.clientSecret);
  alert("ClientAuth " + clientAuth);

  let codeVerifier = getCodeVerifier();
  alert("code_verifier " + codeVerifier);

  let params = new URLSearchParams();
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", config.callbackUrl);
  params.append("client_id", config.clientId);
  params.append("code_verifier", codeVerifier);

  $.ajax({
    url: config.tokenUrl,
    type: "post",
    data: params.toString(),
    contentType: "application/x-www-form-urlencoded",

    beforeSend: function(request) {
      request.setRequestHeader("Authorization", "Basic " + clientAuth);
    },

    success: function(response) {
      accessToken = response.access_token;

      alert("Access token gerado com pkce: " + accessToken);
    },

    error: function(error) {
      alert("Erro ao gerar access key com pkce");
    }
  });
}

function gerarAccessTokenOld(code) {
//  alert("Gerando access token com code " + code);

  let clientAuth = btoa(config.clientId + ":" + config.clientSecret);

  let params = new URLSearchParams();
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", config.callbackUrl);

  $.ajax({
    url: config.tokenUrl,
    type: "post",
    data: params.toString(),
    contentType: "application/x-www-form-urlencoded",

    beforeSend: function(request) {
      request.setRequestHeader("Authorization", "Basic " + clientAuth);
    },

    success: function(response) {
      accessToken = response.access_token;

      alert("Access token gerado: " + accessToken);
    },

    error: function(error) {
      alert("Erro ao gerar access key", error);
    }
  });
}

function login() {
  let codeVerifier = generateCodeVerifier();
  let codeChallenge = generateCodeChallenge(codeVerifier);

  window.location.href = `${config.authorizeUrl}?response_type=code&client_id=${config.clientId}&redirect_uri=${config.callbackUrl}&code_challenge_method=s256&code_challenge=${codeChallenge}`;
}


function loginOld() {
  // https://auth0.com/docs/protocols/oauth2/oauth-state
  let state = btoa(Math.random());
  localStorage.setItem("clientState", state);

  window.location.href = `${config.authorizeUrl}?response_type=code&client_id=${config.clientId}&state=${state}&redirect_uri=${config.callbackUrl}`;
}

$(document).ready(function() {
  let params = new URLSearchParams(window.location.search);

  let code = params.get("code");

  if (code) {
    // window.history.replaceState(null, null, "/");
    gerarAccessToken(code);
  }
});

//$(document).ready(function() {
//  let params = new URLSearchParams(window.location.search);
//
//  let code = params.get("code");
//  let state = params.get("state");
//  let currentState = localStorage.getItem("clientState");
//
//  if (code) {
//    // window.history.replaceState(null, null, "/");
//
//    if (currentState == state) {
//      alert("Gerando access token com new code " + code);
////      gerarAccessToken(code);
//    } else {
//      alert("State inválido");
//    }
//  }
//});

$("#btn-consultar").click(consultar);
$("#btn-login").click(login);