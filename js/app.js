let page = null;
var $$ = Dom7;

var LGTVoted = localStorage.getItem("lgtvoted") ? true : false;
var LSBVoted = localStorage.getItem("lsbvoted") ? true : false;

var lead = 'http://localhost:3000/'

var app = new Framework7({
  root: '#app',
  autoDarkTheme: true,
  // theme: 'ios',
  routes: [
    {
      name: 'home',
      path: '/',
      url: '/'
    },
    {
      name: 'timeline',
      path: '/timeline/',
      url: './pages/timeline.html'
    },
    {
      name: 'vote-lgt',
      path: '/vote-lgt/',
      url: './pages/vote-lgt.html'
    },
    {
      name: 'vote-lsb',
      path: '/vote-lsb/',
      url: './pages/vote-lsb.html'
    }
  ],
  toolbar: {
    hideOnPageScroll: true,
  },

  on: {
    init: function () {
      $$(document).on('page:afterin', function (e, page) {
        // console.log(page)
        let name = page.route.name;
      
        // Vote confirmation.
        if (name === 'vote-lgt' || name === 'vote-lsb') {
          if ((LGTVoted && name === 'vote-lgt') || (LSBVoted && name === 'vote-lsb')) {
            app.dialog.alert("You've already voted on this! You may only vote once.", "Error");
            app.views.main.router.navigate({ name: 'home' })
          }

          $$("#next").on('click', function (e) {
            vote(name);
          })
        }
      })
    }
  }
});

var mainView = app.views.create('.view-main');

function vote(name) {
  picked = $$("input:checked").attr("value");
  if (picked === undefined) {
    app.dialog.alert("You haven't selected a candidate from the list.", "Error");
  } else {
    app.dialog.confirm("Are you sure you want to pick \"" + picked + "\"?", "Confirm", function () {
      // send data for vote
      app.preloader.show();

      app.request.promise.post(lead + 'vote', { "v": name, "p": picked, })
        .then(function(res) {
          // Lock       
          localStorage.setItem(name === "vote-lgt" ? "lgtvoted" : "lsbvoted", true);
  
          if (name === "vote-lgt") {
            LGTVoted = true;
          } else {
            LSBVoted = true;
          }
  
          // Loading is done
          app.preloader.hide();
        })
        .catch(function (res) {
          // Loading is "done"
          app.preloader.hide();

          // Alert.
          if (res.status === 403) {
            app.dialog.alert("Voting isn't open right now!", "Vote failed!")
          } else if (res.status === 410) {
            app.dialog.alert("Voting has ended.", "Vote failed!")
          } else {
            app.dialog.alert("There was an error voting: (" + res.status.toString() + ") " + res.message, "Vote failed!")
          }
        })
      
      // Go home
      app.views.main.router.navigate({ name: 'home' });
    })
  }
}
