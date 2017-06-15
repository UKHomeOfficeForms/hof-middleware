'use strict';

const reqres = require('reqres');

describe('errors', () => {
  let middleware;
  let req;
  let res;
  let next;
  let translate;

  beforeEach(() => {
    translate = sinon.stub().returnsArg(0);
    middleware = require('../../lib/errors')({translate: translate});
    next = sinon.stub();
  });

  describe('middleware', () => {

    const html = '<html></html>';

    beforeEach(() => {
      res = reqres.res();
      req = reqres.req({
        path: '/my-hof-journey',
        method: 'GET'
      });
      res.render = sinon.stub();
    });

    it('translates when a translate function is provided', () => {
      const err = {};
      middleware(err, req, res, next);
      translate.should.have.been.called;
    });

    it('accepts four arguments', () => {
      middleware.should.have.length(4);
    });

    describe('when only the default error template is available', () => {

      beforeEach(() => {
        res.render.onCall(0).yields('error', html);
      });

      it('renders the `error` template with `401` status', () => {

        res.render = sinon.stub();
        res.render.onCall(0).yields('error', html);

        const err = {
          code: 'SESSION_TIMEOUT'
        };

        const locals = {
          content: {message: 'errors.session.message', title: 'errors.session.title'},
          error: {code: 'SESSION_TIMEOUT', status: 401},
          showStack: false,
          startLink: 'my-hof-journey'
        };

        middleware(err, req, res, next);

        res.status.should.have.been.calledWith(401);
        res.render.should.have.been.calledWith('401', locals);
        res.render.should.have.been.calledWith('error', locals);

      });

      it('renders the `error` template with `403` status', () => {

        const err = {
          code: 'NO_COOKIES'
        };

        const locals = {
          content: {message: 'errors.cookies-required.message', title: 'errors.cookies-required.title'},
          error: {code: 'NO_COOKIES', status: 403},
          showStack: false,
          startLink: 'my-hof-journey'
        };

        middleware(err, req, res, next);

        res.status.should.have.been.calledWith(403);
        res.render.should.have.been.calledWith('403', locals);
        res.render.should.have.been.calledWith('error', locals);
      });

      it('renders the `error` template with `500` status', () => {

        const err = {
          code: 'UNKNOWN'
        };

        const locals = {
          content: {message: 'errors.default.message', title: 'errors.default.title'},
          error: {code: 'UNKNOWN', status: 500},
          showStack: false,
          startLink: 'my-hof-journey'
        };

        middleware(err, req, res, next);

        res.status.should.have.been.calledWith(500);
        res.render.should.have.been.calledWith('500', locals);
        res.render.should.have.been.calledWith('error', locals);
      });

    });

    describe('when specific templates are available', () => {

      beforeEach(() => {
        res.render.onCall(0).yields(null, html);
      });

      it('renders the `401` template with `401` status', () => {

        const err = {
          code: 'SESSION_TIMEOUT'
        };

        const locals = {
          content: {message: 'errors.session.message', title: 'errors.session.title'},
          error: {code: 'SESSION_TIMEOUT', status: 401},
          showStack: false,
          startLink: 'my-hof-journey'
        };

        middleware(err, req, res, next);

        res.status.should.have.been.calledWith(401);
        res.render.should.have.been.calledWith('401', locals);
        res.send.should.have.been.calledWith(html);

      });

      it('renders the `error` template with `403` status', () => {

        const err = {
          code: 'NO_COOKIES'
        };

        const locals = {
          content: {message: 'errors.cookies-required.message', title: 'errors.cookies-required.title'},
          error: {code: 'NO_COOKIES', status: 403},
          showStack: false,
          startLink: 'my-hof-journey'
        };

        middleware(err, req, res, next);

        res.status.should.have.been.calledWith(403);
        res.render.should.have.been.calledWith('403', locals);
        res.send.should.have.been.calledWith(html);
      });

      it('renders the `error` template with `500` status', () => {

        const err = {
          code: 'UNKNOWN'
        };

        const locals = {
          content: {message: 'errors.default.message', title: 'errors.default.title'},
          error: {code: 'UNKNOWN', status: 500},
          showStack: false,
          startLink: 'my-hof-journey'
        };

        middleware(err, req, res, next);

        res.status.should.have.been.calledWith(500);
        res.render.should.have.been.calledWith('500', locals);
        res.send.should.have.been.calledWith(html);
      });

    });

  });

  describe('without a translator', () => {

    beforeEach(() => {
      res = reqres.res();
      translate = sinon.stub().returnsArg(0);
      middleware = require('../../lib/errors')();
      next = sinon.stub();
    });

    describe('middleware', () => {

      beforeEach(() => {
        req = reqres.req({
          path: '/my-hof-journey',
          method: 'GET'
        });
        res.render = sinon.spy();
      });

      it('uses a default title and message', () => {
        const err = {
          code: 'SESSION_TIMEOUT'
        };

        const locals = {
          content: {message: 'There is a SESSION_TIMEOUT_ERROR', title: 'SESSION_TIMEOUT_ERROR'},
          error: {code: 'SESSION_TIMEOUT', status: 401},
          showStack: false,
          startLink: 'my-hof-journey'
        };

        middleware(err, req, res, next);

        translate.should.have.not.been.called;
        res.render.should.have.been.calledWith('401', locals);

      });

      it('uses a default UNKNOWN title and message when error code is not SESSION_TIMEOUT or NO_COOKIES', () => {
        const err = {
          code: 'UNKNOWN'
        };

        const locals = {
          content: {message: 'There is a UNKNOWN_ERROR', title: 'UNKNOWN_ERROR'},
          error: {code: 'UNKNOWN', status: 500},
          showStack: false,
          startLink: 'my-hof-journey'
        };

        middleware(err, req, res, next);

        res.render.should.have.been.calledWith('500', locals);

      });

    });
  });

  describe('with a logger', () => {

    const logger = {};

    beforeEach(() => {
      res = reqres.res();
      translate = sinon.stub().returnsArg(0);
      logger.error = sinon.spy();
      middleware = require('../../lib/errors')({logger: logger});
      next = sinon.stub();
    });

    describe('the middleware', () => {

      beforeEach(() => {
        req = reqres.req({
          path: '/my-hof-journey',
          method: 'GET'
        });
        res.render = sinon.spy();
      });

      it('logs the error', () => {
        const err = {
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
      res = reqres.res();
      translate = sinon.stub().returnsArg(0);
      logger.error = sinon.spy();
      middleware = require('../../lib/errors')({debug: true});
      next = sinon.stub();
    });

    describe('the middleware', () => {

      beforeEach(() => {
        req = reqres.req({
          path: '/my-hof-journey',
          method: 'GET'
        });
        res.render = sinon.spy();
      });

      it('shows the stack trace', () => {
        const err = {
          code: '',
          message: 'Error message'
        };

        const locals = {
          content: err,
          error: err,
          showStack: true,
          startLink: 'my-hof-journey'
        };

        middleware(err, req, res, next);
        res.render.should.have.been.calledWith('500', locals);
      });

      it('assigns err to content', () => {
        const err = {
          code: '',
          message: 'Error message'
        };

        const locals = {
          content: err,
          error: err,
          showStack: true,
          startLink: 'my-hof-journey'
        };

        middleware(err, req, res, next);

        res.render.should.have.been.calledWith('500', locals);

      });
    });

  });

  describe('defaults to debug false', () => {

    const logger = {};

    beforeEach(() => {
      res = reqres.res();
      translate = sinon.stub().returnsArg(0);
      logger.error = sinon.spy();
      middleware = require('../../lib/errors')(translate);
      next = sinon.stub();
    });

    describe('the middleware', () => {

      beforeEach(() => {
        req = reqres.req({
          path: '/my-hof-journey',
          method: 'GET'
        });
        res.render = sinon.spy();
      });

      it('does not show the stack trace', () => {
        const err = {
          code: 'UNKNOWN'
        };

        const locals = {
          content: {message: 'There is a UNKNOWN_ERROR', title: 'UNKNOWN_ERROR'},
          error: {code: 'UNKNOWN', status: 500},
          showStack: false,
          startLink: 'my-hof-journey'
        };

        middleware(err, req, res, next);

        res.render.should.have.been.calledWith('500', locals);

      });
    });

  });

});
