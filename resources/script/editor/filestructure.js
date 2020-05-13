"use strict";

import {globalValues, processLargeArrayAsync} from './global.js'
import {setCodeMirrorData} from './project.js'

export function filestructure() {
  $('#reloadFileTree').on('click', function (e) {
    $.ajax({
      type: "GET",
      url: "/api/file/reloadFileTree",
      success: function (data) {
        globalValues.currentFileTree = data
        $('#filetree').fancytree('getTree').reload(createTree(data))
      }
    })
  });

  $(document).keydown(function(event) {
    if (event.ctrlKey && event.keyCode == 80) {
      event.preventDefault()
      $('#searchFilesModal').modal('show')
    }
  });

  $('#searchFilesModal').on('shown.bs.modal', function (e) {
    $('#inputSearchFiles').on('input', inputSearchFilesListener)
    $('#inputSearchFiles').focus()
  })
  $('#searchFilesModal').on('hide.bs.modal', (e) => {
    $('#inputSearchFiles').off('input')
  })


}

export function retriveFile(path) {
  console.log('path: ', path)
  $.ajax({
    type: 'POST',
    url: '/api/file/downloadFile',
    data: {
      fileName: path
    },
    success: (data) => {
      if (globalValues.codemirrorInstance.getValue() === globalValues.loadedFile || globalValues.loadedFile === '') {
        setCodeMirrorData(data, path)
      } else {
        globalValues.tempLoadedFile = data
        globalValues.tempLoadedFilePath = path
        $('#unsavedFileModal').modal('show') 
      }
    }
  });
}

export function createTree(array) {
  let outputArray = []
  if (Array.isArray(array)) {
    array.forEach(a => {
      if (a.children) {
        outputArray.push({
          title: a.name,
          key: a.path,
          folder: true,
          children: createTree(a.children)
        })
      } else {
        outputArray.push({
          title: a.name,
          key: a.path
        })
      }
    })
  } else {
    if (array.children) {
      outputArray.push({
        title: array.name,
        key: array.path,
        folder: true,
        children: createTree(array.children)
      })
    } else {
      outputArray.push({
        title: array.name,
        key: array.path
      })
    }
  }
  return outputArray;
}

export function inputSearchFilesListener() {
  let value = $('#inputSearchFiles').val()
  $('#listOfSearchFiles').empty()
  $('#searchFilesResults').text('')
  let container = document.createDocumentFragment();
  let addedItems = 0
  if (value.length >= 1) {
    $('#searchFilesResults').addClass('spinner-border spinner-border-sm')
    let addToList = (path, name) => {
      if (addedItems < 5000) {
        let retriveFileListener = (event) => {
          const path = $(event.currentTarget).attr('data-path')
          retriveFile(path)
          $('#searchFilesModal').modal('hide')
          let node = globalValues.fancyTree.getNodeByKey(path);
          node.setActive(true)
        }
        let modeLink = document.createElement('a')
        modeLink.setAttribute('data-path', path)
        modeLink.innerHTML = name + '<br/><small>' + path + '</small>'
        modeLink.classList.add("dropdown-item")
        modeLink.style.overflow = "hidden";
        modeLink.style.textOverflow = "ellipsis";
        modeLink.addEventListener("click", retriveFileListener)
        container.appendChild(modeLink)
      }
      addedItems = addedItems + 1

    }
    let printArray = function(arr) {
      if (Array.isArray(arr)) {
        for (var i = 0; i < arr.length; i++) {
          if (arr[i].children) {
            if (arr[i].name.toLowerCase().includes(value.toLowerCase())) {
              setTimeout(addToList(arr[i].path, arr[i].name),1)
            }
            printArray(arr[i].children);
          } else {
            if (arr[i].name.toLowerCase().includes(value.toLowerCase())) {
              setTimeout(addToList(arr[i].path, arr[i].name), 1)
            }
          }
        }
      } else {
        if (arr.children) {
          if (arr.name.toLowerCase().includes(value.toLowerCase())) {
            setTimeout(addToList(arr.path, arr.name), 1)
          }
          printArray(arr.children);
        }
      }
    }
    printArray(globalValues.currentFileTree)
    $('#searchFilesResults').removeClass('spinner-border spinner-border-sm')
    $('#listOfSearchFiles').append(container)
    $('#searchFilesResults').text(addedItems + ' files found')
  }
}

