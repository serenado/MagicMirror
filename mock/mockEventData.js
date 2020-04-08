var EVENTS = [
  {
    "kind": "calendar#event",
    "id": "event1",
    "status": "confirmed", // "confirmed", "tentative", or "cancelled"
    "summary": "Lecture",
    "description": "Test description wow look amazing.",
    "location": "zoooooom",
    "colorId": "1",
    "start": {
      "date": null,
      "dateTime": "2020-04-07T11:00:00-05:00",
      "timeZone": null
    },
    "end": {
      "date": null,
      "dateTime": "2020-04-07T12:30:00-05:00",
      "timeZone": null
    },
    // TODO: understand how recurring events work
    // "recurrence": [
    //   string
    // ],
    // "recurringEventId": string,
    // "originalStartTime": {
    //   "date": date,
    //   "dateTime": datetime,
    //   "timeZone": string
    // },
    "transparency": "opaque", // "opaque" or "transparent"
    // TODO: worry about displaying attendees later
    // "attendees": [
    //   {
    //     "id": string,
    //     "email": string,
    //     "displayName": string,
    //     "organizer": boolean,
    //     "self": boolean,
    //     "resource": boolean,
    //     "optional": boolean,
    //     "responseStatus": string,
    //     "comment": string,
    //     "additionalGuests": integer
    //   }
    // ],
    // "attendeesOmitted": boolean,
    "locked": false, // TODO: handle case where locked is true?
    // TODO: alarm icon if reminder is set
    // "reminders": {
    //   "useDefault": boolean,
    //   "overrides": [
    //     {
    //       "method": string,
    //       "minutes": integer
    //     }
    //   ]
    // },
    // TODO: paperclip icon if there are attachments?
    // "attachments": [
    //   {
    //     "fileUrl": string,
    //     "title": string,
    //     "mimeType": string,
    //     "iconLink": string,
    //     "fileId": string
    //   }
    // ]
  }, {
    "kind": "calendar#event",
    "id": "event2",
    "status": "confirmed", // "confirmed", "tentative", or "cancelled"
    "summary": "Very Important Meeting",
    "description": "Test description wow look amazing.",
    "location": "zoooooom",
    "colorId": "2",
    "start": {
      "date": null,
      "dateTime": "2020-04-07T13:00:00-05:00",
      "timeZone": null
    },
    "end": {
      "date": null,
      "dateTime": "2020-04-07T13:30:00-05:00",
      "timeZone": null
    },
    "transparency": "opaque", // "opaque" or "transparent"
    "locked": false
  }, {
    "kind": "calendar#event",
    "id": "event3",
    "status": "confirmed", // "confirmed", "tentative", or "cancelled"
    "summary": "Snack Break",
    "description": "Test description wow look amazing.",
    "location": "kitchen",
    "colorId": "3",
    "start": {
      "date": null,
      "dateTime": "2020-04-07T13:30:00-05:00",
      "timeZone": null
    },
    "end": {
      "date": null,
      "dateTime": "2020-04-07T14:30:00-05:00",
      "timeZone": null
    },
    "transparency": "opaque", // "opaque" or "transparent"
    "locked": false
  }, {
    "kind": "calendar#event",
    "id": "event4",
    "status": "confirmed", // "confirmed", "tentative", or "cancelled"
    "summary": "Recitation",
    "description": "Test description wow look amazing.",
    "location": "zoooooom",
    "colorId": "4",
    "start": {
      "date": null,
      "dateTime": "2020-04-07T15:30:00-05:00",
      "timeZone": null
    },
    "end": {
      "date": null,
      "dateTime": "2020-04-07T16:00:00-05:00",
      "timeZone": null
    },
    "transparency": "opaque", // "opaque" or "transparent"
    "locked": false
  }
]