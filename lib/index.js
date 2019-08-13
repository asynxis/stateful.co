var request = require('request')
var Promise = require('bluebird')
var _ = require('lodash')

function Counter(urn, token, counterName) {
  this.urn = urn
  this.token = token
  ;(this.urlPrefix = 'http://www.stateful.co/c/' + counterName + '/'),
    (this.headers = {
      'X-Sttc-URN': this.urn,
      'X-Sttc-Token': this.token,
    })
}

Counter.prototype.sendRequest = function(method, path, successCode) {
  if (!successCode) {
    successCode = 200
  }
  return new Promise(
    function(resolve, reject) {
      var options = { method: method, url: this.urlPrefix + path, headers: this.headers }
      request(
        options,
        function(error, response, body) {
          if (!error) {
            if (response.statusCode == successCode) {
              resolve(body)
            } else {
              reject(new Error(body))
            }
          } else {
            reject(error)
          }
        }.bind(this)
      )
    }.bind(this)
  )
}

Counter.prototype.getId = function() {
  return new Promise(
    function(resolve, reject) {
      this.sendRequest('GET', 'inc?value=1', 200)
        .then(function(data) {
          resolve(parseInt(data))
        })
        .catch(function(e) {
          reject(e)
        })
    }.bind(this)
  )
}

var counters = {}

module.exports = function(counterName, urn, token) {
  if (!counters[counterName]) {
    counters[counterName] = new Counter(urn, token, counterName)
  }

  return counters[counterName]
}
