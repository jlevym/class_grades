// this collection contains all the songs
Songs = new Mongo.Collection("songs");
// this variable will store the visualisation so we can delete it when we need to 
var visjsobj;
if (Meteor.isClient){

/// routing 

Router.configure({
  layoutTemplate: 'ApplicationLayout'
});

Router.route('/', function () {
  this.render('welcome', {
    to:"main"
  });
});

Router.route('/vis', function () {
  this.render('back_home', {
    to:"navbar"
  });
  this.render('song_viz', {
    to:"main"
  });
});
////////////////////////////
///// helper functions for the vis control form
////////////////////////////

  Template.song_viz_controls.helpers({
    // returns an array of the names of all features of the requested type
    get_feature_names : function(type){
      var feat_field;
      if (type == "single"){
        feat_field = "single_features";
      }
      // pull an example song from the database
      // - we'll use this to find the names of all the single features
      song = Songs.findOne();
      if (song != undefined){// looks good! 
        // get an array of all the song feature names 
        // (an array of strings)
        features = Object.keys(song[feat_field]);
        features_a = new Array();
        // create a new array containing
        // objects that we can send to the template
        // since we can't send an array of strings to the template
        for (var i=0;i<features.length;i++){
            features_a[i] = {name:features[i]};
        }
        return features_a;
      }
      else {// no song available, return an empty array for politeness
        return [];
      }
    },
  });

////////////////////////////
///// helper functions for the feature list display template
////// (provide the data for that list of songs)
////////////////////////////

// helper that provides an array of feature_values
// for all songs of the currently selected type
// this is used to feed the template that displays the big list of 
// numbers
  Template.song_feature_list.helpers({
    "get_all_feature_values":function(){
      if (Session.get("feature") != undefined){
        var songs = Songs.find({});
        var features = new Array();
        var ind = 0;
        // build an array of data on the fly for the 
        // template consisting of 'feature' objects
        // describing the song and the value it has for this particular feature
        songs.forEach(function(song){
          //console.log(song);
            features[ind] = {
              student:song.metadata.tags.student,
              age:song.metadata.tags.age, 
              value:song[Session.get("feature")["type"]][Session.get("feature")["name"]]
            };
            ind ++;
        })
        return features;
      }
      else {
        return [];
      }
    }
  })

////////////////////////////
///// event handlers for the viz control form
////////////////////////////

  Template.song_viz_controls.events({
    // event handler for when user changes the selected
    // option in the drop down list
    "change .js-select-single-feature":function(event){
      event.preventDefault();
      var feature = $(event.target).val();
      Session.set("feature", {name:feature, type:"single_features"});
    }, 
    // event handler for when the user clicks on the 
    // blobs button
     "click .js-show-blobs":function(event){
      event.preventDefault();
      initBlobVis();
    }, 

     // event handler for when the user clicks on the 
    // blobs button
     "click .js-show-data":function(event){
      event.preventDefault();
      initBlobVisData();
    }, 
    // event handler for when the user clicks on the 
    // timeline button
     "click .js-show-timeline":function(event){
      event.preventDefault();
      initDateVis();
    }, 

     // event handler for when the user clicks on the 
    // scatter button
     "click .js-show-scatter":function(event){
      event.preventDefault();
      initDateVisScatter();
    }, 

    "click .js-show-graph":function(event){
      event.preventDefault();
      initDateVisGraph();
    }, 
  }); 
}



////////////////////////////
///// functions that set up and display the visualisation
////////////////////////////


// function that creates a new timeline visualisation
function initDateVis(){
  // clear out the old visualisation if needed
  if (visjsobj != undefined){
    visjsobj.destroy();
  }
  var songs = Songs.find({});
  var ind = 0;
  // generate an array of items
  // from the songs collection
  // where each item describes a song plus the currently selected
  // feature
  var items = new Array();
  // iterate the songs collection, converting each song into a simple
  // object that the visualiser understands
  songs.forEach(function(song){ // all title --> age --> index
    if (song.metadata.tags.index != undefined && 
      song.metadata.tags.index[0] != undefined ){
      var label = "ind: "+ind;
      if (song.metadata.tags.index != undefined){// we have a title
        label = song.metadata.tags.student[0] + " - " + 
        song.metadata.tags.age[0]; // title --> age for label
      }  
      var value = song[Session.get("feature")["type"]][Session.get("feature")["name"]];
      console.log("value is  "+value);
      var index1 = song.metadata.tags.index[0];
      var date ='';
      if(index1 < 10){
        console.log("index1 "+index1);
        date = "000"+index1+"-01-01";
        }
        else {
          date = "00"+index1+"-01-01";
        }
      //var date = "00"+song.metadata.tags.index[0] +"-01-01" ;
      console.log("date is  "+date);
      // here we create the actual object for the visualiser
      // and put it into the items array
      items[ind] = {
        x: date, 
        y: value, 
        // slighlty hacky label -- check out the vis-label
        // class in song_data_viz.css 
        label:{content:label, className:'vis-label', xOffset:-5}, 
      };
      ind ++ ;
  }
  });
  // set up the data plotter
  //var options = {
   // style:'bar', 
  //};

var options = {
    sort: false,
    sampling:false,
    style:'bar'
  
    
};

//var options = {
    //start: '2014-06-10',
    //end: '2014-06-18'
  //};

  // get the div from the DOM that we are going to 
  // put our graph into 
  var container = document.getElementById('visjs');
  // create the graph
  visjsobj = new vis.Graph2d(container, items, options);
  // tell the graph to set up its axes so all data points are shown
  visjsobj.fit();
} // end of initDataVis

// function that creates a new graph visualisation
function initDateVisGraph(){
  // clear out the old visualisation if needed
  if (visjsobj != undefined){
    visjsobj.destroy();
  }
  var songs = Songs.find({});
  var ind = 0;
  // generate an array of items
  // from the songs collection
  // where each item describes a song plus the currently selected
  // feature
  var items = new Array();
  // iterate the songs collection, converting each song into a simple
  // object that the visualiser understands
  songs.forEach(function(song){ // all title --> age --> index
    if (song.metadata.tags.index != undefined && 
      song.metadata.tags.index[0] != undefined ){
      var label = "ind: "+ind;
      if (song.metadata.tags.index != undefined){// we have a title
        label = song.metadata.tags.student[0] + " - " + 
        song.metadata.tags.age[0]; // title --> index
      }  
      var value = song[Session.get("feature")["type"]][Session.get("feature")["name"]];
      console.log("value is  "+value);
      var index1 = song.metadata.tags.index[0];
      var date ='';
      if(index1 < 10){
        console.log("index1 "+index1);
        date = "000"+index1+"-01-01";
        }
        else {
          date = "00"+index1+"-01-01";
        }
      // here we create the actual object for the visualiser
      // and put it into the items array
      items[ind] = {
        x: date, 
        y: value, 
        // slighlty hacky label -- check out the vis-label
        // class in song_data_viz.css 
        label:{content:label, className:'vis-label', xOffset:-5}, 
      };
      ind ++ ;
  }
  });
  // set up the data plotter
  //var options = {
   // style:'bar', 
  //};

var options = {
   
};

//var options = {
    //start: '2014-06-10',
    //end: '2014-06-18'
  //};

  // get the div from the DOM that we are going to 
  // put our graph into 
  var container = document.getElementById('visjs');
  // create the graph
  visjsobj = new vis.Graph2d(container, items, options);
  // tell the graph to set up its axes so all data points are shown
  visjsobj.fit();
} // end of initDataVisGraph





// function that creates a new scatter visualisation
function initDateVisScatter(){
  // clear out the old visualisation if needed
  if (visjsobj != undefined){
    visjsobj.destroy();
  }
  var songs = Songs.find({});
  var ind = 0;
  // generate an array of items
  // from the songs collection
  // where each item describes a song plus the currently selected
  // feature
  var items = new Array();
  // iterate the songs collection, converting each song into a simple
  // object that the visualiser understands
  songs.forEach(function(song){ // all title --> age --> index
    if (song.metadata.tags.index != undefined && 
      song.metadata.tags.index[0] != undefined ){
      var label = "ind: "+ind;
      if (song.metadata.tags.index != undefined){// we have a title
        label = song.metadata.tags.student[0] + " - " + 
        song.metadata.tags.age[0]; // title --> index
      }  
      var value = song[Session.get("feature")["type"]][Session.get("feature")["name"]];

      var index1 = song.metadata.tags.index[0];
      var date ='';
      if(index1 < 10){
        console.log("index1 "+index1);
        date = "000"+index1+"-01-01";
        }
        else {
          date = "00"+index1+"-01-01";
        }
      // here we create the actual object for the visualiser
      // and put it into the items array
      items[ind] = {
        x: date, 
        y: value, 
        // slighlty hacky label -- check out the vis-label
        // class in song_data_viz.css 
        label:{content:label, className:'vis-label', xOffset:-5}, 
      };
      ind ++ ;
  }
  });
  // set up the data plotter
  //var options = {
   // style:'bar', 
  //};

var options = {
    sort: false,
    sampling:false,
    style:'points'   
};



//var options = {
    //start: '2014-06-10',
    //end: '2014-06-18'
  //};

  // get the div from the DOM that we are going to 
  // put our graph into 
  var container = document.getElementById('visjs');
  // create the graph
  visjsobj = new vis.Graph2d(container, items, options);
  // tell the graph to set up its axes so all data points are shown
  visjsobj.fit();
} // initDataVisScatter

// function that creates a new blobby visualisation
function initBlobVis(){
  // clear out the old visualisation if needed
  if (visjsobj != undefined){
    visjsobj.destroy();
  }
  // find all songs from the Songs collection
  var songs = Songs.find({});
  var nodes = new Array();
  var ind = 0;
  // iterate the songs, converting each song into 
  // a node object that the visualiser can understand
    songs.forEach(function(song){
      // set up a label with the song title and artist
     var label = "ind: "+ind;
     if (song.metadata.tags.gender != undefined){// we have a title
          label = song.metadata.tags.student[0]; 
      } 
      // figure out the value of this feature for this song
      var value = song[Session.get("feature")["type"]][Session.get("feature")["name"]];
      // create the node and store it to the nodes array
        nodes[ind] = {
          id:ind, 
          label:label, 
          value:value,
        }
        ind ++;
    })
    // edges are used to connect nodes together. 
    // we don't need these for now...
    edges =[
    ];
    // this data will be used to create the visualisation
    var data = {
      nodes: nodes,
      edges: edges
    };
    // options for the visualisation
     //var options = {
      //nodes: {
        //shape: 'dot',
      //}

var options = {
  nodes:{
    shape: 'dot',
}
    };
    // get the div from the dom that we'll put the visualisation into
    container = document.getElementById('visjs');
    // create the visualisation
    visjsobj = new vis.Network(container, data, options);
} // end of initBlobVis

// function that creates a new blob data visualisation
function initBlobVisData(){
  // clear out the old visualisation if needed
  if (visjsobj != undefined){
    visjsobj.destroy();
  }
  // find all songs from the Songs collection
  var songs = Songs.find({});
  var nodes = new Array();
  var ind = 0;
  // iterate the songs, converting each song into 
  // a node object that the visualiser can understand
    songs.forEach(function(song){
      // set up a label with the song title and artist
     var label = "ind: "+ind;
     if (song.metadata.tags.gender != undefined){// we have a title
          label = song.metadata.tags.student[0] + " - " +  // should be artist
          song.metadata.tags.gender[0]+ " - age:  " +song.metadata.tags.age[0]; // should be title
      } 
      // figure out the value of this feature for this song
      var value = song[Session.get("feature")["type"]][Session.get("feature")["name"]];
      // create the node and store it to the nodes array
        nodes[ind] = {
          id:ind, 
          label:label, 
          value:value,
        }
        ind ++;
    })
    // edges are used to connect nodes together. 
    // we don't need these for now...
    edges =[
    ];
    // this data will be used to create the visualisation
    var data = {
      nodes: nodes,
      edges: edges
    };
    // options for the visualisation
     //var options = {
      //nodes: {
        //shape: 'dot',
      //}



var options = {
  nodes:{
    borderWidth: 2,
    borderWidthSelected: 2,
    brokenImage:undefined,
    color: {
      border: '#2B7CE9',
      background: 'Red',
      //background: '#97C2FC',

      highlight: {
        border: '#2B7CE9',
        background: '#D2E5FF'
      },
      hover: {
        border: '#2B7CE9',
        background: '#D2E5FF'
      }
    },
    fixed: {
      x:false,
      y:false
    },
    font: {
      //color: '#343434',
      color: "Crimson",
      size: 14, // px
      face: 'arial',
      background: 'none',
      strokeWidth: 0, // px
      strokeColor: '#ffffff',
      align: 'horizontal'
    },
    
   
}



    };
    // get the div from the dom that we'll put the visualisation into
    container = document.getElementById('visjs');
    // create the visualisation
    visjsobj = new vis.Network(container, data, options);
} // end of initBlobVisData


