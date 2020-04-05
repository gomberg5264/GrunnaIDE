'use strict'

const PATH = require('path');
const Env = use('Env')
const dirTree = require("directory-tree");

class Shared {

  async getTree(userUUID, projectName) {
    const projPathLength = (Env.get('GITPROJECTDIR') + '/' + userUUID).length
    return await dirTree(Env.get('GITPROJECTDIR') + '/' + userUUID + '/' + projectName, {
      exclude: [new RegExp('\/.git$')]
    }, (item, PATH, stats) => {
      if (item.path.charAt(0) === '.') {
        item.path = item.path.slice(projPathLength)
      } else {
        item.path = item.path.slice(projPathLength - 2)
      }
    }, (item, PATH, stats) => {
      if (item.path.charAt(0) === '.') {
        item.path = item.path.slice(projPathLength)
      } else {
        item.path = item.path.slice(projPathLength - 2)
      }
    })
  }

  checkPath(correctPath, checkPath) {
    let pathOne = PATH.resolve(correctPath)
    let pathTwo = PATH.resolve(checkPath)
    if (pathTwo.startsWith(pathOne)) {
      return true
    } else {
      return false
    }
  }

  dockerConfig(image, binds, name) {
    console.log('image: ', image)
    let config = {
      Image: image,
      Cmd: ['/bin/bash'],
      name: name,
      'AttachStdin': true,
      'AttachStdout': true,
      'AttachStderr': true,
      'OpenStdin': true,
      Tty: true,
      "WorkingDir": "/src",
      "ExposedPorts": {
        "8080/tcp": { }
      },
      "HostConfig": {
        "NetworkMode": Env.get('DOCKER_NETWORK')
        "Binds": [
          binds + ":/src"
        ],
        "PortBindings": {
          "8080/tcp": [
            {
              "HostPort": "0"
            }
          ]
        },
        "AutoRemove": true,
      }
    }
    return config
  }
}

module.exports = Shared
