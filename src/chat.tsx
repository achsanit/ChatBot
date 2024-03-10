import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, LogBox } from 'react-native';
import { dialogflowConf } from "../dialogflowconf";
import { Dialogflow_V2 } from "../node_modules/react-native-dialogflow";

LogBox.ignoreLogs(['new NativeEventEmitter']); // Ignore log notification by message
LogBox.ignoreAllLogs();

interface Message {
  id: number;
  text: string;
  sender: string;
}

const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');

  // set configuration for dialogflow v2 and only once time
  useEffect(() => {
    Dialogflow_V2.setConfiguration(
      dialogflowConf.client_email,
      dialogflowConf.private_key,
      Dialogflow_V2.LANG_ENGLISH_US,
      dialogflowConf.project_id
    ); 
  },[]);

  // function for adding new message
  const addMessage = (message: string, sender: string, withPrev: boolean = true) => {
    const newMessage: Message = {
      id: Date.now(),
      text: message,
      sender: sender,
    };
    if (withPrev) {
      setMessages(prev => ([...prev,newMessage]));
    } else {
      setMessages(([...messages,newMessage]))
    }
  };

  // request message to dialogflow
  const requestMessage = (textQuery: string) => {
    try {
      // const result: string = await new Promise((resolve, reject) => {
      //   // Dialogflow_V2.requestQuery(
      //   //   textQuery, 
      //   //   (result:string)=> resolve(result), 
      //   //   (error: any)=> reject(error)
      //   // );
      // });

      Dialogflow_V2.requestQuery(
        textQuery, 
        (result:string)=> {
          const resultJson = JSON.parse(JSON.stringify(result));
          addMessage(resultJson.queryResult.fulfillmentText, 'Bot');
        }, 
        (error: any)=> console.log(error)
      );

      
    } catch (error) {
      addMessage('error get reply bot: ' + error, 'Bot');
    }
  };
 
  // on click send message
  const onSendMessage = () => {
    if (inputText.trim() === '') {
      return;
    };

    const query = inputText;

    addMessage(query, 'me');

    setInputText('');

    requestMessage(query);
    
  };

  // render message for each item of messages
  const renderMessage = ({item}: {item:Message}) => (
    <View>
      <View style={[styles.messageContainer, item.sender === 'me' ? styles.myMessage : styles.otherMessage]}>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Chat Screen</Text>
      </View>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        style={styles.messageList}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={onSendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#395a86',
    paddingVertical: 15,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  messageList: {
    flex: 1,
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
    maxWidth: '70%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#395a86',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#16181e',
  },
  messageText: {
    fontSize: 16,
    color: '#fff'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
    color: 'black', 
  },
  sendButton: {
    backgroundColor: '#395a86',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ChatScreen;