/*
 * Copyright (c) 2017 Jarón Barends
 *
 * Dummy-implementation of SBrick.js just for development purposes
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

(function() {
	'use strict';

	const ID_SBRICK                             = "SBrick";
	const FIRMWARE_COMPATIBILITY                = 4.17;

	const UUID_SERVICE_DEVICEINFORMATION        = "device_information";
	const UUID_CHARACTERISTIC_MODELNUMBER       = "model_number_string";
	const UUID_CHARACTERISTIC_FIRMWAREREVISION  = "firmware_revision_string";
	const UUID_CHARACTERISTIC_HARDWAREREVISION  = "hardware_revision_string";
	const UUID_CHARACTERISTIC_SOFTWAREREVISION  = "software_revision_string";
	const UUID_CHARACTERISTIC_MANUFACTURERNAME  = "manufacturer_name_string";

	const UUID_SERVICE_REMOTECONTROL            = "4dc591b0-857c-41de-b5f1-15abda665b0c";
	const UUID_CHARACTERISTIC_REMOTECONTROL     = "02b8cbcc-0e25-4bda-8790-a15f53e6010f";
	const UUID_CHARACTERISTIC_QUICKDRIVE        = "489a6ae0-c1ab-4c9c-bdb2-11d373c1b7fb";

	const UUID_SERVICE_OTA                      = "1d14d6ee-fd63-4fa1-bfa4-8f47b42119f0";
	const UUID_CHARACTERISTIC_OTACONTROL        = "f7bf3564-fb6d-4e53-88a4-5e37e0326063";

	// REMOTE CONTROL COMMANDS

	// Exceptions
	const ERROR_LENGTH  = 0x80; // Invalid command length
	const ERROR_PARAM   = 0x81; // Invalid parameter
	const ERROR_COMMAND = 0x82; // No such command
	const ERROR_NOAUTH  = 0x83; // No authentication needed
	const ERROR_AUTH    = 0x84; // Authentication error
	const ERROR_DOAUTH  = 0x85; // Authentication needed
	const ERROR_AUTHOR  = 0x86; // Authorization error
	const ERROR_THERMAL = 0x87; // Thermal protection is active
	const ERROR_STATE   = 0x88; // The system is in a state where the command does not make sense

	// Commands
	const CMD_BREAK      			= 0x00; // Stop command
	const CMD_DRIVE					= 0x01; // Drive command
	const CMD_GET_CHANNEL_STATUS	= 0x22; // Get channel status command
	const CMD_ADC        			= 0x0F; // Query ADC
	const CMD_ADC_VOLT   			= 0x08; // Get Voltage
	const CMD_ADC_TEMP   			= 0x09; // Get Temperature

	// Channels
	const CHANNEL_0 = 0x00; // Top-Left Channel
	const CHANNEL_1 = 0x01; // Bottom-Left Channel
	const CHANNEL_2 = 0x02; // Top-Right Channel
	const CHANNEL_3 = 0x03; // Bottom-Right Channel

	// Directions
	const CLOCKWISE        = 0x00; // Clockwise
	const COUNTERCLOCKWISE = 0x01; // Counterclockwise

	// Values limits
	const MIN    = 0;   // No Speed
	const MAX    = 255; // Max Speed
	const MAX_QD = 127; // Max Speed for QuickDrive
	const MAX_VOLT = 9; // Max Voltage = Full battery

	// SBrickDummy class definition
	class SBrickDummy {

		constructor() {
			// start dummy vars
			this._isConnected = false;


			// export constants
			this.CHANNEL0   = CHANNEL_0;
			this.CHANNEL1   = CHANNEL_1;
			this.CHANNEL2   = CHANNEL_2;
			this.CHANNEL3   = CHANNEL_3;
			this.CW         = CLOCKWISE;
			this.CCW        = COUNTERCLOCKWISE;
			this.MAX        = MAX;
			this.SERVICES   = {}

			// status
			this.keepalive = null;
			this.channel   = [
				{ power: MIN, direction: CLOCKWISE, busy: false },
				{ power: MIN, direction: CLOCKWISE, busy: false },
				{ power: MIN, direction: CLOCKWISE, busy: false },
				{ power: MIN, direction: CLOCKWISE, busy: false }
			];

			// queue
			this.maxConcurrent = 1;
			this.maxQueue      = Infinity;
			this.queue         = new Queue( this.maxConcurrent, this.maxQueue );

			// debug
			this._debug         = false;
		}// constructor


		/**
		* mimic connecting to SBrick with small timeout
		* by adjusting the the success variable, you can 
		* @returns {promise}
		*/
		connect(SBrickname) {
			// return always resolving Promise
			const success = true;// set this to false to test failing connection
			return new Promise((resolve, reject)  => {
				setTimeout( () => {
					if (success) {
						this._isConnected = true;
						console.log(this);
						console.log('new conn:', this._isConnected);
						resolve();
					} else {
						reject('Connect set to fail in sbrick-dummy.js\'s connect method');
					}
				}, 100);
			});
		}


		/**
		* mimic disconnecting from SBrick
		* @returns {undefined}
		*/
		disconnect() {
			return new Promise((resolve, reject) => {
				if ( this.isConnected() ) {
					this._isConnected = false;
					resolve();
				} else {
					reject('Not connected');
				}
			}).then( () => {
				console.log('TODO: mimic stop all in disconnect');
			});
		};
		


		/**
		* check if dummy's state is connected
		* @returns {boolean}
		*/
		isConnected() {
			return this._isConnected;
		};


		/**
		* send drive command
		* @returns {promise}
		* @param {hexadecimal number} channel The number of the channel to update (0x00, 0x01, 0x02, 0x03 - you can use the constants SBrick.CHANNEL_0 etc)
		* @param {hexadecimal number} direction The drive direction (0x00, 0x01 - you can use the constants SBrick.CLOCKWISE and SBrick.COUNTERCLOCKWISE)
		* @param {number} power The power level for the drive command 0-255
		*/
		drive( channel, direction, power ) {
			return new Promise( (resolve, reject) => {
				if( channel != null && direction !== null && power !== null ) {
					resolve();
				} else {
					reject('Wrong input');
				}
			}).then( () => {
				let channels    = [CHANNEL_0,CHANNEL_1,CHANNEL_2,CHANNEL_3];
				let directions = [CLOCKWISE,COUNTERCLOCKWISE];

				this.channel[channel].power     = Math.min(Math.max(parseInt(Math.abs(power)), MIN), MAX);
				this.channel[channel].direction = directions[direction];
			})
		};
		


		/**
		* send quickDrive command
		* @returns {undefined}
		* @param {array} channel_array An array with an object {channel, direction, power} for every channel you want to update
		*/
		quickDrive(channel_array) {
			return new Promise( (resolve, reject) => {
				if( channel_array !== null && Array.isArray(channel_array) ) {
					resolve();
				} else {
					reject('Wrong input');
				}
			}).then( () => {

				for(var i=0; i<4; i++) {
					if( typeof channel_array[i] !== 'undefined' ) {
						var channel = parseInt( channel_array[i].channel );
						this.channel[channel].power     = Math.min(Math.max(parseInt(Math.abs(channel_array[i].power)), MIN), MAX);
						this.channel[channel].direction = channel_array[i].direction ? COUNTERCLOCKWISE : CLOCKWISE;
					}
				}

				if( !this.channel[0].busy && !this.channel[1].busy && !this.channel[2].busy && !this.channel[3].busy ) {
					// real code has bluetooth stuff here
				}
			})
			.catch( e => { this._error(e) } );
		};


		/**
		* stop a channel
		* @param {hexadecimal number} channel The channel to stop
		* @returns {promise}
		*/
		stop(channel) {
			return new Promise( (resolve, reject) => {
				if( channel !== null ) {
					resolve();
				} else {
					reject('wrong input');
				}
			}).then( () => {

				if( !Array.isArray(channel) ) {
					channel = [ channel ];
				}

				// set motors power to 0 in the object
				for(var i=0; i<channel.length; i++) {
					this.channel[channel[i]].power = 0;
				}

				// in real code, bluetooth stuff here
			})
			.catch( e => { this._error(e) } );
		};
		
		


		_deviceInfo( uuid_characteristic ) {
			return new Promise( (resolve, reject) => {
				if( typeof this.SERVICES[UUID_SERVICE_DEVICEINFORMATION].characteristics[uuid_characteristic] != 'undefined' ) {
					resolve();
				} else {
					reject('Wrong input');
				}
			} ).then( () => {
				return WebBluetooth.readCharacteristicValue( uuid_characteristic )
				.then(data => {
					var str = "";
					for (let i = 0; i < data.byteLength; i++) {
						str += String.fromCharCode(data.getUint8(i));
					}
					return str;
				})
				.catch( e => { this._error(e) } );
			})
			.catch( e => { this._error(e) } );
		}

		getModelNumber() {
			return this._deviceInfo(UUID_CHARACTERISTIC_MODELNUMBER).then( model => {
					return model;
			} )
		}

		getFirmwareVersion() {
			return this._deviceInfo(UUID_CHARACTERISTIC_FIRMWAREREVISION).then( version => {
					return version;
			} )
		}

		getHardwareVersion() {
			return this._deviceInfo(UUID_CHARACTERISTIC_HARDWAREREVISION).then( version => {
					return version;
			} )
		}

		getSoftwareVersion() {
			return this._deviceInfo(UUID_CHARACTERISTIC_SOFTWAREREVISION).then( version => {
					return version;
			} )
		}

		getManufacturerName() {
			return this._deviceInfo(UUID_CHARACTERISTIC_MANUFACTURERNAME).then( version => {
					return version;
			} )
		}


		/**
		* stop all channels
		* @returns {promise}
		*/
		stopAll() {
			return this.stop([ CHANNEL_0, CHANNEL_1, CHANNEL_2, CHANNEL_3 ]);
		}
		

		/**
		* get battery percentage
		* @returns {number}
		*/
		getBattery() {
			return this._volt()
			.then( (volt) => {
				return parseInt( Math.abs( volt / MAX_VOLT * 100 ) );
			});
		}


		getTemp( fahrenheit ) {
			return this._temp()
			.then( temp => {
				let result = 0;
				if( fahrenheit ) {
					result = temp * 9/5 + 32;
					result = result; // ' °F';
				} else {
					result = temp; // ' °C';
				}
				return result;
			});
		}

		/* PRIVATE METHODS */
		_keepalive() {
			return setInterval( () => {
				if( !this.isConnected() ) {
					this._log('Connection lost');
					clearInterval( this.keepalive );
				} else if( this.queue.getQueueLength() === 0 ) {
					this.queue.add( () => {
						return WebBluetooth.writeCharacteristicValue(
							UUID_CHARACTERISTIC_REMOTECONTROL,
							new Uint8Array( [ CMD_ADC, CMD_ADC_TEMP ] )
						);
					} );
				}
			}, 300);
		}


		_adc( mode ) {
			return this.queue.add( () => {
				return WebBluetooth.writeCharacteristicValue(
					UUID_CHARACTERISTIC_REMOTECONTROL,
					new Uint8Array([CMD_ADC,mode])
				).then(() => {
					return WebBluetooth.readCharacteristicValue(UUID_CHARACTERISTIC_REMOTECONTROL)
					.then(data => {
						return data.getInt16( 0, true );
					});
				});
			});
		}


		/**
		* give dummy voltage between 0 - MAX_VOLT
		* @returns {promise}
		*/
		_volt() {
			return new Promise( (resolve, reject) => {
				const volt = MAX_VOLT * Math.random();
				resolve(volt);
			});
		}



		/**
		* get random value for temperature in degrees °C between 22 and 36
		* @returns {undefined}
		*/
		_temp() {
			return new Promise( (resolve, reject) => {
				const temp = 14 * Math.random() + 22;
				resolve(temp);
			}).then( (temp) => {
				return temp;
			});
		}


		_error( msg ) {
			if(this._debug) {
				console.debug(msg);
			} else {
				throw msg;
			}
		}

		_log( msg ) {
			if(this._debug) {
				console.log(msg);
			}
		}

		/* STATIC METHODS */
		invertDirection( direction ) {
			return direction==CLOCKWISE ? COUNTERCLOCKWISE : CLOCKWISE;
		}

  }

  window.SBrickDummy = new SBrickDummy();

})();
