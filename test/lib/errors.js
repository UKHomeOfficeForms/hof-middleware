'use strict';

const httpMock = require('node-mocks-http');

describe('errors', () => {
  var middleware;
  var err;
  var req;
  var res;
  var next;
  var translate;

  beforeEach(() => {
    res = httpMock.createResponse({
      eventEmitter: require('events').EventEmitter
    });
    translate = sinon.stub().returnsArg(0);
    middleware = require('../../lib/errors')(translate);
    next = sinon.stub();
  });

  describe('middleware', () => {

    beforeEach(() => {
      req = httpMock.createRequest({
        method: 'GET',
        url: '/my-hof-journey',
      });
      res.render = sinon.spy();
    });

    it('translates', function () {
      middleware({}, req, res, next);
      translate.should.have.been.called;
    });

    it('renders with session error when error code is SESSION_TIMEOUT', () => {
      err = {
        code: 'SESSION_TIMEOUT'
      };
      middleware(err, req, res, next);
      res.render.should.have.been.calledWith('error', {
        content: {message: 'errors.session.message', title: 'errors.session.title'},
        error: {code: 'SESSION_TIMEOUT'},
        showStack: false,
        startLink: 'my-hof-journey'
      });
    });

    it('renders with cookies-required error when error code is NO_COOKIES', () => {
      err = {
        code: 'NO_COOKIES'
      };
      middleware(err, req, res, next);
      res.render.should.have.been.calledWith('error', {
        content: {message: 'errors.cookies-required.message', title: 'errors.cookies-required.title'},
        error: {code: 'NO_COOKIES', status: 403},
        showStack: false,
        startLink: 'my-hof-journey'
      });
    });

    it('renders with default error when error code is neither SESSION_TIMEOUT or NO_COOKIES', () => {
      err = {
        code: ''
      };
      middleware(err, req, res, next);
      res.render.should.have.been.calledWith('error', {
        content: {message: 'errors.default.message', title: 'errors.default.title'},
        error: {code: ''},
        showStack: false,
        startLink: 'my-hof-journey'
      });
    });

    it('renders the error stack in development environment', () => {
      process.env.NODE_ENV = 'development';
      err = {
        code: ''
      };
      middleware(err, req, res, next);
      res.render.should.have.been.calledWith('error', {
        content: {message: 'errors.default.message', title: 'errors.default.title'},
        error: {code: ''},
        showStack: true,
        startLink: 'my-hof-journey'
      });
    });

    it('renders the error stack in docker-compose environment', () => {
      process.env.NODE_ENV = 'development';
      err = {
        code: ''
      };
      middleware(err, req, res, next);
      res.render.should.have.been.calledWith('error', {
        content: {message: 'errors.default.message', title: 'errors.default.title'},
        error: {code: ''},
        showStack: true,
        startLink: 'my-hof-journey'
      });
    });

  });

  describe('without a translate function', () => {

    it('throws Errorhandler needs a translate function', () =>
      require('../../lib/errors').should.throw('Errorhandler needs a translate function')
    );

  });

  describe('with a logger', () => {

    var logger = {};

    beforeEach(() => {
      res = httpMock.createResponse({
        eventEmitter: require('events').EventEmitter
      });
      translate = sinon.stub().returnsArg(0);
      logger.error = sinon.spy();
      middleware = require('../../lib/errors')(translate, {logger: logger});
      next = sinon.stub();
    });

    describe('the middleware', () => {

      beforeEach(() => {
        req = httpMock.createRequest({
          method: 'GET',
          url: '/my-hof-journey',
        });
        res.render = sinon.spy();
      });

      it('logs the error', () => {
        err = {
          error: 'Error'
        };
        middleware(err, req, res, next);
        logger.error.should.have.been.calledWith('Error');
      });

    });

  });

});
