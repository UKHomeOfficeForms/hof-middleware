'use strict';

const proxyquire = require('proxyquire');
const reqres = require('reqres');

const promiseMatcher = sinon.match(value => {
  return value instanceof Promise;
}, 'Not an instance of a Promise');

// Stubbing request promise
const resolvedPromiseStub = sinon.stub().returns(new Promise(resolve => resolve('pending')));
const rejectedPromiseStub = sinon.stub().returns(new Promise((resolve, reject) => reject('pending')));

const success = '/success';
const failure = '/failure';

const requestStub = sinon.stub();

requestStub.withArgs(success).returns({promise: resolvedPromiseStub});
requestStub.withArgs(failure).returns({promise: rejectedPromiseStub});

const healthMiddleware = proxyquire('../../lib/health', {
  'request-promise-native': requestStub
});


describe('./lib/health', () => {

  it('returns a middleware function', () => {
    healthMiddleware().should.be.a('function');
  });

  describe('middleware', () => {

    const req = reqres.req();
    const res = reqres.res();

    let middleware;

    beforeEach(() => {
      sinon.spy(Promise, 'all');
    });

    afterEach(() => {
      Promise.all.restore();
    });

    it('calls next without an error when all health urls are resolved', () => {
      const options = {
        health: [{
          url: success
        }, {
          url: success
        }]
      };

      middleware = healthMiddleware(options.health);

      return middleware(req, res, (err) => {
        Promise.all.should.have.been.calledWith([promiseMatcher, promiseMatcher]);
        should.not.exist(err);
      });
    });

    it('calls next with `UNHEALTHY` error if a health url is rejected', () => {
      const options = {
        health: [{
          url: failure
        }, {
          url: success
        }]
      };

      middleware = healthMiddleware(options.health);

      return middleware(req, res, (err) => {
        Promise.all.should.have.been.calledWith([promiseMatcher, promiseMatcher]);
        err.should.be.an.instanceof(Error);
        err.code.should.equal('UNHEALTHY');
      });
    });

    it('accepts a `methods` option', () => {
      const options = {
        health: [{
          url: success,
          methods: ['get']
        }, {
          url: success
        }]
      };
      middleware = healthMiddleware(options.health);
      req.method = 'GET';

      return middleware(req, res, (err) => {
        Promise.all.should.have.been.calledWith([promiseMatcher, promiseMatcher]);
        should.not.exist(err);
      });
    });

    it('does not make a request if the `request.method` and endpoint method do not match ', () => {
      const options = {
        health: [{
          url: success,
          methods: ['get']
        }, {
          url: success
        }]
      };
      middleware = healthMiddleware(options.health);
      req.method = 'POST';

      return middleware(req, res, (err) => {
        Promise.all.should.have.been.calledWith([promiseMatcher]);
        should.not.exist(err);
      });
    });

  });

});

