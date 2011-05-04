/** Engine:
 *
 *  Types:
 *    Interval: Number(over 10)
 *    Text: String
 *
 *  Private:
 *
 *  Public:
 *    start: Void -> Void
 *    kill: Void -> Void
 *    suspend: Interval -> Void
 *    status: Void -> Text
 */
var Engine = function () {
  this.gnosis   = Collector.finalize();
  this.state    = this.STOPED;
  this.timeout  = null;

  this.suspend(this.BUSY_WAIT);
  return this;
};
/** Engine -- constants:
 *
 * This array list all the states that the controller can be
 */

Engine.prototype.INTERVAL    = 200; // default interval in ms
Engine.prototype.RENEW       = 80;  // awake each n tasks
Engine.prototype.BUSY_WAIT   = 42;  // if busy to avoid a blocking monothead, delay the next wave
Engine.prototype.STOPED      = 0;
Engine.prototype.STARTED     = 1;
Engine.prototype.SUSPENDED   = 2;

/** Engine.start:
 *
 *  This function is called regularly to execute tasks one by one
 *
 */
Engine.prototype.start = function () {
  if (this.state == this.STARTED) return ;
  var count = this.RENEW;
  this.state = this.STARTED;
  this.gnosis.scheduler.autocheck();
  while (this.state == this.STARTED && count > 0) {
    count = this.gnosis.scheduler.execute(function executor(task) {
      /*/ DEBUG /*/ Debug.dump(task.location);
      this.gnosis
        .resolv(task.location)
        .into('driver')
        .browse(function (location, driver) {
          /*/ DEBUG /*/ Debug.dump(' -> '+location);
        });
      return true;
    }, this) ? count - 1 : -1;
  };
  /*/ DEBUG /*/ if (count < 0) this.suspend(this.INTERVAL);
  // PROD // this.suspend(count > 0 ? this.INTERVAL : this.BUSY_WAIT);
};

/** Engine.kill:
 *
 *  This function stop definitly the controller, a the end of
 *  the round, no more task will be processed
 *
 */
Engine.prototype.kill = function () {
  if (this.timeout > 0) clearTimeout(this.timeout);
  this.timeout = null;
  this.state = this.STOPED;
};

/** Engine.suspend
 *
 *  This function suspend the controller for a the specified duration
 *
 */
Engine.prototype.suspend = function (duration) {
  this.state = this.SUSPENDED;
  var self = this;
  if (!(duration > 10)) duration = this.INTERVAL;
  this.timeout = setTimeout(function engine() { self.start(); }, duration);
};

/** Engine.status
 *
 *  this function returns a string human readable to be informed of the current status
 */
Engine.prototype.status = function () {
  var state;
  switch (this.state) {
  case this.STARTED: state = 'dead'; break ;
  case this.STOPED: state = 'stoped'; break ;
  case this.SUSPENDED: state = 'sleeping'; break ;
  default: state = 'undefined'; break ;
  }
  return state+' - '+this.gnosis.scheduler.load()+' tasks pending';
};

var Engine = new Engine();
