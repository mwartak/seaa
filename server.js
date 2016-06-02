'use strict';

const Hapi = require('hapi');
const path = require('path');
const jsforce = require('jsforce');

const server = new Hapi.Server();
server.connection({ port: process.env.PORT || 3000 });

var plugins = [
  require('inert'),
  require('vision'),
  {
    // logging
    register: require('good'),
    options: {
      ops: {
        interval: 60000
      },
      reporters: {
        console: [{
          module: 'good-console'
        }, 'stdout']
      }
    }
  }
];

server.register(plugins, (err) => {
  server.views({
    engines: {
      html: require('handlebars')
    },
    relativeTo: __dirname,
    path: 'templates'
  });

  var routes = [
    {
      method: 'GET',
      path: '/',
      handler: getSfdcData
    }, {
      method: 'GET',
      path: '/sfdc.appcache',
      handler: function(request, reply) {
        reply.file('sfdc.appcache').header('Content-Type', 'text/cache-manifest');
      }
    }, {
      method: 'GET',
      path: '/css/{param*}',
      config: { auth: false },
      handler: {
        directory: {
          path: path.join(__dirname, './css')
        }
      }
    }, {
      method: 'GET',
      path: '/js/{param*}',
      config: { auth: false },
      handler: {
        directory: {
          path: path.join(__dirname, './js')
        }
      }
    }
  ];
  server.route(routes);
});

server.start((err) => {
  if (err) {
    throw err;
  }
  console.log('Server running at:', server.info.uri);
});

function getSfdcData(request, reply) {
  var conn = new jsforce.Connection();
  conn.login('martin@teralon.com', 'Sugar.L1d2mujiSpXNFQ6p0sBV4V4se6PkY', function(err, res) {
    if (err) { return console.error(err); }
    conn.query('SELECT Id, Name FROM Account', function(err, res) {
      if (err) { return console.error(err); }
      console.log(res);
      var i;
      //for (i=0; i<10000
      reply.view('index', { json: JSON.stringify(res.records), records: res.records });
    });
  });
}
