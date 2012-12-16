// Lists -- {name: String}
Lists = new Meteor.Collection("lists");

// Publish complete set of lists to all clients.
Meteor.publish('lists', function () {
  return Lists.find();
});


// Contacts -- {text: String,
//           done: Boolean,
//           tags: [String, ...],
//           list_id: String,
//           timestamp: Number}
Contacts = new Meteor.Collection("contacts");

// Publish all items for requested list_id.
Meteor.publish('contacts', function (list_id) {
  return Contacts.find({list_id: list_id});
});

