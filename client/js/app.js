var app = angular.module('group-analytics', ['ngRoute']);

app.config(['$routeProvider',
function($routeProvider) {
$routeProvider
.when('/', {templateUrl: '/allSessions.html',
            controller: 'mainController'})
.when('/addsession', {templateUrl: '/addSession.html',
            controller: 'sessionController'})
.when('/addactions/:id', {templateUrl: '/allActions.html',
            controller: 'actionsController'})
.when('/add', {})
.when('/media/:id', {templateUrl: '/addMedia.html',
            controller: 'mediaController'})
.when('/objects/:id', {templateUrl: '/addObjects.html',
            controller: 'objectsController'})
.when('/manage/:id', {templateUrl: '/controlSources.html',
            controller: 'manageSourcesController'})
.when('/delete/:id', {})
.otherwise({
redirectTo: '/'
});
}
]);

app.factory('socket', ['$rootScope', function($rootScope) {
  var socket = io.connect();

  return {
    on: function(eventName, callback){
      socket.on(eventName, callback);
    },
    emit: function(eventName, data) {
      socket.emit(eventName, data);
    }
  };
}]);

app.controller('mainController', function($window, $scope, $location, $routeParams, $http, socket) {
  $scope.formData = {};
  $scope.sessionData = {};
  // Get all sessions
  $http.get('/api/v1/sessions/all')
  .success(function(data){
    $scope.sessionData = data;
      //console.log(data);
  })
  .error(function(error){
    console.log('Error: ' + error);
  });

  $scope.redirectSession = function(){
    $location.path('/addsession');
  };
    // List actions
  $scope.listActions = function(sessionID){
    //alert(sessionID);
    $location.url('/addactions/'+sessionID);
  };

  //redirect to manage data sources
  $scope.redirectSources = function(sessionID) {

    $location.path('/media/'+sessionID);
  };

  $scope.redirectObjects = function(sessionID) {

    $location.path('/objects/'+sessionID);
  };

  $scope.redirectCapture = function(sessionID) {

    $location.path('/manage/'+sessionID);
  };

  $scope.redirectTimeline = function(sessionID) {
    
    //$location.path('/timeline/'+sessionID);
    var dataObj = {
        id_session : sessionID
    };
    $http.post('/api/v1/visualisations/getDataforVis',dataObj)
      .success(function(data){
        console.log(data);
          $http.post('/api/v1/visualisations/generateJson', data)
          .success(function(objs){
              //$scope.nparticipants = objs.n; 
            //$scope.selectedactions = objs;
            console.log('http://localhost:3000/timeline/'+sessionID);
            $window.location.href='http://localhost:3000/timeline/'+sessionID;
          })
          .error(function(error){
            console.log('Error: ' + error);
          });
      })
      .error(function(error){
        console.log('Error: ' + error);
      });
  };

});

app.controller('visController', function($scope, $location, $routeParams, $http, socket) {
  $scope.sessionid = $routeParams.id;
  $scope.nparticipants = 0;
  var containers = [];

  wrapper = document.getElementById('timelines');
  var dataObj = {
        id_session : $scope.sessionid
    };
  $http.post('/api/v1/visualisations/getDataforVis',dataObj)
      .success(function(data){
          $http.post('/api/v1/visualisations/generateJson', data)
          .success(function(objs){
              //$scope.nparticipants = objs.n; 
            //$scope.selectedactions = objs;
            //$location.path('/timelines.html');
          })
          .error(function(error){
            console.log('Error: ' + error);
          });
      })
      .error(function(error){
        console.log('Error: ' + error);
      });
});

app.controller('sessionController', function($scope, $location, $routeParams, $http, socket) {
  $scope.formData = {};
  $scope.sessionData = {};
  // Create a new session
  $scope.createSession = function(){
    $http.post('/api/v1/sessions/create', $scope.formData)
    .success(function(data){
      $scope.formData = {};
      $scope.sessionData = data;
      console.log(data.id);
      $location.path('/media/'+data.id);
    })
    .error((error) => {
      console.log('Error: ' + error);
    });
  };
  // Delete a todo
  $scope.deleteSession = (sessionID) => {
    $http.delete('/api/v1/session/delete' + sessionID)
    .success((data) => {
      $scope.todoData = data;
      console.log(data);
    })
    .error((data) => {
      console.log('Error: ' + data);
    });
  };

});

app.controller('actionsController', function($scope, $location, $route, $routeParams, $http, socket) {
  $scope.actionData = {};
  $scope.objectData = {};
  $scope.selectedactions = {}
  $scope.sessionid = $routeParams.id;

  var dataObj = {
        id_session : $scope.sessionid
    };
  
  //get all actions
  $http.get('/api/v1/actions/all')
  .success(function(objs){
    $scope.actionData = objs;
  })
  .error(function(error){
    console.log('Error: ' + error);
  });
  //this gets all actions that have been selected by the user in a specific session
  $http.post('/api/v1/actions/actionsinsession', dataObj)
  .success(function(objs){
    $scope.selectedactions = objs;
  })
  .error(function(error){
    console.log('Error: ' + error);
  });
  //getStudentsperSession
  $http.get('/api/v1/objects/studentsession/'+$scope.sessionid)
  .success(function(objs){
    $scope.objectData = objs;
  })
  .error(function(error){
    console.log('Error: ' + error);
  });


  $scope.logActionObject = function(objID,actID,actDesc){
    
    const dataObj = {
        id_session : $scope.sessionid,
        id_object : objID,
        id_action : actID,
        desc: actDesc
    };
    //console.log(dataObj);
    $http.post('/api/v1/actions/insertactionsession', dataObj )
        .success(function(data){
          $scope.selectedactions = data;
        })
        .error((error) => {
          console.log('Error: ' + error);
        });

  };//end log

  $scope.deleteAction = function(actID){
    
    const dataObj = {
        id_session : $scope.sessionid,
        id_action : actID
      };
    //console.log(dataObj);
    $http.post('/api/v1/actions/deleteaction', dataObj )
        .success(function(data){
          $scope.selectedactions = data;
        })
        .error((error) => {
          console.log('Error: ' + error);
        });

  };//end log
  
});

app.controller('mediaController', function($scope, $location, $routeParams, $http) {
  $scope.sourceSession = {};
  $scope.sourceData = {};
  $scope.sessionid = $routeParams.id;
  // Get all sessions
  $http.get('/api/v1/media/all')
  .success(function(data){
    $scope.sourceData = data;
  })
  .error(function(error){
    console.log('Error: ' + error);
  });
  //get all sources by session
  $http.get('/api/v1/media/datasession/'+$scope.sessionid)
  .success(function(datapersession){
    $scope.sourceSession = datapersession;
  })
  .error(function(error){
    console.log('Error: ' + error);
  });

// add source media to database
  $scope.addSourceMedia = function(sourceId, sourceName){
    console.log(sourceId);

    var id_source_session = 0;
    var dataObj = {
        id_session : $scope.sessionid,
        id_datatype : sourceId
    };

    $http.post('/api/v1/media/datasession', dataObj )
    .success(function(data){
    if(data.length == 0){
      id_source_session = 1;
      }
      else{
        id_source_session = data.length+1;
      }
          //console.log(id_source_session);

      dataObj = {
              id_session : $scope.sessionid,
              id_datatype : sourceId,
              id_datatype_session : id_source_session,
              name : sourceName+'-'+id_source_session
          };
      $http.post('/api/v1/media/addsourceSession', dataObj )
        .success(function(data){
        $scope.sourceSession = data;
        id_source_session = 0;
        })
        .error((error) => {
          console.log('Error: ' + error);
        });

    })
    .error((error) => {
      console.log('Error: ' + error);
    });    
    };

  //redirect to assign Objects to session
  $scope.assignObjects = function() {
    $location.path('/objects/'+$scope.sessionid);
  };

}); //end controller

app.controller('objectsController', function($scope, $location, $routeParams, $http) {
  $scope.objectsData = {};
  $scope.objectsperSessionData = {};
  $scope.trackers_pozyx = {};
  $scope.trackers_empatica = {};
  $scope.sessionid = $routeParams.id;
  // Get all objects
  $http.get('/api/v1/objects/all')
  .success(function(data){
    $scope.objectsData = data;
  })
  .error(function(error){
    console.log('Error: ' + error);
  });
  //get all objects per session
  $http.get('/api/v1/objects/objectsession/'+$scope.sessionid)
  .success(function(datapersession){
    $scope.objectsperSessionData = datapersession;
    //console.log(datapersession)
  })
  .error(function(error){
    console.log('Error: ' + error);
  });

  //get all trackers=pozyx serials
  $http.get('/api/v1/objects/trackers/'+'pozyx')
    .success(function(tracker){
      $scope.trackers_pozyx = tracker;
      //console.log($scope.trackers_pozyx);
    })
    .error(function(error){
      console.log('Error: ' + error);
    });

//get all trackers=empatica serials
  $http.get('/api/v1/objects/trackers/'+'empatica')
    .success(function(tracker){
      $scope.trackers_empatica = tracker;
      //console.log($scope.trackers_empatica);
    })
    .error(function(error){
      console.log('Error: ' + error);
    });

// add source media to database
  $scope.addObjectSession = function(objId, objName){
    console.log(objId);
    var dataObj = {
        id_session : $scope.sessionid,
        id_obj : objId,
        name : objName
    };
    $http.post('/api/v1/objects/countobjssession', dataObj )
    .success(function(objNname){
       dataObj.name = objNname;

       $http.post('/api/v1/objects/addobjsession', dataObj )
        .success(function(datapersession){
           $scope.objectsperSessionData = datapersession;
        })
        .error((error) => {
          console.log('Error: ' + error);
        }); 

    })
    .error((error) => {
      console.log('Error: ' + error);
    }); 
   
    };

  $scope.updateTagObjSession = function(objsId,item){
    //alert(item);
    var dataObj = {
        id_session : $scope.sessionid,
        id_objs : objsId,
        serial : item,
        type: 'pozyx'
    };

     $http.post('/api/v1/objects/updateserial', dataObj )
        .success(function(data){
        //$scope.objectsperSessionData = data;
        })
        .error((error) => {
          console.log('Error: ' + error);
        });

  };//end update

  $scope.updateWristbandObjSession = function(objsId,item){
    //alert(item);
    var dataObj = {
        id_session : $scope.sessionid,
        id_objs : objsId,
        serial : item,
        type: 'empatica'
    };

     $http.post('/api/v1/objects/updateserial', dataObj )
        .success(function(data){
        //$scope.objectsperSessionData = data;
        })
        .error((error) => {
          console.log('Error: ' + error);
        });

  };//end updatewristband


  $scope.controlSources = function() {

    $location.path('/manage/'+$scope.sessionid);
  };
}); //end controller

app.controller('manageSourcesController', function($scope, $location, $routeParams, $http, socket) {
  $scope.sourceSession = {}
  $scope.sessionid = $routeParams.id;
  //get all sources by session
  $http.get('/api/v1/media/datasession/'+$scope.sessionid)
  .success(function(datapersession){
    $scope.sourceSession = datapersession;
      //console.log(datapersession);
  })
  .error(function(error){
    console.log('Error: ' + error);
  });

  $scope.startCapture = function(sessionId, datatypeId, datasessionId){
    var dataObj = {
        id_session : sessionId,
        id_datatype : datatypeId,
        id_datatype_session: datasessionId,
        status : 1
    };
    //if datatypeId is pozyx
    if(datatypeId == 1){

      $http.post('/api/v1/media/updateSourceSession', dataObj )
        .success(function(data){
        console.log(data);
        $scope.sourceSession = data;
           /* $http.post('api/v1/location/startLocationCapture', {id_session:sessionId})
            .success(function(){
              })
              .error((error) => {
                console.log('Error: ' + error);
              });*/
        })
        .error((error) => {
          console.log('Error: ' + error);
        });

      }//end if
      else if(datatypeId == 4){
        console.log('manikin');
      $http.post('/api/v1/media/updateSourceSession', dataObj )
        .success(function(data){
        console.log(data);
        $scope.sourceSession = data;
            $http.post('api/v1/actions/startActionsCapture', {id_session:sessionId})
            .success(function(){
              })
              .error((error) => {
                console.log('Error: ' + error);
              });
        })
        .error((error) => {
          console.log('Error: ' + error);
        });

      }//end if

    else{
      $http.post('/api/v1/media/updateSourceSession', dataObj )
      .success(function(data){
      console.log(data);
      $scope.sourceSession = data;
      })
      .error((error) => {
        console.log('Error: ' + error);
      });
    } //end else
  };

  $scope.stopCapture = function(sessionId, datatypeId, datasessionId){
    var dataObj = {
        id_session : sessionId,
        id_datatype : datatypeId,
        id_datatype_session: datasessionId,
        status : 0
    };
    //datatypeId == 1 - pozyx
    if(datatypeId == 1){
      
      $http.post('/api/v1/media/updateSourceSession', dataObj )
          .success(function(data){
          console.log(data);
          $scope.sourceSession = data;
          /*
              $http.post('api/v1/location/stopLocationCapture', {id_session:sessionId})
              .success(function(data){
                console.log(data);
                  //$scope.sourceSession = data;
                  
                })
                .error((error) => {
                  console.log('Error: ' + error);
                });*/
          })
          .error((error) => {
            console.log('Error: ' + error);
          });
   }//end if
   else if(datatypeId == 4){
      
      $http.post('/api/v1/media/updateSourceSession', dataObj )
          .success(function(data){
          //console.log(data);
          $scope.sourceSession = data;

              $http.post('api/v1/actions/stopActionsCapture', {id_session:sessionId})
              .success(function(data){
                console.log(data);
                  //$scope.sourceSession = data;
                  
                })
                .error((error) => {
                  console.log('Error: ' + error);
                });
          })
          .error((error) => {
            console.log('Error: ' + error);
          });
    }//end if
    else{
    $http.post('/api/v1/media/updateSourceSession', dataObj )
    .success(function(data){
    //console.log(data);
    $scope.sourceSession = data;
    })
    .error((error) => {
      console.log('Error: ' + error);
    });
  } //end else
  };

  $scope.endSession = function(){
    var dataObj = {
        id_session : $scope.sessionid,
    };

    $http.post('/api/v1/sessions/stop', dataObj )
    .success(function(data){
    console.log(data);
    $scope.sourceSession = data;
    })
    .error((error) => {
      console.log('Error: ' + error);
    });
    $location.path('/');
    };
}); //end controller