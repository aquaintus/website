Meteor.startup(function () {
  if (Contacts.find().count() === 0) {
    var contacts = [
      {
        name: "annie wanny",
        event: "park",
        location: "bermuda",
        date: "1 month",
        image: "http://placekitten.com/129/129",
        groups: ["ninja", "pussy", "quadrupedal"]
      },
      {
        name: "frida pida",
        event: "vet",
        location: "united kingdom",
        date: "3 weeks",
        image: "http://placekitten.com/128/128",
        groups: ["tom", "quadrupedal"]},
      {
        name: "lily milly",
        event: "laser light chase",
        location: "living room",
        date: "4 days",
        image: "http://placekitten.com/127/127",
        groups: ["pussy", "tripedal"]}
    ];

    for(i = 0; i < contacts.length; ++i) {
      Contacts.insert({
        name: contacts[i].name,
        event: contacts[i].event,
        location: contacts[i].location,
        date: contacts[i].date,
        image: contacts[i].image,
        groups: contacts[i].groups
      });

      // update groups accordingly
      groups = contacts[i].groups;

      for (j = 0; j < groups.length; ++j) {
        if (Groups.find({name: groups[i]}).count() === 0) {
          Groups.insert({name: groups[i]});
        }
      }
    }
  }
});
