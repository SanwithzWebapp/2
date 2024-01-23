var channelToken = "LINE_ACCESS_TOKEN";
var apiKey = "GEMINI_API";

function replyMsg(replyToken, mess, channelToken) {
  var url = 'https://api.line.me/v2/bot/message/reply';
  var opt = {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + channelToken,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': replyToken,
      'messages': mess
    })
  };
  UrlFetchApp.fetch(url, opt);
}


function doPost(e) {
        var value = JSON.parse(e.postData.contents);
        var events = value.events;
        var event = events[0];
        var type = event.type;
        var replyToken = event.replyToken;
        var quoteToken = null;
    if (event.message && event.message.quoteToken) {
        quoteToken = event.message.quoteToken;
    }
        switch (type) {
          case 'follow':
            replyMsg(replyToken, mess, channelToken);
            break;
    case 'message':
        var messageType = event.message.type;
        if (messageType == "text") {
            gemini_pro(event, quoteToken);
        } else if (messageType == "image") {
            gemini_provision(event, quoteToken);
        } else {
            var mess = [{"type": "text", "text": "Hello world"}];
            replyMsg(replyToken, mess, channelToken);
        }
        break;
        }
}

function gemini_pro(event, quoteToken) {
    var userMessage = event.message.text;
    var replyToken = event.replyToken;
    var apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + apiKey;
    
var requestBody = {
    "contents": [
      {
        "role": "user",
        "parts": [
          {
            "text": userMessage
          }
        ]
      }
    ],
    "generationConfig": {
      "temperature": 0.9,
      "topK": 1,
      "topP": 1,
      "maxOutputTokens": 2048,
      "stopSequences": []
    }
  };
  
   var options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(requestBody)
  };

    var response = UrlFetchApp.fetch(apiUrl, options);
    var responseData = JSON.parse(response.getContentText());

    var textResult = responseData.candidates[0].content.parts[0].text;
    var mess = [{"type": "text", "text": textResult.toString()}];

    if (quoteToken) {
        mess[0]["quoteToken"] = quoteToken;
    }

    replyMsg(replyToken, mess, channelToken);
}


function gemini_provision(event, quoteToken) {
  var messageId = event.message.id;
  var replyToken = event.replyToken;
  var url = "https://api-data.line.me/v2/bot/message/"+messageId+"/content";
  var headers = {
    "headers":{"Authorization": "Bearer "+channelToken}
  };
  var getcontent = UrlFetchApp.fetch(url, headers);
  var imageBlob = getcontent.getBlob();
  var encodedImage = Utilities.base64Encode(imageBlob.getBytes());
  var apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=' + apiKey;
  var payload = {
    "contents": [
      {
        "parts": [
          {
            "text": "ช่วยบรรยายภาพนี้ให้หน่อย"
          },
          {
            "inlineData": {
              "mimeType": "image/jpeg",
              "data": encodedImage
            }
          }
        ]
      }
    ],
    "generationConfig": {
      "temperature": 0.4,
      "topK": 32,
      "topP": 1,
      "maxOutputTokens": 4096,
      "stopSequences": []
    },
    "safetySettings": [
      {
        "category": "HARM_CATEGORY_HARASSMENT",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        "category": "HARM_CATEGORY_HATE_SPEECH",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
      }
    ]
  };

  var options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(payload)
  };

    var response = UrlFetchApp.fetch(apiUrl, options);
    var responseData = JSON.parse(response.getContentText());
    var textResult = responseData.candidates[0].content.parts[0].text;
    var mess = [{"type": "text", "text": textResult.toString()}];

    if (quoteToken) {
        mess[0]["quoteToken"] = quoteToken;
    }

    replyMsg(event.replyToken, mess, channelToken);
}
