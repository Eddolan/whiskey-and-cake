Meteor.methods({

  getTimesData: function(){

    // function to take a date and return it in the right string format
    var dateToString = function(inputDate){
      var year = inputDate.getFullYear();
      var month = ''+inputDate.getMonth();
      if (month.length === 1){
        month = '0' + month;
      }
      var day  = ''+inputDate.getDate();
      if (day.length === 1){
        day = '0' + day
      }
      return ''+year+month+day;
    };

    // generate a random date between start and end
    var genDate = function(start, end) {
      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    };

    // Get random decades for the choices
    var getRandDecades = function(chosenDate){
      var result = [];
      var randN;
      var decades = ['1850','1860','1870','1880','1890','1900','1910','1920','1930','1940','1950','1960','1970','1980','1990'];
      var year = '' + chosenDate.getFullYear();
      year = year.split('');
      year[3] = '0';
      result.push(year.join(''));
      while (result.length < 10){
        randN = Math.floor((Math.random() * decades.length));
        if (result.indexOf(decades[randN]) === -1){
          result.push(decades[randN]);
        }
      }
      return result.sort();
    };

    // function to get the articles
    var getArticles = function(){
      var startDate = new Date(1851, 8, 19);
      var endDate = new Date(1999,12,31);
      // getting random date
      var randDate = genDate(startDate, endDate);
      // converting to string
      var randomDate = dateToString(randDate);
      var parsedArticles = [];

      // turning aync call to a sync
      var syncCall= Meteor.wrapAsync(HTTP.call);
      // querying api
      var data = syncCall('GET', "http://api.nytimes.com/svc/search/v2/articlesearch.json?begin_date="+randomDate+"&end_date="+randomDate+"&api-key=654452f497823c3cdae2119e3bdd6b4f:9:71687614");
      // looping through results to only find ones with valid lead paragraphs
      for (var i = 0; i < data.data.response.docs.length; i++){
        if (data.data.response.docs[i].lead_paragraph && parsedArticles.length < 5){
          parsedArticles.push(data.data.response.docs[i].lead_paragraph);
        }
      }
      return {'results': parsedArticles, 'chosen': randDate, 'choices': getRandDecades(randDate)};
    };

  var data = getArticles();
  var id =  TimesHistorianData.insert(data);
  // should be returning id, but see the bug documentation client side
  return data;

  }
})

Meteor.publish("TimesHistorianData", function() {
  return TimesHistorianData.find();
});
