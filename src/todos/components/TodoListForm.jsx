import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { makeStyles } from "@material-ui/styles";
import {
  TextField,
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";
import Checkbox from "@material-ui/core/Checkbox";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import DatePicker from "@mui/lab/DesktopDatePicker";
import { debounce } from "lodash";

const useStyles = makeStyles({
  card: {
    margin: "1rem",
  },
  eachItem: {
    border: "1px solid #E8E8E8",
    borderRadius: "5px",
    padding: "5px",
    paddingBottom: "25px",
    marginBottom: "5px",
  },
  todoLine: {
    display: "flex",
    alignItems: "center",
  },
  todoLine2: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
  },
  textField: {
    flexGrow: 1,
  },
  strikeThrough: {
    flexGrow: 1,
    textDecoration: "line-through",
  },
  standardSpace: {
    margin: "8px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
  },
  daysRemainingText: {
    marginLeft: "10px",
    width: "200px",
  },
});

export const TodoListForm = ({ todoList, saveTodoList }) => {
  const classes = useStyles();
  const [todos, setTodos] = useState(todoList.todos);
  const [updatingDelete, setUpdatingDelete] = useState(false);
  const [updatingCheckbox, setUpdatingCheckbox] = useState(false);
  const [updatingNewItem, setUpdatingNewItem] = useState(false);
  const [updatingTodo, setUpdatingTodo] = useState(false);
  const [updatingDate, setUpdatingDate] = useState(false);

  const delayedHandleChange = debounce(
    (listId, todos) => handleUpdateAllItems(listId, todos),
    500
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    saveTodoList(todoList.id, { todos });
    handleUpdateAllItems(todoList.id, todos);
  };

  const handleUpdateCheckBox = (index) => {
    setTodos(
      todos.map((el, i) => {
        if (i === index) {
          el.done = !el.done;
        }
        return el;
      })
    );
    setUpdatingCheckbox(true);
  };

  const handleUpdateTodo = (event, index) => {
    setTodos(
      todos.map((el, i) => {
        if (i === index) {
          el.todo = event.target.value;
        }
        return el;
      })
    );
    setUpdatingTodo(true);
  };

  const handleUpdateDate = (value, index) => {
    setTodos(
      todos.map((el, i) => {
        if (i === index) {
          el.completionDate = value;
        }
        return el;
      })
    );
    setUpdatingDate(true);
  };

  const handleDeleteItem = (ind) => {
    console.log(todos);

    setTodos(todos.filter((item, index) => index !== ind));
    setUpdatingDelete(true);
  };

  const handleAddNewItem = () => {
    var nowDate = new Date();
    var existingItems = [
      ...todos,
      {
        id: uuidv4(),
        todo: "",
        done: false,
        completionDate: nowDate.toJSON(),
      },
    ];
    setTodos(existingItems);
    setUpdatingNewItem(true);
  };

  const getTimeDifference = (itemTime) => {
    var itemDate = new Date(itemTime);
    var nowDate = new Date();

    var timeDifference = itemDate.getTime() - nowDate.getTime();

    var dayDifference = Math.round(timeDifference / (1000 * 3600 * 24));

    if (dayDifference < 0) {
      return Math.abs(dayDifference) + " days overdue.";
    } else if (dayDifference > 0) {
      return dayDifference + " days remaining.";
    } else if (dayDifference === 0) {
      return "The completion date is today.";
    }
    return dayDifference;
  };

  const handleUpdateAllItems = (listId, todos) => {
    fetch(
      "https://things-to-do-backend.herokuapp.com/todolist/list/" +
        listId +
        "/todo/update",
      {
        method: "PUT",
        body: JSON.stringify(todos),
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

  useEffect(() => {
    if (updatingDate) {
      saveTodoList(todoList.id, { todos });
      setUpdatingDate(false);
    }
  }, [updatingDate, setUpdatingDate, todoList, todos, saveTodoList]);

  useEffect(() => {
    if (updatingTodo) {
      saveTodoList(todoList.id, { todos });
      setUpdatingTodo(false);
    }
  }, [updatingTodo, setUpdatingTodo, todoList, todos, saveTodoList]);

  useEffect(() => {
    if (updatingNewItem) {
      saveTodoList(todoList.id, { todos });
      setUpdatingNewItem(false);
    }
  }, [updatingNewItem, setUpdatingNewItem, todoList, todos, saveTodoList]);

  useEffect(() => {
    if (updatingCheckbox) {
      saveTodoList(todoList.id, { todos });
      setUpdatingCheckbox(false);
    }
  }, [updatingCheckbox, setUpdatingCheckbox, todoList, todos, saveTodoList]);

  useEffect(() => {
    if (updatingDelete) {
      saveTodoList(todoList.id, { todos });
      setUpdatingDelete(false);
    }
  }, [updatingDelete, setUpdatingDelete, todoList, todos, saveTodoList]);

  useEffect(() => {
    delayedHandleChange(todoList.id, todos);
  }, [todos, todoList, delayedHandleChange]);

  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography component="h2">{todoList.title}</Typography>
        <form onSubmit={handleSubmit} className={classes.form}>
          {todos.map((item, index) => (
            <div className={classes.eachItem} key={index}>
              <div className={classes.todoLine}>
                <Checkbox
                  className={classes.standardSpace}
                  checked={item.done}
                  onChange={() => {
                    handleUpdateCheckBox(index);
                  }}
                  color="primary"
                />
                <Typography className={classes.standardSpace} variant="h6">
                  {index + 1}
                </Typography>
                <TextField
                  label="What to do?"
                  value={item.todo}
                  onChange={(event) => handleUpdateTodo(event, index)}
                  className={
                    item.done ? classes.strikeThrough : classes.textField
                  }
                />

                <Button
                  size="small"
                  color="secondary"
                  className={classes.standardSpace}
                  onClick={() => {
                    handleDeleteItem(index);
                  }}
                >
                  <DeleteIcon />
                </Button>
              </div>
              <div className={classes.todoLine2}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Completion Date"
                    inputFormat="MM/dd/yyyy"
                    value={item.completionDate}
                    onChange={(value) => {
                      handleUpdateDate(value, index);
                    }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </LocalizationProvider>
                <div className={classes.daysRemainingText}>
                  {getTimeDifference(item.completionDate)}
                </div>
              </div>
            </div>
          ))}
          <CardActions>
            <Button
              type="button"
              color="primary"
              onClick={() => {
                handleAddNewItem();
              }}
            >
              Add Todo <AddIcon />
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Save
            </Button>
          </CardActions>
        </form>
      </CardContent>
    </Card>
  );
};
