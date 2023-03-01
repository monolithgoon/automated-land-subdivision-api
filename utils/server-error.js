/**
 * @description A custom error class that extends the built-in Error class to include additional properties related to HTTP status codes.
 * @class
 * @extends Error
 */
class ServerError extends Error {

   /**
    * @description Creates a new ServerError instance.
    * @constructor
    * @param {string} message - A message describing the error.
    * @param {number} statusCode - An HTTP status code associated with the error.
    * @throws {TypeError} If message is not a string or statusCode is not a number.
    * @throws {RangeError} If statusCode is not a valid HTTP status code.
    */
   constructor(message, statusCode) {

      // Ensure that message and statusCode are provided and of the correct types
      if (typeof message !== 'string' || typeof statusCode !== 'number') {
         throw new TypeError('message must be a string and statusCode must be a number');
      }

      // Ensure that statusCode is a valid HTTP status code
      if (statusCode < 100 || statusCode > 599) {
         throw new RangeError('statusCode must be a valid HTTP status code');
      }

      super(message);

      // Set statusCode and status properties
      /**
       * The HTTP status code associated with the error.
       * @type {number}
       */
      this.statusCode = statusCode;

      /**
       * The status of the error, derived from the statusCode property.
       * If statusCode starts with '4', status is set to 'fail', otherwise it's set to 'error'.
       * @type {string}
       */
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

      /**
       * A flag indicating whether the error is operational (i.e., caused by a problem with the application)
       * or not (i.e., caused by external factors such as network errors).
       * @type {boolean}
       */
      this.isOperational = true;

      // Capture stack trace
      Error.captureStackTrace(this, this.constructor)
   }
}

module.exports = ServerError;
