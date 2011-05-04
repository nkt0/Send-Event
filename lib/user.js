// TODO: User rule:
//   if '--' or '' then VarArgs
//   else Labeled Arg

/** User API:
 *
 *  Types:
 *
 *  Private:
 *
 *  Public:
 *    pop(void, field)
 *      -> obtain a reason
 *        -> may be focused by field
 *    put(who, why)
 *      -> ask to an actor (who) to execute an action (why)
 *    get(void | this.RAW)
 *      -> read a data to be informed of the current gnosis state
 *        -> but unchecked if this.RAW given
 *    set(how, what)
 *      -> inform that your state has been changed by saying how
 *        -> and by what
 */

var User = function (engine) {
  var base = {};
  base = this.constants.fold(base, inherit, this);
  base = this.methods.fold(base, inheritCall(engine), this);
  return base;
};

/** User.constants:
 *
 *  This is an array that contains constants name to inherit
 */
User.prototype.constants = ['CYCLIC'];

/** User.methods:
 *
 *  This is an array that contains methods name to invoke in order to produce
 *  restricted methods
 */
User.prototype.methods = ['pop', 'put', 'get', 'set'];

/** User.CYCLIC
 *
 *  Define to determine if the task is called because of a periodicity reason
 */
User.prototype.CYCLIC = '__cyclic__';

/** User.pop:
 *
 *  Obtain a reason of why the driver is called
 *  this is handled by a task object
 *
 *  By specifying a filter you will focus the desired entity
 */
User.prototype.pop = function (self) {
  return function () {

  };
};

/** User.put:
 *
 * This function aim to write a data, by the way
 * any driver who are listening on would be informed
 */
User.prototype.put = function (self) {
  return function () {

  };
};

/** User.get:
 *
 *  This function aim to get a value from Stoker
 *  Check if result is valid
 *  Put in cache the result if valid
 *
 */
User.prototype.call = function (self) {
  return function () {

  };
};
