'use strict';

const httpMock = require('node-mocks-http');

describe('errors', () => {
  let middleware;
  let err;
  let req;
  let res;
  let next;
  let translate;

  beforeEach(() => {
    res = httpMock.createResponse({
      eventEmitter: require('events').EventEmitter
    });
    translate = sinon.stub().returnsArg(0);
    middleware = require('../../lib/errors')({translate: translate});
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

    it('translates when a translate function is provided', () => {
      err = {};
      middleware(err, req, res, next);
      translate.should.have.been.called;
    });

    it('accepts four arguments', () => {
      middleware.should.have.length(4);
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

    it('renders with UNKNOWN error when error code is neither SESSION_TIMEOUT or NO_COOKIES', () => {
      err = {
        code: 'UNKNOWN'
      };
      middleware(err, req, res, next);
      res.render.should.have.been.calledWith('error', {
        content: {message: 'errors.default.message', title: 'errors.default.title'},
        error: {code: 'UNKNOWN'},
        showStack: false,
        startLink: 'my-hof-journey'
      });
    });

  });

  describe('without a translator', () => {

    beforeEach(() => {
      res = httpMock.createResponse({
        eventEmitter: require('events').EventEmitter
      });
      translate = sinon.stub().returnsArg(0);
      middleware = require('../../lib/errors')();
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

      it('uses a default title and message', () => {
        err = {
          code: 'SESSION_TIMEOUT'
        };
        middleware(err, req, res, next);
        translate.should.have.not.been.called;
        res.render.should.have.been.calledWith('error', {
          content: {message: 'There is a SESSION_TIMEOUT_ERROR', title: 'SESSION_TIMEOUT_ERROR'},
          error: {code: 'SESSION_TIMEOUT'},
          showStack: false,
          startLink: 'my-hof-journey'
        });
      });

      it('uses a default UNKNOWN title and message when error code is not SESSION_TIMEOUT or NO_COOKIES', () => {
        err = {
          code: 'UNKNOWN'
        };
        middleware(err, req, res, next);
        res.render.should.have.been.calledWith('error', {
          content: {message: 'There is a UNKNOWN_ERROR', title: 'UNKNOWN_ERROR'},
          error: {code: 'UNKNOWN'},
          showStack: false,
          startLink: 'my-hof-journey'
        });
      });

    });
  });

  describe('with a logger', () => {

    const logger = {};

    beforeEach(() => {
      res = httpMock.createResponse({
        eventEmitter: require('events').EventEmitter
      });
      translate = sinon.stub().returnsArg(0);
      logger.error = sinon.spy();
      middleware = require('../../lib/errors')({logger: logger});
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

  describe('when debug is true', () => {

    const logger = {};

    beforeEach(() => {
      res = httpMock.createResponse({
        eventEmitter: require('events').EventEmitter
      });
      translate = sinon.stub().returnsArg(0);
      logger.error = sinon.spy();
      middleware = require('../../lib/errors')({debug: true});
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

      it('shows the stack trace', () => {
        err = {
          code: '',
          message: 'Error message'
        };
        middleware(err, req, res, next);
        res.render.should.have.been.calledWith('error', {
          content: err,
          error: err,
          showStack: true,
          startLink: 'my-hof-journey'
        });
      });

      it('assigns err to content', () => {
        err = {
          code: '',
          message: 'Error message'
        };
        middleware(err, req, res, next);
        res.render.should.have.been.calledWith('error', {
          content: err,
          error: err,
          showStack: true,
          startLink: 'my-hof-journey'
        });
      });
    });

  });

  describe('defaults to debug false', () => {

    const logger = {};

    beforeEach(() => {
      res = httpMock.createResponse({
        eventEmitter: require('events').EventEmitter
      });
      translate = sinon.stub().returnsArg(0);
      logger.error = sinon.spy();
      middleware = require('../../lib/errors')(translate);
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

      it('does not show the stack trace', () => {
        err = {
          code: 'UNKNOWN'
        };
        middleware(err, req, res, next);
        res.render.should.have.been.calledWith('error', {
          content: {message: 'There is a UNKNOWN_ERROR', title: 'UNKNOWN_ERROR'},
          error: {code: 'UNKNOWN'},
          showStack: false,
          startLink: 'my-hof-journey'
        });
      });
    });

  });

});
