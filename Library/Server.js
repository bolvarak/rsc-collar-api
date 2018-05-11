///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
'use strict'; /// Strict Syntax //////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Module Dependencies //////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// We need the Express module
let $express = require('express');
// We need the HTTP library module
let $http = require('http');
// We need the lodash utility module
let $lodash = require('lodash');
// We need our configuration
let $config = require('../Common/Configuration');

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = class LibraryServer { /// LibraryServer Class Definition ////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Constructor //////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This method instantiates a new Server listener
	 * @name LibraryServer.constructor()
	 */
	constructor() {

		///////////////////////////////////////////////////////////////////////////////////////////////////////////////
		/// Properties ///////////////////////////////////////////////////////////////////////////////////////////////
		/////////////////////////////////////////////////////////////////////////////////////////////////////////////

		/**
		 * This property contains the application instance
		 * @name LibraryServer.mApplication
		 * @type {Express}
		 */
		this.mApplication = {};

		/**
		 * This property contains the HTTP server for the application
		 * @name LibraryServer.mHttpServer
		 * @type {http.Server}
		 */
		this.mHttpServer = {};

		/**
		 * This property contains the port number that the application should listen on
		 * @name LibraryServer.mPort
		 * @type {number|string}
		 */
		this.mPort = (process.env.RSC_PORT || 8443);

	} /// End Constructor /////////////////////////////////////////////////////////////////////////////////////////////

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Private Methods //////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This method normalizes and validates the TCP port or UNIX socket path
	 * @name LibraryServer._normalizePort()
	 * @param {Number|String, optional} $value
	 * @returns {Number|String|boolean}
	 * @private
	 */
	_normalizePort($value) {
		// Parse the port as a number
		let $port = parseInt($value, 10);
		// Check for a number
		if (isNaN($port)) {
			// We're done, we have a UNIX socket
			return $value;
		}
		// Make sure the port number is valid
		if ($port >= 0) {
			// We're done, return the port number
			return $port;
		}
		// We're done, no valid port number or socket
		return false;
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Event Handlers ///////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This method handles any errors that happen while starting and/or running the application server
	 * @name LibraryServer._error()
	 * @param {Error} $error
	 * @returns {void}
	 * @throws {Error}
	 * @private
	 */
	_error($error) {
		// Check to see if the server is spawning
		if ($error.syscall !== 'listening') {
			// We're done, throw the error
			throw $error;
		}
		// Define our binding
		let $binding = ((typeof this.port() === 'string') ? ('UNIX:[' + this.port() + ']') : ('TCP:[' + this.port() + ']'));
		// Check the error code
		if ($error.code.toLowerCase() === 'eaccess') {
			// Send the error to the console
			console.error(('Pre-Flight:'), ('Permission Denied On ' + $binding + '!'));
			// We're done, kill the application
			process.exit(1);
		} else if ($error.code.toLowerCase() === 'eaddrinuse') {
			// Send the error to the console
			console.error(('Pre-Flight:'), ($binding + 'Already In Use!'));
			// We're done, kill the application
			process.exit(1);
		} else {
			// We're done, throw the error
			throw $error;
		}
	}

	/**
	 * This method handles the listening event for the application server
	 * @name LibraryServer._listening()
	 * @returns {void}
	 * @private
	 */
	_listening() {
		// Define our binding
		let $binding = ((typeof this.httpServer().address() === 'string') ? ('UNIX:[' + this.httpServer().address() + ']') : ('TCP:[' + this.httpServer().address().port + ']'));
		// Output to debug
		console.log('Pre-Flight Listening:', $binding);
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Public Methods ///////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This method initializes and dispatches the application HTTP server
	 * @name LibraryServer.run()
	 * @returns {void}
	 */
	run() {
		// Set the port into the application
		this.application().set('port', this.port());
		// Create our server
		this.httpServer($http.createServer(this.application()));
		// Dispatch the server
		this.httpServer().listen(this.port());
		// Bind to the error event
		this.httpServer().on('error', ($error) => {
			return this._error($error);
		});
		// Bind to the listening event
		this.httpServer().on('listening', () => {
			return this._listening();
		});
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Inline Methods ///////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This method returns the Express application from the instance with the ability to reset it inline
	 * @name LibraryServer.application()
	 * @param {Express, optional}
	 * @returns {Express}
	 */
	application($application) {
		// Check for a provided application
		if ($lodash.isObject($application)) {
			// Reset the application into the instance
			this.mApplication = $application;
		}
		// We're done, return the application from the instance
		return this.mApplication;
	}

	/**
	 * This method returns the HTTP Server from the instance with the ability to reset it inline
	 * @name LibraryServer.httpServer()
	 * @param {http.Server, optional} $httpServer
	 * @returns {http.Server}
	 */
	httpServer($httpServer) {
		// Check for a provided HTTP Server
		if ($httpServer instanceof $http.Server) {
			// Reset the HTTP Server into the instance
			this.mHttpServer = $httpServer
		}
		// We're done, return the HTTP Server from the instance
		return this.mHttpServer;
	}

	/**
	 * This method returns the port from the instance with the ability to reset it inline
	 * @name LibraryServer.port()
	 * @param {Number|String, optional} $port
	 * @returns {Boolean|Number|String}
	 */
	port($port) {
		// Check for a provided port
		if (($lodash.isNumber($port) && ($port > 0)) || ($lodash.isString($port) && !$lodash.isEmpty($port))) {
			// Reset the port into the instance
			this.mPort = this._normalizePort($port);
		}
		// We're done, return the port from the instance
		return this.mPort;
	}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}; /// End LibraryServer Class Definition /////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
