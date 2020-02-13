const Code = require("@hapi/code");
const Lab = require("@hapi/lab");
var Api = require('../');

var lab = exports.lab = Lab.script();
var expect = Code.expect;

var expectedFields = [
    '__auth0_api',
    'Buffer',
    'mongo',
    'mysql',
    'mysql_pool',
    'postgres',
    'ip',
    '_wrap_callback',
    '_wrap_console',
    'querystring',
    'ObjectID',
    'async',
    'pg',
    'jwt',
    'cql',
    '_',
    'Pubnub',
    'sqlserver',
    'request',
    'bcrypt',
    'uuid',
    'Auth0',
    'crypto',
    'pbkdf2',
    'xmldom',
    'xml2js',
    'xpath',
    'couchbase',
    'xtend',
    'q',
    'azure_storage',
    'Knex',
    'ValidationError',
    'WrongUsernameOrPasswordError',
    'UnauthorizedError'
];

var errorClasses = {
    'ValidationError': {
        args: ['code', 'message'],
        fields: {
            code: 'validationerror',
            message: 'Validation error',
            description: 'Validation error',
            name: 'ValidationError',
            statusCode: 400,
        }
    },
    'WrongUsernameOrPasswordError':  {
        args: ['user_id', 'message'],
        fields: {
            user_id: 'abcdef',
            code: 'wrongusernameorpassword',
            message: 'Wrong username or password',
            name: 'WrongUsernameOrPasswordError',
            statusCode: 400,
        }
    },
    'UnauthorizedError':  {
        args: ['message'],
        fields: {
            code: 'unauthorized',
            message: 'Unauthorized',
            description: 'Unauthorized',
            name: 'UnauthorizedError',
            statusCode: 401,
        }
    },
};

lab.experiment('The exposed api', {parallel: true}, function () {
    lab.test('has all expected fields', function () {
        expect(Object.keys(Api.api)).to.only.include(expectedFields);
    });
});

lab.experiment('The api exposes Error classes', {parallel: true}, function () {
    lab.test('that inherit from Error', function () {
        Object.keys(errorClasses).forEach(function (errorClass) {
            var fixture = errorClasses[errorClass];
            var constructor = Api.api[errorClass];
            var args = fixture.args.map(function (arg) {
                return fixture.fields[arg];
            });
            var err = new (Function.prototype.bind.apply(constructor, [null].concat(args)))();

            expect(err).to.be.an.instanceof(Error);
            expect(err).to.be.an.instanceof(constructor);
        });

    });

    lab.test('that have common fields', function () {
        Object.keys(errorClasses).forEach(function (errorClass) {
            var fixture = errorClasses[errorClass];
            var constructor = Api.api[errorClass];
            var args = fixture.args.map(function (arg) {
                return fixture.fields[arg];
            });
            var err = new (Function.prototype.bind.apply(constructor, [null].concat(args)))();

            expect(err.message).to.be.a.string();
            expect(err.code).to.be.a.string();
            expect(err.statusCode).to.be.a.number();
        });

    });

    lab.test('that have all expected fields with the correct values', function () {
        Object.keys(errorClasses).forEach(function (errorClass) {
            var fixture = errorClasses[errorClass];
            var constructor = Api.api[errorClass];
            var args = fixture.args.map(function (arg) {
                return fixture.fields[arg];
            });
            var err = new (Function.prototype.bind.apply(constructor, [null].concat(args)))();

            Object.keys(fixture.fields).forEach(function (field) {
                var value = fixture.fields[field];

                expect(err[field]).to.equal(value);
            });
        });

    });
});

lab.experiment('Api extension', {parallel: true}, function () {
    lab.test('can be used to expose the api on any object', function () {
        var foo = {};

        Api.extend(foo);

        expect(Object.keys(foo)).to.only.include(expectedFields);
    });

    lab.test('will not extend a given object twice', function () {
        var foo = {};

        Api.extend(foo);

        var apiMongo = foo.mongo;

        foo.mongo = 'mongooooo!!';

        // Let's try re-extending and look at the mongo api again
        Api.extend(foo);

        expect(foo.mongo).to.equal('mongooooo!!');
        expect(foo.mongo).to.not.equal(apiMongo);
    });
});
