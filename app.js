
'use strict'
const Hapi = require('hapi');
const server = new Hapi.Server();
server.connection({ port: process.env.port || 3000, host: process.env.host || 'localhost' });

var config = {
    userName: "Davide",
    password: "password.123",
    server: "delboverpelli.database.windows.net",
    options:
        {
            database: "ProgettoEsame",
            encrypt: true
        }
}
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

//----------------------------------------------------------------------------------------------


//LOGIN
server.route({
    method: 'POST',
    path: '/login',
    handler: function (request, reply) {
        login(request.payload.username, request.payload.pass, reply);
    }
});

function login(user, pass, reply) {
    var connection = new Connection(config);

    connection.on('connect', function (err) {
        if (err) {
            console.log(err);
        }
        else {
            console.log('Connected');
            var query = "SELECT IdU FROM Utenti WHERE Username=@user AND Password=@pass"; //CRIPTA LA PASSWORD
            var request = new Request(query, function (err, rowCount) {
                if (err) { console.log(err); }
                else {
                    if (rowCount = 0) {
                        reply({ status: 'ko' });
                    }
                }
            });

            request.addParameter('user', TYPES.VarChar, user);
            request.addParameter('pass', TYPES.VarChar, pass);//DA CRIPTARE


            request.on('row', function (columns) {
                columns.forEach(function (column) {
                    reply({ status: 'ok', id: column.value })
                }
                )
            });
            connection.execSql(request);
        }
    })
}


//-------------------------------------------------------------------------------------------

//REGISTRAZIONE
server.route({
    method: 'POST',
    path: '/signup',
    handler: function (request, reply) {
        signup(request.payload.username, request.payload.pass, reply);
    }
});

function signup(user, pass, reply) {
    var connection = new Connection(config);

    connection.on('connect', function (err) {
        if (err) {
            console.log(err);
        }
        else {
            console.log('Connected');
            var query = "INSERT INTO Utenti(Username, Password) VALUES (@user,@pass)"; //DA CRIPTARE
            var request = new Request(query, function (err, rowCount) {
                if (err) { console.log(err); }
                else {
                    if (rowCount = 0) {
                        reply({ status: 'ko' });
                    }
                    else {
                        reply({ status: 'ok' });
                    }
                }
            });
            request.addParameter('user', TYPES.VarChar, user);
            request.addParameter('pass', TYPES.VarChar, pass);//DA CRIPTARE
            connection.execSql(request);
        }
    });
}

//----------------------------------------------------------------------------------------------

//Ricerca punteggio

server.route({
    method: 'GET',
    path: '/punteggio',
    handler: function (request, reply) {
        TrovaPunteggio(request.query.username, reply);
    }
});

function TrovaPunteggio(user, reply) {
    var punti = null;
    var connection = new Connection(config);

    connection.on('connect', function (err) {
        if (err) {
            console.log(err);
        }
        else {
            console.log('Connected');
            var query = "SELECT Punteggio FROM Utenti WHERE Username=@user";
            var request = new Request(query, function (err, rowCount) {
                if (err) { console.log(err); }
                else {
                    if (rowCount = 0) {
                        reply({ status: 'ko', punteggio: 0 });
                    }
                    else {
                        reply({ status: 'ok', punteggio: punti });
                    }
                }
            });

            request.addParameter('user', TYPES.VarChar, user);

            request.on('row', function (columns) {
                columns.forEach(function (column) {
                    punti = column.value;
                });
            });
            connection.execSql(request);
        }
    });
}
//-----------------------------------------------------------------------------------
server.route({
    method: 'POST',
    path: '/insertPunteggio',
    handler: function (request, reply) {
        AggiungiPunteggio(request.payload.username, request.payload.punti, reply);
    }
});

function AggiungiPunteggio(user, punti, reply) {   
    var connection = new Connection(config);

    connection.on('connect', function (err) {
        if (err) {
            console.log(err);
        }
        else {
            console.log('Connected');
            var query = "UPDATE Utenti SET Punteggio = @punti WHERE Username=@user";
            var request = new Request(query, function (err, rowCount) {
                if (err) { console.log(err); }
                else {
                    if (rowCount = 0) {
                        reply({ status: 'ko'});
                    }
                    else {
                        reply({ status: 'ok'});
                    }
                }
            });

            request.addParameter('punti', TYPES.Int, punti); //CONTROLLA
            request.addParameter('user', TYPES.VarChar, user);
            connection.execSql(request);
        }
    });
}

server.start(function () {
    console.log('Hapi is listening');
});

