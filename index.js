var Stream = require('stream')


module.exports = {
  openInput: function(name){
    var stream = new Stream()
    stream.readable = true
    stream.paused = false

    getInput(name, function(err, port){
      if (err) stream.emit('error', err)
      port.onmessage = function(event){
        var d = event.data
        stream.emit('data', [d[0], d[1], d[2]])
      }
    })

    return stream
  },
  openOutput: function(name){
    var stream = new Stream()
    stream.writable = true

    var queue = []

    stream.write = function(data){
      queue.push(data)
    }

    getOutput(name, function(err, port){
      if (err) stream.emit('error', err)
      queue.forEach(function(data){
        port.send(data)
      })
      stream.write = function(data){
        port.send(data)
      }
    })

    return stream
  }
}

function getInput(name, cb){
  getMidi(function(err, midi){
    if(err)return cb&&cb(err)
    if (!midi.getInputs().some(function(input){
      if (input.name === name || input.fingerprint === name){
        cb(null, midi.getInput(input))
        return true
      }
    })) {
      cb('No input with specified name')
    }
  })
}

function getOutput(name, cb){
  getMidi(function(err, midi){
    if(err)return cb&&cb(err)
    if (!midi.getOutputs().some(function(input){
      if (input.name === name || input.fingerprint === name){
        cb(null, midi.getOutput(input))
        return true
      }
    })) {
      cb('No input with specified name')
    }
  })
}

var midi = null
function getMidi(cb){
  if (midi){
    cb(null, midi)
  } else {
    window.navigator.requestMIDIAccess(function(res){
      midi = res
      cb(null, midi)
    })
  }
}
