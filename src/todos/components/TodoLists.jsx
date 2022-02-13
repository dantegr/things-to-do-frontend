import React, { Fragment, useState, useEffect } from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ReceiptIcon from "@material-ui/icons/Receipt";
import Typography from "@material-ui/core/Typography";
import DeleteIcon from "@material-ui/icons/Delete";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { CardActions, Button, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { TodoListForm } from "./TodoListForm";
import { v4 as uuidv4 } from "uuid";
import { debounce } from "lodash";

const useStyles = makeStyles({
  completed: {
    textAlign: "end",
  },
  listTitle: {
    paddingRight: "10px",
    width: "90px",
    "& span": {
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
  },
  deleteButton: {
    minWidth: "50px",
  },
  editButton: {
    minWidth: "35px",
  },
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getPersonalTodos = () => {
  return sleep(1000).then(() => Promise.resolve(getData()));
};

const getData = () => {
  return fetch("https://things-to-do-backend.herokuapp.com/todolist/list", {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  }).then(async (response) => {
    const data = await response.json();
    return data;
  });
};

export const TodoLists = ({ style }) => {
  const classes = useStyles();

  const [todoLists, setTodoLists] = useState({});
  const [activeList, setActiveList] = useState();
  const [tempListTitle, setTempListTitle] = useState("");
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [tempListIdToEdit, setTempListIdToEdit] = useState("");

  const delayedHandleChange = debounce(
    (eventData) => handleEditListCall(eventData),
    500
  );

  useEffect(() => {
    getPersonalTodos().then(setTodoLists);
  }, []);

  useEffect(() => {
    if (tempListIdToEdit !== "") {
      let existingLists = todoLists;

      existingLists[tempListIdToEdit].title = tempListTitle;
      delayedHandleChange(existingLists[tempListIdToEdit]);
      setTodoLists(existingLists);
    }
  }, [tempListTitle, tempListIdToEdit, todoLists, delayedHandleChange]);

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
    setTempListTitle("");
  };

  const handleOpenAddModal = () => {
    setOpenAddModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setTempListTitle("");
    setTempListIdToEdit("");
  };

  const handleOpenEditModal = (listId) => {
    setOpenEditModal(true);
    setTempListIdToEdit(listId);
    setTempListTitle(todoLists[listId].title);
  };

  const handleAddNewListCall = (list) => {
    fetch("https://things-to-do-backend.herokuapp.com/todolist/addlist", {
      method: "POST",
      body: JSON.stringify(list),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then(function (response) {
        if (response.ok) {
          return response.text();
        }
        throw new Error("Something went wrong.");
      })
      .then(function (text) {
        console.log("Request successful", text);
      })
      .catch(function (error) {
        console.log("Request failed", error);
      });
  };

  const handleDeleteListCall = (listId) => {
    fetch(
      "https://things-to-do-backend.herokuapp.com/todolist/list/" + listId,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    )
      .then(function (response) {
        if (response.ok) {
          return response.text();
        }
        throw new Error("Something went wrong.");
      })
      .then(function (text) {
        console.log("Request successful", text);
      })
      .catch(function (error) {
        console.log("Request failed", error);
      });
  };

  const handleEditListCall = (listItem) => {
    fetch(
      "https://things-to-do-backend.herokuapp.com/todolist/list/" + listItem.id,
      {
        method: "PUT",
        body: JSON.stringify(listItem),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    )
      .then(function (response) {
        if (response.ok) {
          return response.text();
        }
        throw new Error("Something went wrong.");
      })
      .then(function (text) {
        console.log("Request successful", text);
      })
      .catch(function (error) {
        console.log("Request failed", error);
      });
  };

  const handleAddNewList = () => {
    setOpenAddModal(true);

    let existingLists = todoLists;
    let tempId = uuidv4();
    let obj = {
      id: tempId,
      title: tempListTitle,
      todos: [],
    };
    existingLists[tempId] = obj;
    handleAddNewListCall(obj);
    setTodoLists(existingLists);
    setOpenAddModal(false);
    setTempListTitle("");
  };

  const handleDeleteList = (listId) => {
    let { [listId]: tmp, ...rest } = todoLists;
    setTodoLists(rest);
    handleDeleteListCall(listId);
  };

  //if (!Object.keys(todoLists).length) return null;
  return (
    <Fragment>
      <Card style={style}>
        <CardContent>
          <Typography component="h2">My Todo Lists</Typography>
          <List>
            {Object.keys(todoLists).map((key) => (
              <ListItem key={key} button onClick={() => setActiveList(key)}>
                <ListItemIcon>
                  <Button
                    size="small"
                    className={classes.editButton}
                    onClick={() => {
                      handleOpenEditModal(todoLists[key].id);
                    }}
                  >
                    <ReceiptIcon />
                  </Button>
                </ListItemIcon>
                <ListItemText
                  className={classes.listTitle}
                  primary={todoLists[key].title}
                />
                <ListItemText
                  className={classes.completed}
                  primary={
                    todoLists[key].todos.length > 0 &&
                    todoLists[key].todos.every((item) => item.done === true)
                      ? "Done!"
                      : ""
                  }
                />
                <Button
                  size="small"
                  color="secondary"
                  className={classes.deleteButton}
                  onClick={() => {
                    handleDeleteList(todoLists[key].id);
                  }}
                >
                  <DeleteIcon />
                </Button>
              </ListItem>
            ))}
          </List>
          <CardActions>
            <Button
              type="button"
              onClick={handleOpenAddModal}
              variant="contained"
              color="primary"
            >
              Add new list
            </Button>
          </CardActions>
        </CardContent>
      </Card>
      {todoLists[activeList] && (
        <TodoListForm
          key={activeList} // use key to make React recreate component to reset internal state
          todoList={todoLists[activeList]}
          saveTodoList={(id, { todos }) => {
            const listToUpdate = todoLists[id];
            setTodoLists({
              ...todoLists,
              [id]: { ...listToUpdate, todos },
            });
          }}
        />
      )}
      <Dialog open={openAddModal} onClose={handleCloseAddModal}>
        <DialogTitle>Add a new to-do list</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter a title for your new list.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="titleList"
            label="Title"
            type="text"
            fullWidth
            variant="standard"
            value={tempListTitle}
            onChange={(event) => {
              setTempListTitle(event.target.value);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddModal}>Cancel</Button>
          <Button onClick={handleAddNewList}>Add</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openEditModal} onClose={handleCloseEditModal}>
        <DialogTitle>Edit list</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Edit the title of the list. (Changes will be autosaved.)
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="titleList"
            label="Title"
            type="text"
            fullWidth
            variant="standard"
            value={tempListTitle}
            onChange={(event) => {
              setTempListTitle(event.target.value);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
};
