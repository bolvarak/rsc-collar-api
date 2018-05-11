///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
'use strict'; /// Strict Syntax //////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const $lodash = require('lodash'); /// The Lodash Utility Module /////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const $config = require('../../Common/Configuration'); /// Configuration Module //////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const $aws = require('aws-sdk'); /// Amazon Web Services Module //////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const uuidv4 = require('uuid/v4'); /// UUID Module ///////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = class ModelCollarActivity { /// ModelCollarActivity Class Definition ////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Constructor //////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This method instantiates a new Activity Collar Model
	 * @name ModelCollarActivity.constructor()
	 */
	constructor() {

		///////////////////////////////////////////////////////////////////////////////////////////////////////////////
		/// Properties ///////////////////////////////////////////////////////////////////////////////////////////////
		/////////////////////////////////////////////////////////////////////////////////////////////////////////////

		/**
		 * This property contains the end time, in which the movement ended
		 * @name ModelCollarActivity.mEndTime
		 * @type {number}
		 */
		this.mEndTime = 0;

		/**
		 * This property contains the average heart rate during the movement
		 * @name ModelCollarActivity.mHeartRate
		 * @type {number}
		 */
		this.mHeartRate = 0.00;

		/**
		 * This property contains the unique ID associated with the activity entry
		 * @name ModelCollarActivity.mId
		 * @type {string}
		 */
		this.mId = uuidv4();

		/**
		 * This property contains the average rate of movement
		 * @name ModelCollarActivity.mRateOfMovement
		 * @type {number}
		 */
		this.mRateOfMovement = 0.00;

		/**
		 * This property contains the start time, in which the movement started
		 * @name ModelCollarActivity.mStartTime
		 * @type {number}
		 */
		this.mStartTime = 0;

		/**
		 * This proeprty contains the total number of seconds in which the animal was moving
		 * @name ModelCollarActivity.mTotalTime
		 * @type {number}
		 */
		this.mTotalTime = 0;
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Static Methods ///////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This method populates an activity model from the HTTP request
	 * @name ModelCollarActivity.fromRequest()
	 * @param {Express.Request} $httpRequest
	 * @returns {ModelCollarActivity}
	 * @static
	 * @uses ModelCollarActivity.constructor()
	 * @uses ModelCollarActivity.endTime()
	 * @uses ModelCollarActivity.heartRate()
	 * @uses ModelCollarActivity.rateOfMovement()
	 * @uses ModelCollarActivity.startTime()
	 * @uses ModelCollarActivity.calculateMovementTime()
	 * @public
	 */
	static fromRequest($httpRequest) {
		// Instantiate the self
		let $this = new this();
		// Set the end time
		$this.endTime($httpRequest.value('endTime'));
		// Set the heart rate
		$this.heartRate($httpRequest.value('heartRate'));
		// Set the rate of movement
		$this.rateOfMovement($httpRequest.value('rateOfMovement'));
		// Set the start time
		$this.startTime($httpRequest.value('startTime'));
		// Calculate the the total time
		$this.calculateMovementTime();
		// We're done, return the new, populated, model
		return $this;
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Public Methods ///////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This method calculates the total movement time for the activity entry
	 * @name ModelCollarActivity.calculateMovementTime()
	 * @returns {number}
	 * @uses ModelCollarActivity.endTime()
	 * @uses ModelCollarActivity.startTime()
	 * @uses ModelCollarActivity.totalTime()
	 * @public
	 */
	calculateMovementTime() {
		// Check for a start and end timestamp
		if ((this.endTime() > 0) && (this.startTime() > 0)) {
			// Set the total time
			this.totalTime(this.endTime() - this.startTime());
		}
		// We're done, return the total time from the instance
		return this.totalTime();
	}

	/**
	 * This method saves the activity entry to DynamoDB
	 * @name ModelCollarActivity.save()
	 * @returns {Promise}
	 * @uses ModelCollarActivity.endTime()
	 * @uses ModelCollarActivity.heartRate()
	 * @uses ModelCollarActivity.rateOfMovement()
	 * @uses ModelCollarActivity.startTime()
	 * @uses ModelCollarActivity.calculateMovementTime()
	 * @public
	 */
	save() {
		// Return our new promise
		return new Promise(($resolve, $reject) => {
			// Update the AWS configuration
			$aws.config.update({
				'accessKeyId': $config.aws.access.key,
				'region': $config.aws.dynamodb.region,
				'secretAccessKey': $config.aws.access.secret
			});
			// Localize our client
			let $ddb = new $aws.DynamoDB({
				'apiVersion': $config.aws.dynamodb.version
			});
			// Save the entry
			$ddb.putItem({
				'TableName': $config.aws.dynamodb.tables.physicalActivity,
				'Item': {
					'_id': {'S': this.id().toString()},
					'endTime': {'N': this.endTime().toString()},
					'heartRate': {'N': this.heartRate().toString()},
					'rateOfMovement': {'N': this.rateOfMovement().toString()},
					'startTime': {'N': this.startTime().toString()},
					'totalTime': {'N': this.calculateMovementTime().toString()}
				}
			}, ($error, $data) => {
				// Check for an error
				if ($error) {
					// We're done, reject the promise
					return $reject($error);
				}
				// We're done, resolve the promise
				$resolve();
			});
		});
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Inline Methods ///////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This method returns the end timestamp from the instance with the ability to reset it inline
	 * @name ModelCollarActivity.endTime()
	 * @param {number, optional} $timeStamp [null]
	 * @returns {number}
	 * @public
	 */
	endTime($timeStamp = null) {
		// Check for a provided timestamp
		if (!$lodash.isNull($timeStamp)) {
			// Reset the end timestamp into the instance
			this.mEndTime = $timeStamp;
		}
		// We're done, return the end timestamp from the instance
		return this.mEndTime;
	}

	/**
	 * This method returns the average heart rate from the instance with the ability to reset it inline
	 * @name ModelCollarActivity.heartRate()
	 * @param {number, optional} $bpm [null]
	 * @returns {number}
	 */
	heartRate($bpm = null) {
		// Check for a provided BPM
		if (!$lodash.isNull($bpm)) {
			// Reset the BPM into the instance
			this.mHeartRate = $bpm;
		}
		// We're done, return the BPM from the instance
		return this.mHeartRate;
	}

	/**
	 * This method returns the unique ID for the activity entry with the ability to reset it inline
	 * @name ModelCollarActivity.id()
	 * @param {string, optional} $uuid [null]
	 * @returns {string}
	 */
	id($uuid = null) {
		// Check for a provided UUID
		if (!$lodash.isNull($uuid)) {
			// Reset the ID into the instance
			this.mId = $uuid;
		}
		// We're done, return the ID from the instance
		return this.mId;
	}

	/**
	 * This method returns the average speed from the instance with the ability to reset it inline
	 * @name ModelCollarActivity.rateOfMovement()
	 * @param {number, optional} $metersPerSecond [null]
	 * @returns {number}
	 */
	rateOfMovement($metersPerSecond = null) {
		// Check for provided speed
		if (!$lodash.isNull($metersPerSecond)) {
			// Reset the speed into the instance
			this.mRateOfMovement = $metersPerSecond;
		}
		// We're done, return the speed from the instance
		return this.mRateOfMovement;
	}

	/**
	 * This method returns the starting timestamp for the activity instance with the ability to reset it inline
	 * @name ModelCollarActivity.startTime()
	 * @param {number, optional} $timeStamp [null]
	 */
	startTime($timeStamp = null) {
		// Check for a provided timestamp
		if (!$lodash.isNull($timeStamp)) {
			// Reset the start timestamp into the instance
			this.mStartTime = $timeStamp;
		}
		// We're done, return the start timestamp from the instance
		return this.mStartTime;
	}

	/**
	 * This method returns the total amount of time the activity entry lasted with the ability to reset it inline
	 * @name ModelCollarActivity.totalTime()
	 * @param {$number, optional} $seconds
	 * @returns {number}
	 */
	totalTime($seconds = null) {
		// Check for a provided seconds
		if (!$lodash.isNull($seconds)) {
			// Reset the total time into the instance
			this.mTotalTime = $seconds;
		}
		// We're done, return the total time from the instance
		return this.mTotalTime;
	}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}; /// End ModelCollarActivity Definition ////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

