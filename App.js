import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  StatusBar, 
  Platform,
  ScrollView,
  FlatList,
  // TextInput,
  // Button,
  KeyboardAvoidingView,
  AsyncStorage,
  TouchableOpacity,
} from 'react-native';

import {
  // SearchBarをインポート
  SearchBar,
  // InputとButtonをインポート
  Input,
  Button,
  // ListItemをインポート
  ListItem,
} from 'react-native-elements';

// react-native-iphone-x-helper からifIphoneXとgetStatusBarHeightをインポート
import { ifIphoneX, getStatusBarHeight } from 'react-native-iphone-x-helper'

// ButtonのアイコンをFeatherから利用
import Icon from 'react-native-vector-icons/Feather';
// Doneボタンのインポート
import Icon2 from 'react-native-vector-icons/MaterialIcons';

// const STATUSBAR_HEIGHT = Platform.OS == 'ios' ? 20 : StatusBar.currentHeight;
// OS毎の処理を getStatusBarHeightに置き換え
const STATUSBAR_HEIGHT = getStatusBarHeight()
const TODO = "@todoapp.todo"

const TodoItem = (props) => {
  let icon = null
  if(props.done === true){
    icon = <Icon2 name="done" />
  }
  return (
    <TouchableOpacity onPress={props.onTapTodoItem}>
      <ListItem
        title={props.title}
        rightIcon={icon}
        bottomDivider
      />
    </TouchableOpacity>
  )
}

// const TodoItem = (props) => {
//   let textStyle = styles.TodoItem
//   if(props.done === true) {
//     textStyle = styles.todoItemDone
//   }
//   return (
//     <TouchableOpacity onPress={props.onTapTodoItem}>
//       <Text style={textStyle}>{props.title}</Text>
//     </TouchableOpacity>
//   )
// }

export default class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      todo: [],
      currentIndex: 0,
      inputText: "",
      filterText: "",
    }
  }

  componentDidMount() {
    this.loadTodo()
  }

  loadTodo = async () => {
    try {
      const todoString = await AsyncStorage.getItem(TODO)
      if(todoString){
        const todo = JSON.parse(todoString)
        const currentIndex = todo.length
        this.setState({todo: todo, currentIndex: currentIndex})
      }
    }
    catch (e) {
      console.log(e)
    }
  }

  saveTodo = async (todo) => {
    try {
      const todoString = JSON.stringify(todo)
      await AsyncStorage.setItem(TODO,todoString)
    }
    catch (e) {
      console.log(e)
    }
  }

  onAddItem = () => {
    const title = this.state.inputText
    if(title == ""){
      return
    }
    const index = this.state.currentIndex + 1
    const newTodo = {index: index, title: title, done: false}
    const todo = [...this.state.todo, newTodo]
    this.setState({
      todo: todo,
      currentIndex: index,
      inputText: ""
    })

    this.saveTodo(todo)
  }

  onTapTodoItem = (todoItem) => {
    const todo = this.state.todo
    const index = todo.indexOf(todoItem)
    todoItem.done = !todoItem.done
    todo[index] = todoItem
    this.setState({todo: todo})
    this.saveTodo(todo)
  }

  render() {
    const filterText = this.state.filterText
    let todo = this.state.todo
    if(filterText !== "") {
      todo = todo.filter(t => t.title.includes(filterText))
    }
    // SearchBarのplatformを決定
    const platform = Platform.OS =='ios' ? 'ios' : 'android'
    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        {/* SearchBar実装 */}
        <SearchBar
          platform = {platform}
          cancelButtonTitle = "Cancel"
          onChangeText = {(text) => this.setState({filterText: text})}
          onClear = {() => this.setState({filterText: ""})}
          value = {this.state.filterText}
          placeholder = "Type filter text"
        />
        {/* <View style={styles.filter}>
          <TextInput
            onChangeText={(text) => this.setState({filterText: text})}
            value={this.state.filterText}
            style={styles.inputText}
            placeholder="Type filter text"
          />
        </View> */}
        <ScrollView style={styles.todolist}>
          <FlatList data={todo}
            extraData={this.state}
            renderItem={({item}) =>
              <TodoItem
                title={item.title}
                done={item.done}
                onTapTodoItem={() => this.onTapTodoItem(item)}
              /> 
            }
            keyExtractor={(item, index) => "todo_"+item.index}
          />
        </ScrollView>
        <View style={styles.input}>
          <Input
            onChangeText={(text) => this.setState({inputText: text})}
            value={this.state.inputText}
            containerStyle={styles.inputText}
            // placeholder="Type your todo"
          />
          <Button
            icon = {
              <Icon
                name = 'plus'
                size = {38}
                color = 'white'
              />
            }
            onPress={this.onAddItem}
            title=""
            // color="#841584"
            buttonStyle={styles.inputButton}
          />
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: STATUSBAR_HEIGHT,
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  filter: {
    height: 30,
  },
  todolist: {
    flex: 1,
  },
  // ifIphoneXを使って高さとpaddingBottomを変更
  input: {
    ...ifIphoneX({
      paddingBottom: 30,
      height: 80
    }, {
      height: 50
    }),
    height: 70,
    flexDirection: 'row',
    paddingRight: 10,
  },
  inputText: {
    paddingLeft: 10,
    paddingRight: 10,
    flex: 1,
  },
  inputButton: {
    width: 48,
    height: 48,
    borderWidth: 0,
    borderColor: 'transparent',
    borderRadius: 48,
    backgroundColor: '#ff6347',
  },
  todoItem: {
    fontSize: 20,
    backgroundColor: "white",
  },
  todoItemDone: {
    fontSize: 20,
    backgroundColor: "red",
  },
});
